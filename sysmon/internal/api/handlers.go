package api

import (
    "encoding/json"
    "net/http"
    "runtime"
    "strconv"
    "time"

    "github.com/shirou/gopsutil/v4/host"

    "github.com/imsurajkr/sysmon/internal/auth"
    "github.com/imsurajkr/sysmon/internal/config"
    "github.com/imsurajkr/sysmon/internal/models"
    "github.com/imsurajkr/sysmon/internal/store"
)

// Handler holds shared dependencies for all HTTP handlers.
type Handler struct {
    cfg   *config.Config
    store *store.Store
}

// ── response helpers ──────────────────────────────────────────────────

func jsonOK(w http.ResponseWriter, v any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(v)
}

func jsonErr(w http.ResponseWriter, status int, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// ── POST /api/login ───────────────────────────────────────────────────

type loginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

type loginResponse struct {
    Token    string `json:"token"`
    ExpiresIn int   `json:"expires_in"` // seconds
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
    var req loginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        jsonErr(w, http.StatusBadRequest, "invalid request body")
        return
    }
    if err := auth.ValidateCreds(
        h.cfg.Auth.Username,
        h.cfg.Auth.PasswordHash,
        req.Username,
        req.Password,
    ); err != nil {
        // Generic message — don't reveal which field was wrong
        jsonErr(w, http.StatusUnauthorized, "invalid credentials")
        return
    }
    token, err := auth.MakeToken(req.Username)
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, "token generation failed")
        return
    }
    jsonOK(w, loginResponse{Token: token, ExpiresIn: 86400})
}

// ── GET /api/live ─────────────────────────────────────────────────────

type liveResponse struct {
    System    *models.SystemSnapshot  `json:"system"`
    Processes *models.ProcessSnapshot `json:"processes"`
}

func (h *Handler) Live(w http.ResponseWriter, r *http.Request) {
    sys, _   := h.store.LatestSystem()
    procs, _ := h.store.LatestProcesses()
    jsonOK(w, liveResponse{System: sys, Processes: procs})
}

// ── GET /api/metrics?since=<ms>&until=<ms>&window=30m ─────────────────
// window defaults to 30m from now; since/until override it explicitly.

func (h *Handler) Metrics(w http.ResponseWriter, r *http.Request) {
    now    := time.Now().UnixMilli()
    until  := queryInt64(r, "until", now)
    window := queryDuration(r, "window", 30*time.Minute)
    since  := queryInt64(r, "since", until-window.Milliseconds())

    snaps, err := h.store.QuerySystem(since, until)
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, err.Error())
        return
    }
    if snaps == nil {
        snaps = []*models.SystemSnapshot{}
    }
    jsonOK(w, snaps)
}

// ── GET /api/processes?ts=<ms> ────────────────────────────────────────
// Returns process list at or near ts (defaults to latest).

func (h *Handler) Processes(w http.ResponseWriter, r *http.Request) {
    ts   := queryInt64(r, "ts", time.Now().UnixMilli())
    snap, err := h.store.QueryProcesses(ts)
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, err.Error())
        return
    }
    if snap == nil {
        jsonErr(w, http.StatusNotFound, "no process data available yet")
        return
    }
    jsonOK(w, snap)
}

// ── GET /api/spikes?since=<ms>&until=<ms> ────────────────────────────
// Defaults to last 24 hours.

func (h *Handler) Spikes(w http.ResponseWriter, r *http.Request) {
    now   := time.Now().UnixMilli()
    since := queryInt64(r, "since", now-int64((24*time.Hour).Milliseconds()))
    until := queryInt64(r, "until", now)

    spikes, err := h.store.QuerySpikes(since, until)
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, err.Error())
        return
    }
    if spikes == nil {
        spikes = []*models.SpikeEvent{} // always return array, never null
    }
    jsonOK(w, spikes)
}

// ── GET /api/info ─────────────────────────────────────────────────────

type infoResponse struct {
    NodeName  string `json:"node_name"`
    Hostname  string `json:"hostname"`
    OS        string `json:"os"`
    Platform  string `json:"platform"`
    Arch      string `json:"arch"`
    UptimeSec uint64 `json:"uptime_sec"`
}

func (h *Handler) Info(w http.ResponseWriter, r *http.Request) {
    resp := infoResponse{
        NodeName: h.cfg.Agent.NodeName,
        Arch:     runtime.GOARCH,
    }
    if info, err := host.Info(); err == nil {
        resp.Hostname  = info.Hostname
        resp.OS        = info.OS
        resp.Platform  = info.Platform
        resp.UptimeSec = info.Uptime
    }
    jsonOK(w, resp)
}

// ── query param helpers ───────────────────────────────────────────────

func queryInt64(r *http.Request, key string, def int64) int64 {
    v := r.URL.Query().Get(key)
    if v == "" { return def }
    n, err := strconv.ParseInt(v, 10, 64)
    if err != nil { return def }
    return n
}

func queryDuration(r *http.Request, key string, def time.Duration) time.Duration {
    v := r.URL.Query().Get(key)
    if v == "" { return def }
    d, err := time.ParseDuration(v)
    if err != nil { return def }
    return d
}
