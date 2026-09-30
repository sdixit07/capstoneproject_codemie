import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    // Playwright specs live under ./tests and are run separately via `npm run test:e2e`.
    exclude: ['node_modules/**', 'dist/**', 'tests/**'],
  },
})
