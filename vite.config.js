import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  },
  optimizeDeps: {
    // Force dependency pre-bundling to avoid Vite's
    // "Outdated Optimize Dep" 504 errors during dev
    force: true,
  },
})
