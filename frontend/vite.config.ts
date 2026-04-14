import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // In dev: run `vercel dev` from root (port 3000) to get API + frontend together
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
