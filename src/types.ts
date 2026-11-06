/**
 * types.ts
 * Purpose: shared types for the docket app (roles, statuses, cases).
 * Inputs: none.
 * Outputs: the `STATUSES` and `ROLES` lists and the `Status`, `Role`, `Case` types.
 */

// ---- Statuses -------------------------------------------------------------

// Listed once as a const array so the type and runtime checks share one source
export const STATUSES = [
  'Filed',
  'Scheduled',
  'Hearing Held',
  'Decided',
  'Closed',
  'Dismissed',
] as const

export type Status = (typeof STATUSES)[number]

// ---- Roles ----------------------------------------------------------------

export const ROLES = ['viewer', 'clerk', 'admin'] as const

export type Role = (typeof ROLES)[number]

// ---- Cases ----------------------------------------------------------------

export interface Case {
  id: string // unique, for example "CD-2026-001"
  title: string
  plaintiff: string // always "Sample Party NN"
  defendant: string // always "Sample Party NN"
  status: Status
  filedOn: string // ISO date, YYYY-MM-DD
}
