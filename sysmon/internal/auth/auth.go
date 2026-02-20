package auth

import (
    "errors"
    "time"

    "github.com/go-chi/jwtauth/v5"
    "golang.org/x/crypto/bcrypt"
)

const tokenExpiry = 24 * time.Hour

// JWTAuth is the package-level token authority, initialised once in main.
var JWTAuth *jwtauth.JWTAuth

// Init must be called at startup with the secret from config.
func Init(secret string) {
    JWTAuth = jwtauth.New("HS256", []byte(secret), nil)
}

// ValidatePassword checks a plaintext password against a stored bcrypt hash.
func ValidatePassword(hash, plain string) error {
    return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
}

// HashPassword produces a bcrypt hash (used by cmd/hashpw).
func HashPassword(plain string) (string, error) {
    b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
    return string(b), err
}

// MakeToken signs a JWT for the given username, valid for 24 hours.
func MakeToken(username string) (string, error) {
    claims := map[string]interface{}{
        "sub": username,
        "exp": time.Now().Add(tokenExpiry).Unix(),
    }
    _, tokenString, err := JWTAuth.Encode(claims)
    return tokenString, err
}

// ValidateCreds checks username match and bcrypt password comparison.
func ValidateCreds(storedUser, storedHash, inputUser, inputPass string) error {
    if storedUser != inputUser {
        return errors.New("invalid credentials")
    }
    return ValidatePassword(storedHash, inputPass)
}
