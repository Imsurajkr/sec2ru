package main

import (
    "context"
    "flag"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/imsurajkr/sec2ru/internal/anomaly"
    "github.com/imsurajkr/sec2ru/internal/api"
    "github.com/imsurajkr/sec2ru/internal/auth"
    "github.com/imsurajkr/sec2ru/internal/collector"
    "github.com/imsurajkr/sec2ru/internal/config"
    "github.com/imsurajkr/sec2ru/internal/models"
    "github.com/imsurajkr/sec2ru/internal/store"
)

func main() {
    configPath := flag.String("config", "config.yaml", "path to config file")
    flag.Parse()

    cfg, err := config.Load(*configPath)
    if err != nil {
        log.Fatalf("[main] config load failed: %v", err)
    }

    interval, err := time.ParseDuration(cfg.Agent.CollectInterval)
    if err != nil {
        log.Fatalf("[main] bad collect_interval: %v", err)
    }

    retention, err := time.ParseDuration(cfg.Agent.Retention)
    if err != nil {
        log.Fatalf("[main] bad retention: %v", err)
    }

    dbPath := cfg.Agent.DBPath
    if dbPath == "" { dbPath = "sec2ru.db" }

    // ── Store ──────────────────────────────────────────────────────
    st, err := store.Open(dbPath, retention)
    if err != nil {
        log.Fatalf("[main] store open failed: %v", err)
    }
    defer st.Close()

    // ── Auth init ──────────────────────────────────────────────────
    secret := cfg.Auth.JWTSecret
    if secret == "" {
        secret = "sec2ru-insecure-default-change-me"
        log.Println("[main] WARNING: jwt_secret not set — using default, tokens won't survive restarts")
    }
    auth.Init(secret)

    // ── Background goroutines ──────────────────────────────────────
    detector := anomaly.NewDetector()
    stop     := make(chan struct{})
    sysCh    := make(chan *models.SystemSnapshot, 20)
    procCh   := make(chan *models.ProcessSnapshot, 20)
    netCh := make(chan *models.NetConnectionSnapshot, 10)

    go collector.Start(interval, sysCh, procCh, netCh, stop)
    go st.StartCleanup(stop)

    // Fan-in: persist + anomaly detection
    go func() {
        var latestProc *models.ProcessSnapshot
        for {
            select {
            case snap := <-sysCh:
                if err := st.WriteSystem(snap); err != nil {
                    log.Printf("[main] write system: %v", err)
                }
                if spike := detector.Evaluate(snap, latestProc); spike != nil {
                    log.Printf("[main] SPIKE: %s  cpu=%.1f%%", spike.Reason, spike.CPUPercent)
                    _ = st.WriteSpike(spike)
                }
            case psnap := <-procCh:
                latestProc = psnap
                if err := st.WriteProcesses(psnap); err != nil {
                    log.Printf("[main] write processes: %v", err)
                }
            case netSnap := <-netCh:
                if err := st.WriteNetConnections(netSnap); err != nil {
                    log.Printf("[main] write netconns: %v", err)
                }
            case <-stop:
                return
            }
        }
    }()

    // ── HTTP server ────────────────────────────────────────────────
    router := api.NewRouter(cfg, st)
    srv := &http.Server{
        Addr:         cfg.Agent.ListenAddr,
        Handler:      router,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 30 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    go func() {
        log.Printf("[main] HTTP listening on %s", cfg.Agent.ListenAddr)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("[main] server error: %v", err)
        }
    }()

    log.Printf("[main] sec2ru running | node=%s | interval=%s | db=%s",
        cfg.Agent.NodeName, interval, dbPath)

    
    // ── Graceful shutdown ──────────────────────────────────────────
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("[main] shutting down…")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    _ = srv.Shutdown(ctx)
    close(stop)
    time.Sleep(300 * time.Millisecond)
}
