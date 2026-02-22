import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'sec2ru-demo' to your exact GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/sec2ru/',   // matches the GitHub repo name
})
