import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
const mediaServer = 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/frame': { target: mediaServer, changeOrigin: true },
      '/stream': { target: mediaServer, changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: 5173,
    proxy: {
      '/frame': { target: mediaServer, changeOrigin: true },
      '/stream': { target: mediaServer, changeOrigin: true },
    },
  },
})
