import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/tasks": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/runs": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/steps": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/workspace_files": {
        target: "http://localhost:3000",
        changeOrigin: true,
      }
    },
  },
})
