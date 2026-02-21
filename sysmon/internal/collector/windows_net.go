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

        if len(fields) < 5 || fields[3] == "LISTENING" {
            continue // header or non-listening
        }

        // Parse: Proto LocalAddress ForeignAddress State PID
        if len(fields) < 5 {
            continue
        }

        proto := fields[0] // TCP, UDP
        laddr := fields[1] // 0.0.0.0:80
        raddr := fields[2] // *:*
        status := fields[3]
        pidStr := fields[4]

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
            Family:      "ipv4", // netstat default
            Type:        strings.ToLower(proto),
            Laddr:       laddr,
            Raddr:       raddr,
            Status:      status,
        })
    }

    return snap, nil
}
