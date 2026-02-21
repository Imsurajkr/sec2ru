package collector

import (
    "log"
    "runtime"
    "sort"
    "time"

    "github.com/imsurajkr/sec2ru/internal/models"
    "github.com/shirou/gopsutil/v4/cpu"
    "github.com/shirou/gopsutil/v4/disk"
    "github.com/shirou/gopsutil/v4/mem"
    "github.com/shirou/gopsutil/v4/net"
    "github.com/shirou/gopsutil/v4/process"
)

const maxProcesses = 25

// CollectSystem gathers machine-wide metrics.
// gopsutil handles Windows/Linux transparently — no #ifdef needed.
func CollectSystem() (*models.SystemSnapshot, error) {
    snap := &models.SystemSnapshot{Timestamp: time.Now().UnixMilli()}

    // CPU
    percents, err := cpu.Percent(0, false)
    if err == nil && len(percents) > 0 {
        snap.CPUPercent = percents[0]
    }

    // Memory
    vm, err := mem.VirtualMemory()
    if err == nil {
        snap.MemUsed    = vm.Used
        snap.MemTotal   = vm.Total
        snap.MemPercent = vm.UsedPercent
    }

    // Disk — root on Linux, C:\ on Windows
    diskPath := "/"
    if runtime.GOOS == "windows" {
        diskPath = `C:\`
    }
    du, err := disk.Usage(diskPath)
    if err == nil {
        snap.DiskUsed    = du.Used
        snap.DiskTotal   = du.Total
        snap.DiskPercent = du.UsedPercent
    }

    // Network I/O — aggregate across all interfaces
    io, err := net.IOCounters(false)
    if err == nil && len(io) > 0 {
        snap.NetBytesSent = io[0].BytesSent
        snap.NetBytesRecv = io[0].BytesRecv
    }

    return snap, nil
}

// CollectProcesses returns top N processes sorted by CPU desc.
func CollectProcesses() (*models.ProcessSnapshot, error) {
    procs, err := process.Processes()
    if err != nil {
        return nil, err
    }

    var results []models.Process
    for _, p := range procs {
        name, _    := p.Name()
        cpuPct, _  := p.CPUPercent()
        memInfo, _ := p.MemoryInfo()
        memPct, _  := p.MemoryPercent()
        statuses, _ := p.Status()
        exe, _     := p.Exe()

        proc := models.Process{
            PID:        p.Pid,
            Name:       name,
            CPUPercent: cpuPct,
            MemPercent: memPct,
            Status:     firstOrUnknown(statuses),
            Exe:        exe,
        }
        if memInfo != nil {
            proc.MemRSS = memInfo.RSS
        }
        results = append(results, proc)
    }

    sort.Slice(results, func(i, j int) bool {
        return results[i].CPUPercent > results[j].CPUPercent
    })
    if len(results) > maxProcesses {
        results = results[:maxProcesses]
    }

    return &models.ProcessSnapshot{
        Timestamp: time.Now().UnixMilli(),
        Processes: results,
    }, nil
}

func firstOrUnknown(s []string) string {
    if len(s) == 0 { return "unknown" }
    return s[0]
}

// Start runs the collection loop, pushing into sysCh and procCh until stop closes.
func Start(interval time.Duration,
    sysCh  chan<- *models.SystemSnapshot,
    procCh chan<- *models.ProcessSnapshot,
    stop   <-chan struct{}) {

    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    log.Printf("[collector] started | interval=%s", interval)

    for {
        select {
        case <-ticker.C:
            if snap, err := CollectSystem(); err == nil {
                sysCh <- snap
            } else {
                log.Printf("[collector] system err: %v", err)
            }
            if psnap, err := CollectProcesses(); err == nil {
                procCh <- psnap
            } else {
                log.Printf("[collector] process err: %v", err)
            }
        case <-stop:
            log.Println("[collector] stopped")
            return
        }
    }
}
