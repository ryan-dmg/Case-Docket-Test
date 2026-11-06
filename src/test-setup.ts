/**
 * test-setup.ts
 * Purpose: runs before each test file; unmounts rendered components after
 * every test so tests don't leak into each other.
 * Inputs: none.
 * Outputs: none.
 */
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
