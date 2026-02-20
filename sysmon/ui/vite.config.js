import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev server proxy — forwards /api to the Go agent
    proxy: {
      '/api': {
        target: 'http://localhost:7070',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output goes into internal/ui/dist/ so Go can embed it
    outDir: '../internal/ui/dist',
    emptyOutDir: true,
  },
})
