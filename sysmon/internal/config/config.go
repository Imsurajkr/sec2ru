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
    JWTSecret    string `yaml:"jwt_secret"`    // ← new
}

type Config struct {
    Agent AgentConfig `yaml:"agent"`
    Auth  AuthConfig  `yaml:"auth"`
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
