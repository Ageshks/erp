import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://erpbackend-production-0d19.up.railway.app',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://erpbackend-production-0d19.up.railway.app',
        changeOrigin: true,
      },
    },
  },
})
