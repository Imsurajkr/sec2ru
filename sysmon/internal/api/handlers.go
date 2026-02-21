package api

import (
    "encoding/json"
    "net/http"
    "runtime"
    "strconv"
    "time"
    "fmt"
    "strings"
    "sort"

    "github.com/shirou/gopsutil/v4/host"

    "github.com/imsurajkr/sec2ru/internal/auth"
    "github.com/imsurajkr/sec2ru/internal/config"
    "github.com/imsurajkr/sec2ru/internal/models"
    "github.com/imsurajkr/sec2ru/internal/store"
	"github.com/imsurajkr/sec2ru/internal/hub"
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

// ── GET /api/nodes ────────────────────────────────────────────────────
// Returns live status of all configured peer nodes, fetched concurrently.
// The calling node's own data is NOT included here — the UI fetches
// that separately via /api/live so it always has up-to-date self data.

func (h *Handler) Nodes(w http.ResponseWriter, r *http.Request) {
    statuses := hub.FetchAll(h.cfg.Peers)
    jsonOK(w, statuses)
}

// ── GET /api/self ─────────────────────────────────────────────────────
// Returns this node's live data + its own name/url so the Servers page
// can render it as the first card identically to peer cards.

type selfResponse struct {
    hub.NodeStatus                      // embeds Online, System, Processes
    IsSelf bool `json:"is_self"`
}

func (h *Handler) Self(w http.ResponseWriter, r *http.Request) {
    sys, _   := h.store.LatestSystem()
    procs, _ := h.store.LatestProcesses()

    resp := selfResponse{
        NodeStatus: hub.NodeStatus{
            Name:      h.cfg.Agent.NodeName,
            URL:       "http://localhost" + h.cfg.Agent.ListenAddr,
            Online:    true,
            System:    sys,
            Processes: procs,
            FetchedAt: time.Now().UnixMilli(),
        },
        IsSelf: true,
    }
    jsonOK(w, resp)
}

// ── GET /api/network/conns ───────────────────────────────────────────
func (h *Handler) NetConnections(w http.ResponseWriter, r *http.Request) {
    pid, _ := strconv.Atoi(r.URL.Query().Get("pid"))
    state := r.URL.Query().Get("state")
    remoteIP := r.URL.Query().Get("remote_ip")
    port := r.URL.Query().Get("port")

    // Last 10 minutes for live view
    now := time.Now().UnixMilli()
    since := now - int64(10*time.Minute.Milliseconds())

    snaps, err := h.store.QueryNetConnections(
        since, now,
        int32(pid), state, remoteIP, port,
    )
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, err.Error())
        return
    }
    if snaps == nil {
        snaps = []*models.NetConnectionSnapshot{}
    }
    jsonOK(w, snaps)
}

func (h *Handler) AppSummary(w http.ResponseWriter, r *http.Request) {
    window := queryDuration(r, "window", 30*time.Minute)
    now    := time.Now().UnixMilli()
    since  := now - window.Milliseconds()

    snaps, err := h.store.QueryNetConnections(since, now, 0, "", "", "")
    if err != nil {
        jsonErr(w, http.StatusInternalServerError, err.Error())
        return
    }

    // Aggregate across all snapshots in the window
    type aggKey = string // process_name
    type aggVal struct {
        pids          map[int32]struct{}
        remotes       map[string]struct{}
        listenPorts   map[string]struct{}
        suspPorts     map[string]struct{}
        connCount     int
    }

    agg := map[aggKey]*aggVal{}

    for _, snap := range snaps {
        for _, c := range snap.Connections {
            name := c.ProcessName
            if name == "" || name == "unknown" {
                name = fmt.Sprintf("pid-%d", c.PID)
            }

            if _, ok := agg[name]; !ok {
                agg[name] = &aggVal{
                    pids:        map[int32]struct{}{},
                    remotes:     map[string]struct{}{},
                    listenPorts: map[string]struct{}{},
                    suspPorts:   map[string]struct{}{},
                }
            }

            a := agg[name]
            a.pids[c.PID] = struct{}{}
            a.connCount++

            if c.Status == "LISTEN" {
                a.listenPorts[c.Laddr] = struct{}{}
            } else if c.Raddr != "" && c.Raddr != "*:*" && c.Raddr != "0.0.0.0:0" {
                a.remotes[c.Raddr] = struct{}{}
            }

            // Flag suspicious ports
            if isSuspiciousPort(c.Raddr) {
                a.suspPorts[c.Raddr] = struct{}{}
            }
        }
    }

    // Build response
    results := make([]models.AppSummary, 0, len(agg))
    for name, a := range agg {
        pids := make([]int32, 0, len(a.pids))
        for pid := range a.pids { pids = append(pids, pid) }

        remotes := make([]string, 0, len(a.remotes))
        for r := range a.remotes { remotes = append(remotes, r) }

        listens := make([]string, 0, len(a.listenPorts))
        for p := range a.listenPorts { listens = append(listens, p) }

        suspicious := make([]string, 0, len(a.suspPorts))
        for p := range a.suspPorts { suspicious = append(suspicious, p) }

        results = append(results, models.AppSummary{
            ProcessName:     name,
            PIDs:            pids,
            Category:        classifyProcess(name, listens, remotes),
            UniqueRemotes:   len(a.remotes),
            ConnCount:       a.connCount,
            ListenPorts:     listens,
            SuspiciousPorts: suspicious,
        })
    }

    // Sort by unique remotes descending
    sort.Slice(results, func(i, j int) bool {
        return results[i].UniqueRemotes > results[j].UniqueRemotes
    })

    jsonOK(w, results)
}

// classifyProcess returns a human category for a given process name.
func classifyProcess(name string, listenPorts, remotes []string) string {
    n := strings.ToLower(name)

    browsers   := []string{"chrome","firefox","msedge","brave","opera","safari","chromium"}
    ides       := []string{"code","goland","idea","pycharm","webstorm","rider","clion","eclipse","nvim","vim","emacs","sublime"}
    infra      := []string{"docker","kubelet","kubectl","containerd","k3s","vagrant","virtualbox","vmware"}
    terminals  := []string{"wt","windowsterminal","terminal","iterm2","alacritty","kitty","konsole","xterm","gnome-terminal"}
    sysWindows := []string{"svchost","lsass","csrss","wininit","services","winlogon","dwm","spoolsv","audiodg"}
    sysLinux   := []string{"systemd","dbus-daemon","networkmanager","resolved","dhclient","cron","sshd","journald"}
    mail       := []string{"thunderbird","outlook","mailspring"}
    comms      := []string{"slack","discord","teams","zoom","signal","telegram"}
    media      := []string{"spotify","vlc","mpv","mplayer","obs","streamlabs"}

    for _, b := range browsers   { if strings.Contains(n, b) { return "browser"  } }
    for _, i := range ides       { if strings.Contains(n, i) { return "dev-tool" } }
    for _, i := range infra      { if strings.Contains(n, i) { return "infra"    } }
    for _, t := range terminals  { if strings.Contains(n, t) { return "terminal" } }
    for _, s := range sysWindows { if strings.Contains(n, s) { return "system"   } }
    for _, s := range sysLinux   { if strings.Contains(n, s) { return "system"   } }
    for _, m := range mail       { if strings.Contains(n, m) { return "mail"     } }
    for _, c := range comms      { if strings.Contains(n, c) { return "comms"    } }
    for _, m := range media      { if strings.Contains(n, m) { return "media"    } }

    return "other"
}

// isSuspiciousPort flags outbound connections on unusual ports.
func isSuspiciousPort(addr string) bool {
    parts := strings.Split(addr, ":")
    if len(parts) < 2 { return false }
    portStr := parts[len(parts)-1]
    port, err := strconv.Atoi(portStr)
    if err != nil { return false }

    // Flag outbound SMTP, IRC, non-standard high ports from system processes
    suspicious := []int{25, 587, 6667, 6697, 4444, 1337, 31337}
    for _, s := range suspicious {
        if port == s { return true }
    }
    return false
}