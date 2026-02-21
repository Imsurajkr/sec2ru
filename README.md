# sec2ru

A lightweight, self-hosted system monitoring and anomaly detection platform. sec2ru collects real-time CPU, memory, disk, and network metrics, detects CPU spikes, and presents everything through a modern React dashboard — with support for monitoring multiple nodes from a single pane of glass.

## Features

- **Real-time metrics** — CPU, memory, disk, and network I/O collected on a configurable interval
- **Process tracking** — top processes ranked by CPU usage
- **Anomaly detection** — automatic CPU spike detection using a rolling average with cooldown logic
- **Multi-node federation** — aggregate metrics from remote sec2ru agents into one dashboard
- **Embedded web UI** — React + Tailwind CSS SPA served directly from the binary
- **JWT authentication** — bcrypt password hashing, token-based API access
- **Persistent storage** — embedded BoltDB with configurable TTL-based cleanup
- **Cross-platform** — runs on Linux and Windows

## Architecture

```
sec2ru/
├── cmd/
│   ├── agent/       # Main binary entry point
│   └── hashpw/      # Password hash utility
└── internal/
    ├── anomaly/     # CPU spike detection
    ├── api/         # HTTP handlers and router (Chi)
    ├── auth/        # JWT + bcrypt
    ├── collector/   # System metrics via gopsutil
    ├── config/      # YAML config loader
    ├── hub/         # Peer node federation
    ├── models/      # Shared data structures
    ├── store/       # BoltDB persistence layer
    └── ui/          # Embedded React SPA
```

## Prerequisites

- Go 1.22+
- Node.js 18+ and npm (for building the UI)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/imsurajkr/sec2ru.git
cd sec2ru/sysmon
```

### 2. Generate a password hash

```bash
go run ./cmd/hashpw <your-password>
```

Copy the output hash — you will need it in the config file.

### 3. Configure

Edit `config.yaml`:

```yaml
agent:
  node_name: "my-machine"
  collect_interval: "2s"
  retention: "24h"
  listen_addr: ":7070"
  db_path: "sec2ru.db"

auth:
  username: "admin"
  password_hash: "<paste-bcrypt-hash-here>"
  jwt_secret: "change-this-to-a-long-random-string-min-32-chars"

peers:
  # Add remote sec2ru agents to aggregate their data
  - name: "nas-server"
    url: "http://192.168.1.10:7070"
    token: ""   # JWT from that node's /api/login
```

> **Note:** `config.yaml` contains secrets and is excluded from version control by `.gitignore`.

### 4. Build and run

**Linux:**
```bash
make build-linux
./bin/sec2ru-linux --config config.yaml
```

**Windows:**
```bash
make build-windows
.\bin\sec2ru.exe --config config.yaml
```

**Development (no build step):**
```bash
make run
```

The UI is served at `http://localhost:7070`.

## Building the UI separately

```bash
make build-ui
```

This runs `npm install && npm run build` inside the `ui/` directory and embeds the output into the Go binary at compile time.

## API Endpoints

All endpoints except `/api/login` require a `Authorization: Bearer <token>` header.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/login` | Authenticate and receive a JWT |
| `GET` | `/api/live` | Latest system snapshot and process list |
| `GET` | `/api/metrics` | Historical system metrics (`since`, `until`, `window` params) |
| `GET` | `/api/processes` | Process list at a given timestamp (`ts` param) |
| `GET` | `/api/spikes` | Detected CPU spike events (`since`, `until` params) |
| `GET` | `/api/info` | Node information (hostname, OS, uptime) |
| `GET` | `/api/nodes` | Live status of all configured peer nodes |
| `GET` | `/api/self` | This node's live data formatted as a peer card |

## Multi-node Setup

Each sec2ru instance is an independent agent. To aggregate multiple nodes:

1. Obtain a JWT from the remote node:
   ```bash
   curl -s -X POST http://192.168.1.10:7070/api/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"<password>"}'
   ```
2. Copy the `token` value into the `peers[].token` field of the primary node's `config.yaml`.
3. Restart the primary agent. The **Servers** page will display all nodes.

## Anomaly Detection

sec2ru flags a CPU spike when either condition is met:

- CPU usage exceeds **85%** (absolute threshold), or
- CPU usage is **30%+ above** the rolling 5-minute average

A 30-second cooldown prevents duplicate alerts. Detected spikes are stored in the database and shown on the **Spikes** page.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go, [Chi](https://github.com/go-chi/chi), [jwtauth](https://github.com/go-chi/jwtauth), [gopsutil](https://github.com/shirou/gopsutil), [BoltDB](https://github.com/etcd-io/bbolt) |
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide |
| Auth | bcrypt + JWT (HS256) |
| Storage | Embedded BoltDB (no external database required) |

## License

MIT
