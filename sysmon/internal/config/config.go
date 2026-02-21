package config

import (
    "os"
    "gopkg.in/yaml.v3"
)

type AgentConfig struct {
    NodeName        string `yaml:"node_name"`
    CollectInterval string `yaml:"collect_interval"`
    Retention       string `yaml:"retention"`
    ListenAddr      string `yaml:"listen_addr"`
    DBPath          string `yaml:"db_path"`
}

type AuthConfig struct {
    Username     string `yaml:"username"`
    PasswordHash string `yaml:"password_hash"`
    JWTSecret    string `yaml:"jwt_secret"`
}

// PeerConfig represents one remote sec2ru agent node.
type PeerConfig struct {
    Name  string `yaml:"name"`
    URL   string `yaml:"url"`   // e.g. http://192.168.1.10:7070
    Token string `yaml:"token"` // JWT obtained from that node's /api/login
}

type Config struct {
    Agent AgentConfig  `yaml:"agent"`
    Auth  AuthConfig   `yaml:"auth"`
    Peers []PeerConfig `yaml:"peers"` // ← new
}

func Load(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var cfg Config
    if err := yaml.Unmarshal(data, &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}
