/**
 * cases.test.ts
 * Purpose: checks the shape of the fictional case data.
 * Inputs: the `cases` array and the `STATUSES` list.
 * Outputs: pass/fail for each data rule.
 */
import { describe, expect, it } from 'vitest'
import { STATUSES } from '../types'
import { cases } from './cases'

describe('fictional case data', () => {
  // About 40 cases are needed for search and filter to be meaningful
  it('contains about 40 cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40)
  })

  // Every id must be unique so rows can be keyed and looked up
  it('has a unique id on every case', () => {
    const ids = cases.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // A status outside the six allowed values would break the workflow rules
  it('gives every case a valid status', () => {
    for (const c of cases) {
      expect(STATUSES).toContain(c.status)
    }
  })

  // Every status should appear at least once so each filter has data
  it('uses every status at least once', () => {
    const used = new Set(cases.map((c) => c.status))
    for (const s of STATUSES) {
      expect(used.has(s)).toBe(true)
    }
  })

  // Rule 3 of the handoff: placeholder party labels only
  it('labels parties as "Sample Party NN"', () => {
    for (const c of cases) {
      expect(c.plaintiff).toMatch(/^Sample Party \d{2}$/)
      expect(c.defendant).toMatch(/^Sample Party \d{2}$/)
    }
  })
})
