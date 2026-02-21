package api

import (
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    "github.com/go-chi/cors"
    "github.com/go-chi/jwtauth/v5"

    "github.com/imsurajkr/sec2ru/internal/auth"
    "github.com/imsurajkr/sec2ru/internal/config"
    "github.com/imsurajkr/sec2ru/internal/store"
	"github.com/imsurajkr/sec2ru/internal/ui"
)

// NewRouter builds the full Chi router.
// Call auth.Init() before calling this.
func NewRouter(cfg *config.Config, st *store.Store) http.Handler {
    r := chi.NewRouter()

    // ── Global middleware ──────────────────────────────────────────
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
        ExposedHeaders:   []string{"Link"},
        AllowCredentials: true,
        MaxAge:           300,
    }))

    h := &Handler{cfg: cfg, store: st}

    // ── Public routes ──────────────────────────────────────────────
    r.Post("/api/login", h.Login)

	r.Handle("/*", ui.SPAHandler())

    // ── Protected routes (JWT required) ───────────────────────────
    r.Group(func(r chi.Router) {
        r.Use(jwtauth.Verifier(auth.JWTAuth))
        r.Use(jwtauth.Authenticator(auth.JWTAuth))

        r.Get("/api/live",      h.Live)
        r.Get("/api/metrics",   h.Metrics)
        r.Get("/api/processes", h.Processes)
        r.Get("/api/spikes",    h.Spikes)
        r.Get("/api/info",      h.Info)
		// Inside the protected r.Group:
		r.Get("/api/nodes", h.Nodes)   // peer aggregation
		r.Get("/api/self",  h.Self)    // this node as a card
        r.Get("/api/network/conns", h.NetConnections)
        r.Get("/api/network/app-summary", h.AppSummary)
    })

    return r
}
