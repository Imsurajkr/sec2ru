package store

import (
    "encoding/binary"
    "encoding/json"
    "log"
    "strings"
    "time"

    "github.com/imsurajkr/sec2ru/internal/models"
    bolt "go.etcd.io/bbolt"
)

var (
    bucketSystem    = []byte("system")
    bucketProcesses = []byte("processes")
    bucketSpikes    = []byte("spikes")
    bucketMeta      = []byte("meta")
    bucketNetConn   = []byte("netconn")
)

type Store struct {
    db        *bolt.DB
    retention time.Duration
}

func Open(path string, retention time.Duration) (*Store, error) {
    db, err := bolt.Open(path, 0600, &bolt.Options{Timeout: 3 * time.Second})
    if err != nil {
        return nil, err
    }
    err = db.Update(func(tx *bolt.Tx) error {
        for _, b := range [][]byte{bucketSystem, bucketProcesses, bucketSpikes, bucketMeta, bucketNetConn} {
            if _, err := tx.CreateBucketIfNotExists(b); err != nil {
                return err
            }
        }
        return nil
    })
    if err != nil {
        db.Close()
        return nil, err
    }
    return &Store{db: db, retention: retention}, nil
}

func (s *Store) Close() error { return s.db.Close() }

// tsKey — big-endian bytes so bbolt cursor order == time order
func tsKey(ts int64) []byte {
    key := make([]byte, 8)
    binary.BigEndian.PutUint64(key, uint64(ts))
    return key
}

// ── Writes ───────────────────────────────────────────────────────────

func (s *Store) WriteSystem(snap *models.SystemSnapshot) error {
    data, _ := json.Marshal(snap)
    return s.db.Update(func(tx *bolt.Tx) error {
        return tx.Bucket(bucketSystem).Put(tsKey(snap.Timestamp), data)
    })
}

func (s *Store) WriteProcesses(snap *models.ProcessSnapshot) error {
    data, _ := json.Marshal(snap)
    return s.db.Update(func(tx *bolt.Tx) error {
        return tx.Bucket(bucketProcesses).Put(tsKey(snap.Timestamp), data)
    })
}

func (s *Store) WriteSpike(spike *models.SpikeEvent) error {
    data, _ := json.Marshal(spike)
    return s.db.Update(func(tx *bolt.Tx) error {
        return tx.Bucket(bucketSpikes).Put(tsKey(spike.Timestamp), data)
    })
}

func (s *Store) WriteNetConnections(snap *models.NetConnectionSnapshot) error {
    data, _ := json.Marshal(snap)
    return s.db.Update(func(tx *bolt.Tx) error {
        return tx.Bucket(bucketNetConn).Put(tsKey(snap.Timestamp), data)
    })
}

// ── Reads ────────────────────────────────────────────────────────────

func (s *Store) LatestSystem() (*models.SystemSnapshot, error) {
    var result *models.SystemSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        _, v := tx.Bucket(bucketSystem).Cursor().Last()
        if v == nil { return nil }
        var snap models.SystemSnapshot
        if json.Unmarshal(v, &snap) == nil { result = &snap }
        return nil
    })
    return result, err
}

func (s *Store) LatestProcesses() (*models.ProcessSnapshot, error) {
    var result *models.ProcessSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        _, v := tx.Bucket(bucketProcesses).Cursor().Last()
        if v == nil { return nil }
        var snap models.ProcessSnapshot
        if json.Unmarshal(v, &snap) == nil { result = &snap }
        return nil
    })
    return result, err
}

func (s *Store) QuerySystem(since, until int64) ([]*models.SystemSnapshot, error) {
    var out []*models.SystemSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        c := tx.Bucket(bucketSystem).Cursor()
        for k, v := c.Seek(tsKey(since)); k != nil && bytesLE(k, tsKey(until)); k, v = c.Next() {
            var snap models.SystemSnapshot
            if json.Unmarshal(v, &snap) == nil { out = append(out, &snap) }
        }
        return nil
    })
    return out, err
}

func (s *Store) QueryProcesses(atTS int64) (*models.ProcessSnapshot, error) {
    var result *models.ProcessSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        c := tx.Bucket(bucketProcesses).Cursor()
        k, v := c.Seek(tsKey(atTS))
        if k == nil { _, v = c.Last() }
        if v != nil {
            var snap models.ProcessSnapshot
            if json.Unmarshal(v, &snap) == nil { result = &snap }
        }
        return nil
    })
    return result, err
}

func (s *Store) QuerySpikes(since, until int64) ([]*models.SpikeEvent, error) {
    var out []*models.SpikeEvent
    err := s.db.View(func(tx *bolt.Tx) error {
        c := tx.Bucket(bucketSpikes).Cursor()
        for k, v := c.Seek(tsKey(since)); k != nil && bytesLE(k, tsKey(until)); k, v = c.Next() {
            var e models.SpikeEvent
            if json.Unmarshal(v, &e) == nil { out = append(out, &e) }
        }
        return nil
    })
    return out, err
}

func (s *Store) LatestNetConnections() (*models.NetConnectionSnapshot, error) {
    var result *models.NetConnectionSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        _, v := tx.Bucket(bucketNetConn).Cursor().Last()
        if v == nil { return nil }
        var snap models.NetConnectionSnapshot
        if json.Unmarshal(v, &snap) == nil { result = &snap }
        return nil
    })
    return result, err
}

func (s *Store) QueryNetConnections(since, until int64, pid int32, state, remoteIP, port string) ([]*models.NetConnectionSnapshot, error) {
    var out []*models.NetConnectionSnapshot
    err := s.db.View(func(tx *bolt.Tx) error {
        c := tx.Bucket(bucketNetConn).Cursor()
        for k, v := c.Seek(tsKey(since)); k != nil && bytesLE(k, tsKey(until)); k, v = c.Next() {
            var snap models.NetConnectionSnapshot
            if json.Unmarshal(v, &snap) == nil {
                // Apply filters
                if matchesFilters(&snap, pid, state, remoteIP, port) {
                    out = append(out, &snap)
                }
            }
        }
        return nil
    })
    return out, err
}

// matchesFilters returns true if the snapshot contains at least one connection
// that satisfies ALL of the supplied filter criteria (zero-value = any).
func matchesFilters(snap *models.NetConnectionSnapshot, pid int32, state, remoteIP, port string) bool {
    for _, c := range snap.Connections {
        if pid != 0 && c.PID != pid { continue }
        if state != "" && c.Status != state { continue }
        if remoteIP != "" && c.Raddr != remoteIP { continue }
        if port != "" && !strings.HasSuffix(c.Laddr, ":"+port) && !strings.HasSuffix(c.Raddr, ":"+port) { continue }
        return true
    }
    return false
}
// ── TTL Cleanup ──────────────────────────────────────────────────────

func (s *Store) Cleanup() {
    cutoff := tsKey(time.Now().Add(-s.retention).UnixMilli())
    for _, bucket := range [][]byte{bucketSystem, bucketProcesses, bucketSpikes, bucketNetConn} {
        _ = s.db.Update(func(tx *bolt.Tx) error {
            c := tx.Bucket(bucket).Cursor()
            for k, _ := c.First(); k != nil && bytesLT(k, cutoff); k, _ = c.Next() {
                _ = c.Delete()
            }
            return nil
        })
    }
    log.Println("[store] TTL cleanup done")
}

func (s *Store) StartCleanup(stop <-chan struct{}) {
    ticker := time.NewTicker(1 * time.Hour)
    defer ticker.Stop()
    for {
        select {
        case <-ticker.C: s.Cleanup()
        case <-stop: return
        }
    }
}

// ── helpers ──────────────────────────────────────────────────────────

func bytesLE(a, b []byte) bool {
    for i := range a {
        if i >= len(b) { return false }
        if a[i] < b[i] { return true }
        if a[i] > b[i] { return false }
    }
    return true
}

func bytesLT(a, b []byte) bool {
    for i := range a {
        if i >= len(b) { return false }
        if a[i] < b[i] { return true }
        if a[i] > b[i] { return false }
    }
    return false
}
