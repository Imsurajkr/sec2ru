package models

// SystemSnapshot holds one point-in-time reading of the whole machine.
type SystemSnapshot struct {
    Timestamp    int64   `json:"ts"`
    CPUPercent   float64 `json:"cpu_percent"`
    MemUsed      uint64  `json:"mem_used"`
    MemTotal     uint64  `json:"mem_total"`
    MemPercent   float64 `json:"mem_percent"`
    DiskUsed     uint64  `json:"disk_used"`
    DiskTotal    uint64  `json:"disk_total"`
    DiskPercent  float64 `json:"disk_percent"`
    NetBytesSent uint64  `json:"net_bytes_sent"`
    NetBytesRecv uint64  `json:"net_bytes_recv"`
}

// Process holds per-process metrics.
type Process struct {
    PID        int32   `json:"pid"`
    Name       string  `json:"name"`
    CPUPercent float64 `json:"cpu_percent"`
    MemRSS     uint64  `json:"mem_rss_bytes"`
    MemPercent float32 `json:"mem_percent"`
    Status     string  `json:"status"`
    Exe        string  `json:"exe,omitempty"`
}

// ProcessSnapshot is a full process list at a single timestamp.
type ProcessSnapshot struct {
    Timestamp int64     `json:"ts"`
    Processes []Process `json:"processes"`
}

// SpikeEvent represents a detected anomaly.
type SpikeEvent struct {
    Timestamp  int64     `json:"ts"`
    CPUPercent float64   `json:"cpu_percent"`
    MemPercent float64   `json:"mem_percent"`
    TopProcs   []Process `json:"top_processes"`
    Reason     string    `json:"reason"`
}

// ── Network connections ──────────────────────────────────────────────

type NetConnection struct {
    PID         int32   `json:"pid"`
    ProcessName string  `json:"process_name"`
    Family      string  `json:"family"`        // "ipv4", "ipv6", "unix"
    Type        string  `json:"type"`          // "tcp", "udp"
    Laddr       string  `json:"local_addr"`    // "127.0.0.1:80"
    Raddr       string  `json:"remote_addr"`   // "8.8.8.8:53" or "*" for LISTEN
    Status      string  `json:"status"`        // "ESTABLISHED", "LISTEN", "TIME_WAIT"
}

type NetConnectionSnapshot struct {
    Timestamp int64            `json:"ts"`
    Connections []NetConnection `json:"connections"`
}