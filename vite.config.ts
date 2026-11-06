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
  // GitHub Pages serves under /<repo-name>/, so the deploy workflow sets VITE_BASE.
  // Local dev and the Docker image keep the default of '/'.
  base: process.env.VITE_BASE ?? '/',
  test: {
    environment: 'jsdom', // component tests need a DOM
    setupFiles: ['./src/test-setup.ts'],
  },
})
