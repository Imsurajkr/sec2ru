// ── Helpers ────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1))

// ── CPU history (last 30 intervals, 2s each) ───────────────────────
export const cpuHistory = Array.from({ length: 30 }, (_, i) => ({
  t: `${i * 2}s`,
  value: i === 18 ? 89 : randFloat(22, 55),   // spike at t=36s
  label: i === 18 ? 'spike' : null,
}))

// ── Memory history ─────────────────────────────────────────────────
export const memHistory = Array.from({ length: 30 }, (_, i) => ({
  t: `${i * 2}s`,
  value: randFloat(58, 74),
}))

// ── Network traffic (bytes/s over 30 intervals) ───────────────────
export const networkHistory = Array.from({ length: 30 }, (_, i) => ({
  t: `${i * 2}s`,
  rx: rand(120_000, 8_000_000),
  tx: rand(40_000, 2_000_000),
}))

// ── Metric cards ──────────────────────────────────────────────────
export const metrics = {
  cpu:          { value: 34.2,   unit: '%',   trend: +2.1,  label: 'CPU Usage'      },
  memory:       { value: 61.8,   unit: '%',   trend: -0.4,  label: 'Memory'         },
  disk:         { value: 42.3,   unit: '%',   trend: +0.1,  label: 'Disk Usage'     },
  blocked:      { value: 14_872, unit: 'pkt', trend: +312,  label: 'Packets Blocked'},
  connections:  { value: 238,    unit: '',    trend: +12,   label: 'Connections'    },
  secEvents:    { value: 7,      unit: '',    trend: -3,    label: 'Security Events'},
}

// ── Processes ─────────────────────────────────────────────────────
export const processes = [
  { pid: 1234, name: 'chrome.exe',        cpu: 12.4, mem: 8.1,  status: 'running', user: 'suraj',    connections: 47 },
  { pid: 5678, name: 'node',              cpu:  8.2, mem: 3.4,  status: 'running', user: 'suraj',    connections: 12 },
  { pid: 9012, name: 'postgres',          cpu:  4.1, mem: 5.2,  status: 'running', user: 'postgres', connections: 28 },
  { pid: 3456, name: 'nginx',             cpu:  1.8, mem: 0.9,  status: 'running', user: 'www-data', connections: 103},
  { pid: 7890, name: 'python3',           cpu:  6.7, mem: 2.3,  status: 'running', user: 'suraj',    connections: 5  },
  { pid: 2345, name: 'redis-server',      cpu:  0.9, mem: 1.1,  status: 'running', user: 'redis',    connections: 34 },
  { pid: 6789, name: 'containerd',        cpu:  2.3, mem: 2.8,  status: 'running', user: 'root',     connections: 8  },
  { pid: 1357, name: 'sshd',              cpu:  0.1, mem: 0.2,  status: 'running', user: 'root',     connections: 2  },
  { pid: 2468, name: 'grafana',           cpu:  1.4, mem: 4.1,  status: 'running', user: 'grafana',  connections: 9  },
  { pid: 9999, name: 'unknown_proc',      cpu: 14.8, mem: 6.2,  status: 'suspect', user: 'root',     connections: 3  },
]

// ── Active connections ─────────────────────────────────────────────
export const connections = [
  { pid:1234, process:'chrome.exe',   laddr:'192.168.1.100:54321', raddr:'142.250.191.78:443',  status:'ESTABLISHED', proto:'TCP', category:'browser'  },
  { pid:1234, process:'chrome.exe',   laddr:'192.168.1.100:54322', raddr:'172.217.14.206:443',  status:'ESTABLISHED', proto:'TCP', category:'browser'  },
  { pid:5678, process:'node',         laddr:'192.168.1.100:3000',  raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'dev-tool' },
  { pid:9012, process:'postgres',     laddr:'127.0.0.1:5432',      raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'database' },
  { pid:3456, process:'nginx',        laddr:'0.0.0.0:80',          raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'proxy'    },
  { pid:3456, process:'nginx',        laddr:'0.0.0.0:443',         raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'proxy'    },
  { pid:7890, process:'python3',      laddr:'192.168.1.100:49876', raddr:'185.220.101.45:4444', status:'ESTABLISHED', proto:'TCP', category:'unknown'  },
  { pid:2345, process:'redis-server', laddr:'127.0.0.1:6379',      raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'cache'    },
  { pid:1357, process:'sshd',         laddr:'0.0.0.0:22',          raddr:'*:*',                 status:'LISTEN',      proto:'TCP', category:'access'   },
  { pid:1357, process:'sshd',         laddr:'192.168.1.100:22',    raddr:'203.0.113.42:58901',  status:'ESTABLISHED', proto:'TCP', category:'access'   },
]

// ── Blocked packets (eBPF/XDP) ─────────────────────────────────────
export const blockedPackets = [
  { id:1,  ts:'14:32:01', src:'185.220.101.45', dst:'192.168.1.100', port:4444, proto:'TCP',  reason:'C2 IP — Tor exit node',       action:'BLOCKED', severity:'critical' },
  { id:2,  ts:'14:31:58', src:'45.33.32.156',   dst:'192.168.1.100', port:22,   proto:'TCP',  reason:'SSH brute force attempt',      action:'BLOCKED', severity:'high'     },
  { id:3,  ts:'14:31:45', src:'198.51.100.88',  dst:'192.168.1.100', port:3306, proto:'TCP',  reason:'Port scan detected',           action:'BLOCKED', severity:'medium'   },
  { id:4,  ts:'14:31:30', src:'203.0.113.99',   dst:'192.168.1.100', port:443,  proto:'TCP',  reason:'Known malicious ASN',          action:'BLOCKED', severity:'high'     },
  { id:5,  ts:'14:31:12', src:'10.0.0.15',      dst:'192.168.1.100', port:8080, proto:'TCP',  reason:'Internal port scan',           action:'BLOCKED', severity:'medium'   },
  { id:6,  ts:'14:30:55', src:'172.16.0.99',    dst:'192.168.1.100', port:25,   proto:'TCP',  reason:'Suspicious SMTP outbound',     action:'BLOCKED', severity:'medium'   },
  { id:7,  ts:'14:30:40', src:'192.0.2.100',    dst:'192.168.1.100', port:53,   proto:'UDP',  reason:'DNS amplification attempt',    action:'BLOCKED', severity:'low'      },
  { id:8,  ts:'14:30:22', src:'45.79.188.120',  dst:'192.168.1.100', port:6379, proto:'TCP',  reason:'Redis exposed — blocked',      action:'BLOCKED', severity:'critical' },
]

// ── Security events (audit trail) ─────────────────────────────────
export const securityEvents = [
  { id:1, ts:'14:32:01', rule:'SUSPICIOUS_OUTBOUND',   host:'dev-laptop', severity:'critical', msg:'python3 connected to Tor exit node 185.220.101.45:4444',                 process:'python3'     },
  { id:2, ts:'14:31:45', rule:'NEW_LISTENING_PORT',    host:'dev-laptop', severity:'medium',   msg:'New service listening on port 8080 — not seen in last 7 days',          process:'python3'     },
  { id:3, ts:'14:30:33', rule:'ENCODED_POWERSHELL',    host:'win-server', severity:'high',     msg:'powershell.exe -nop -w hidden -enc [base64] executed',                   process:'powershell'  },
  { id:4, ts:'14:29:12', rule:'UNKNOWN_PROCESS',       host:'dev-laptop', severity:'high',     msg:'unknown_proc (PID 9999) appeared for first time — non-standard path',   process:'unknown_proc'},
  { id:5, ts:'14:28:55', rule:'SSH_FROM_UNUSUAL_IP',   host:'nas-server', severity:'medium',   msg:'SSH connection established from 203.0.113.42 (never seen before)',       process:'sshd'        },
  { id:6, ts:'14:27:40', rule:'CURL_PIPE_BASH',        host:'ubuntu-box', severity:'high',     msg:'curl https://install.sh | bash executed in /tmp',                       process:'bash'        },
  { id:7, ts:'14:26:18', rule:'POSTURE_FAIL',          host:'win-server', severity:'medium',   msg:'Windows Defender disabled — posture check failed',                      process:'system'      },
]

// ── Nodes (multi-host hub view) ────────────────────────────────────
export const nodes = [
  { name:'dev-laptop',  ip:'192.168.1.100', os:'Ubuntu 22.04', arch:'amd64', online:true,  cpu:34.2, mem:61.8, disk:42.3, alerts:4 },
  { name:'win-server',  ip:'192.168.1.101', os:'Windows 11',   arch:'amd64', online:true,  cpu:12.1, mem:45.2, disk:71.0, alerts:2 },
  { name:'nas-server',  ip:'192.168.1.102', os:'TrueNAS',      arch:'amd64', online:true,  cpu: 8.4, mem:33.1, disk:88.5, alerts:1 },
  { name:'ubuntu-box',  ip:'192.168.1.103', os:'Ubuntu 24.04', arch:'amd64', online:true,  cpu:19.7, mem:52.4, disk:55.2, alerts:1 },
  { name:'rpi-monitor', ip:'192.168.1.104', os:'Raspbian',     arch:'arm64', online:false, cpu: 0,   mem: 0,   disk: 0,   alerts:0 },
]

// ── App traffic summary ─────────────────────────────────────────────
export const appTraffic = [
  { process:'chrome.exe',    category:'browser',  uniqueRemotes:47, connCount:89,  rxBytes:87_654_321, txBytes:12_345_678 },
  { process:'node',          category:'dev-tool', uniqueRemotes:12, connCount:24,  rxBytes:14_200_000, txBytes: 5_100_000 },
  { process:'nginx',         category:'proxy',    uniqueRemotes:103,connCount:210, rxBytes:245_000_000,txBytes:180_000_000},
  { process:'python3',       category:'unknown',  uniqueRemotes:3,  connCount:5,   rxBytes: 2_100_000, txBytes: 1_800_000 },
  { process:'postgres',      category:'database', uniqueRemotes:4,  connCount:28,  rxBytes:32_000_000, txBytes:28_000_000 },
  { process:'redis-server',  category:'cache',    uniqueRemotes:2,  connCount:34,  rxBytes: 8_400_000, txBytes: 8_100_000 },
]
