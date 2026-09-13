import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    // ./tests holds the Playwright e2e specs, they must not be picked up by vitest.
    exclude: ['node_modules', 'dist', 'tests'],
  },
})
