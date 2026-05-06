import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enables access from devices on the same Wi-Fi (e.g., iPhone).
    host: '0.0.0.0',
    port: 5173,
  },
})
