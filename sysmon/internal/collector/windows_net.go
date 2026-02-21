//go:build windows
package collector

import (
    "bufio"
    "fmt"
    "os/exec"
    "strconv"
    "strings"
	"time"
	
	"github.com/imsurajkr/sec2ru/internal/models"
    "github.com/shirou/gopsutil/v4/process"
)

func collectNetConnections() (*models.NetConnectionSnapshot, error) {
    snap := &models.NetConnectionSnapshot{Timestamp: time.Now().UnixMilli()}

    // netstat -ano gives PID for each connection
    cmd := exec.Command("netstat", "-ano")
    out, err := cmd.Output()
    if err != nil {
        return snap, fmt.Errorf("netstat failed: %w", err)
    }

    scanner := bufio.NewScanner(strings.NewReader(string(out)))
    for scanner.Scan() {
        line := scanner.Text()
        fields := strings.Fields(line)

        if len(fields) < 4 {
            continue // skip empty lines and "Active Connections" banner
        }

        // Only process lines that start with a known protocol; this skips the
        // column-header line ("Proto  Local Address  Foreign Address  State  PID")
        // which would otherwise pass the length check.
        proto := strings.ToLower(fields[0])
        isTCP := strings.HasPrefix(proto, "tcp")
        isUDP := strings.HasPrefix(proto, "udp")
        if !isTCP && !isUDP {
            continue
        }

        // Detect address family from the protocol variant name (TCPv6 / UDPv6).
        family := "ipv4"
        if strings.HasSuffix(proto, "v6") {
            family = "ipv6"
        }

        var laddr, raddr, status, pidStr string

        if isTCP {
            // TCP/TCPv6: Proto LocalAddress ForeignAddress State PID  (5 fields)
            if len(fields) < 5 {
                continue
            }
            laddr  = fields[1]
            raddr  = fields[2]
            status = fields[3]
            pidStr = fields[4]
            // Normalize Windows "LISTENING" to "LISTEN" so it matches the
            // AppSummary handler's listen-port check (c.Status == "LISTEN").
            if status == "LISTENING" {
                status = "LISTEN"
            }
        } else {
            // UDP/UDPv6: Proto LocalAddress ForeignAddress PID  (4 fields, no State)
            laddr  = fields[1]
            raddr  = fields[2]
            status = "LISTEN" // UDP sockets are always in "listening" state
            pidStr = fields[3]
        }

        pid, _ := strconv.Atoi(pidStr)
        procName := fmt.Sprintf("pid-%d", pid)

        if pid > 0 {
            if p, err := process.NewProcess(int32(pid)); err == nil {
                procName, _ = p.Name()
            }
        }

        snap.Connections = append(snap.Connections, models.NetConnection{
            PID:         int32(pid),
            ProcessName: procName,
            Family:      family,
            Type:        proto,
            Laddr:       laddr,
            Raddr:       raddr,
            Status:      status,
        })
    }

    return snap, nil
}
