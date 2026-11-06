/**
 * vite.config.ts
 * Purpose: build and test configuration.
 * Inputs: none (read by Vite and Vitest).
 * Outputs: the React plugin, a browser-like test environment and a test setup file.
 */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // component tests need a DOM
    setupFiles: ['./src/test-setup.ts'],
  },
})
