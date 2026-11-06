/**
 * cases.ts
 * Purpose: the fictional case data used by the whole app. No real people,
 * employers, systems or case numbers appear here.
 * Inputs: none.
 * Outputs: `cases`, an array of 40 `Case` records.
 */
import { STATUSES, type Case } from '../types'

const COUNT = 40

/**
 * Builds one fictional case from its position in the list.
 * Inputs: i, the zero-based index.
 * Outputs: a Case with a unique id, a rotating status and a filing date
 * five days after the previous case.
 */
function makeCase(i: number): Case {
  const n = i + 1
  const pad = (v: number) => String(v).padStart(2, '0')
  return {
    id: `CD-2026-${String(n).padStart(3, '0')}`,
    title: `Sample Matter ${pad(n)}`,
    plaintiff: `Sample Party ${pad(n)}`,
    defendant: `Sample Party ${pad(n + COUNT)}`,
    status: STATUSES[i % STATUSES.length], // spreads cases across all six statuses
    filedOn: new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString().slice(0, 10),
  }
}

export const cases: Case[] = Array.from({ length: COUNT }, (_, i) => makeCase(i))
