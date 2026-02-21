//go:build linux
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

    // ss -tupn: TCP/UDP with PID/program name
    cmd := exec.Command("ss", "-tupn")
    out, err := cmd.Output()
    if err != nil {
        return snap, fmt.Errorf("ss failed: %w", err)
    }

    scanner := bufio.NewScanner(strings.NewReader(string(out)))
    for scanner.Scan() {
        line := scanner.Text()
        if !strings.Contains(line, "users:") {
            continue
        }

        // Parse: LISTEN 0 128 *:80 *:* users:(("nginx",pid=1234,fd=6))
        parts := strings.Split(line, " users:")
        if len(parts) != 2 {
            continue
        }

        // Extract local/remote from ss output (before users:)
        // ss -tupn columns: Netid State Recv-Q Send-Q LocalAddr:Port PeerAddr:Port
        fields := strings.Fields(parts[0])
        if len(fields) < 6 {
            continue
        }

        laddr := fields[4]
        raddr := fields[5]
        status := normSSState(fields[1])

        // Extract PID/program from users:((...))
        users := parts[1]
        pidStr := extractPID(users)
        pid, _ := strconv.Atoi(pidStr)

        procName := "unknown"
        if pid > 0 {
            if p, err := process.NewProcess(int32(pid)); err == nil {
                procName, _ = p.Name()
            }
        }

        snap.Connections = append(snap.Connections, models.NetConnection{
            PID:         int32(pid),
            ProcessName: procName,
            Family:      "ipv4", // ss default; parse *:* vs IPv6 later
            Type:        "tcp",  // ss -t only for now
            Laddr:       laddr,
            Raddr:       raddr,
            Status:      status,
        })
    }

    return snap, nil
}

// normSSState maps ss abbreviated states to standard names used in filters.
func normSSState(s string) string {
    switch s {
    case "ESTAB":
        return "ESTABLISHED"
    case "TIME-WAIT":
        return "TIME_WAIT"
    case "SYN-SENT":
        return "SYN_SENT"
    case "SYN-RECV":
        return "SYN_RECV"
    case "FIN-WAIT-1":
        return "FIN_WAIT1"
    case "FIN-WAIT-2":
        return "FIN_WAIT2"
    case "CLOSE-WAIT":
        return "CLOSE_WAIT"
    default:
        return s
    }
}

func extractPID(users string) string {
    // users:(("nginx",pid=1234,fd=6))
    start := strings.Index(users, "pid=")
    if start == -1 {
        return "0"
    }
    start += 4
    end := strings.IndexByte(users[start:], ',')
    if end == -1 {
        end = strings.IndexByte(users[start:], ')')
    }
    if end == -1 {
        return "0"
    }
    return users[start : start+end]
}
