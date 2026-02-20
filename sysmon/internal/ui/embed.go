package ui

import (
    "embed"
    "io/fs"
    "net/http"
)

//go:embed dist
var files embed.FS

// SPAHandler serves the built React app.
// Any path that doesn't match a real file falls back to index.html
// so React Router's client-side navigation works correctly.
func SPAHandler() http.HandlerFunc {
    distFS, _ := fs.Sub(files, "dist")
    fileServer := http.FileServer(http.FS(distFS))

    return func(w http.ResponseWriter, r *http.Request) {
        path := r.URL.Path
        if path == "/" || path == "" {
            path = "index.html"
        } else {
            // Strip leading slash for fs.Stat
            path = path[1:]
        }

        if _, err := fs.Stat(distFS, path); err != nil {
            // Unknown path → let React Router handle it
            http.ServeFileFS(w, r, distFS, "index.html")
            return
        }
        fileServer.ServeHTTP(w, r)
    }
}
