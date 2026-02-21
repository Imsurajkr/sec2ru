package hub

import (
    "context"
    "encoding/json"
    "net/http"
    "sync"
    "time"

    "github.com/imsurajkr/sec2ru/internal/config"
    "github.com/imsurajkr/sec2ru/internal/models"
)

const fetchTimeout = 3 * time.Second

// NodeStatus is what the /api/nodes endpoint returns per peer.
type NodeStatus struct {
    Name      string                  `json:"name"`
    URL       string                  `json:"url"`
    Online    bool                    `json:"online"`
    System    *models.SystemSnapshot  `json:"system,omitempty"`
    Processes *models.ProcessSnapshot `json:"processes,omitempty"`
    Error     string                  `json:"error,omitempty"`
    FetchedAt int64                   `json:"fetched_at"`
}

// peerLive mirrors the shape returned by each agent's /api/live.
type peerLive struct {
    System    *models.SystemSnapshot  `json:"system"`
    Processes *models.ProcessSnapshot `json:"processes"`
}

// FetchAll concurrently fetches /api/live from every configured peer.
// Each fetch is capped at fetchTimeout. Never blocks longer than that.
func FetchAll(peers []config.PeerConfig) []NodeStatus {
    if len(peers) == 0 {
        return []NodeStatus{}
    }

    results := make([]NodeStatus, len(peers))
    var wg sync.WaitGroup

    for i, peer := range peers {
        wg.Add(1)
        go func(idx int, p config.PeerConfig) {
            defer wg.Done()
            results[idx] = fetch(p)
        }(i, peer)
    }

    wg.Wait()
    return results
}

func fetch(p config.PeerConfig) NodeStatus {
    status := NodeStatus{
        Name:      p.Name,
        URL:       p.URL,
        FetchedAt: time.Now().UnixMilli(),
    }

    ctx, cancel := context.WithTimeout(context.Background(), fetchTimeout)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, http.MethodGet, p.URL+"/api/live", nil)
    if err != nil {
        status.Error = "build request: " + err.Error()
        return status
    }
    if p.Token != "" {
        req.Header.Set("Authorization", "Bearer "+p.Token)
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        status.Error = "unreachable: " + err.Error()
        return status
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        status.Error = "HTTP " + resp.Status
        return status
    }

    var live peerLive
    if err := json.NewDecoder(resp.Body).Decode(&live); err != nil {
        status.Error = "decode: " + err.Error()
        return status
    }

    status.Online    = true
    status.System    = live.System
    status.Processes = live.Processes
    return status
}
