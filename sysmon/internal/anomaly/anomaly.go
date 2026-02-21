package anomaly

import (
    "sync"
    "time"

    "github.com/imsurajkr/sec2ru/internal/models"
)

const (
    windowSize  = 150            // ~5 min at 2s interval
    cpuAbsolute = 85.0           // always a spike above this
    cpuRelative = 1.30           // 30% above rolling average
    cooldown    = 30 * time.Second
)

type Detector struct {
    mu        sync.Mutex
    cpuWindow []float64
    lastSpike time.Time
}

func NewDetector() *Detector { return &Detector{} }

// Evaluate returns a SpikeEvent if a spike is detected, else nil.
func (d *Detector) Evaluate(sys *models.SystemSnapshot, procs *models.ProcessSnapshot) *models.SpikeEvent {
    d.mu.Lock()
    defer d.mu.Unlock()

    d.cpuWindow = append(d.cpuWindow, sys.CPUPercent)
    if len(d.cpuWindow) > windowSize {
        d.cpuWindow = d.cpuWindow[1:]
    }
    if len(d.cpuWindow) < 10 {
        return nil // warm-up
    }

    rollingAvg := avg(d.cpuWindow[:len(d.cpuWindow)-1])
    isSpike := sys.CPUPercent >= cpuAbsolute || sys.CPUPercent > rollingAvg*cpuRelative

    if !isSpike || time.Since(d.lastSpike) < cooldown {
        return nil
    }
    d.lastSpike = time.Now()

    reason := "CPU jumped 30%+ above rolling average"
    if sys.CPUPercent >= cpuAbsolute {
        reason = "CPU exceeded 85%"
    }

    topN := 3
    var topProcs []models.Process
    if procs != nil {
        if len(procs.Processes) < topN { topN = len(procs.Processes) }
        topProcs = procs.Processes[:topN]
    }

    return &models.SpikeEvent{
        Timestamp:  sys.Timestamp,
        CPUPercent: sys.CPUPercent,
        MemPercent: sys.MemPercent,
        TopProcs:   topProcs,
        Reason:     reason,
    }
}

func avg(vals []float64) float64 {
    if len(vals) == 0 { return 0 }
    var s float64
    for _, v := range vals { s += v }
    return s / float64(len(vals))
}
