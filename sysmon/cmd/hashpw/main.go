package main

import (
    "fmt"
    "log"
    "os"

    "golang.org/x/crypto/bcrypt"
)

// Usage: go run ./cmd/hashpw mysecretpassword
// Paste the output into config.yaml → auth.password_hash
func main() {
    if len(os.Args) < 2 {
        log.Fatal("usage: hashpw <password>")
    }
    plain := os.Args[1]
    hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
    if err != nil {
        log.Fatalf("bcrypt error: %v", err)
    }
    fmt.Println(string(hash))
}
