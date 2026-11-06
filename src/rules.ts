/**
 * rules.ts
 * Purpose: the status-transition rules. Pure TypeScript with no UI, so the
 * UI and the tests read the same single source of truth.
 * Inputs: a role, a current status and (for canTransition) a target status.
 * Outputs: whether a move is allowed, or the list of moves a role may make.
 */
import type { Role, Status } from './types'

// ---- Rule table -------------------------------------------------------------

interface Rule {
  from: Status
  to: Status
  roles: readonly Role[]
}

const CLERK_AND_ADMIN: readonly Role[] = ['clerk', 'admin']
const ADMIN_ONLY: readonly Role[] = ['admin']

// Any move not listed here is rejected for every role.
// "Open" means any status except Closed and Dismissed.
const RULES: readonly Rule[] = [
  { from: 'Filed', to: 'Scheduled', roles: CLERK_AND_ADMIN },
  { from: 'Scheduled', to: 'Hearing Held', roles: CLERK_AND_ADMIN },
  { from: 'Hearing Held', to: 'Decided', roles: CLERK_AND_ADMIN },
  { from: 'Decided', to: 'Closed', roles: ADMIN_ONLY },
  { from: 'Filed', to: 'Dismissed', roles: ADMIN_ONLY },
  { from: 'Scheduled', to: 'Dismissed', roles: ADMIN_ONLY },
  { from: 'Hearing Held', to: 'Dismissed', roles: ADMIN_ONLY },
  { from: 'Decided', to: 'Dismissed', roles: ADMIN_ONLY },
  { from: 'Closed', to: 'Decided', roles: ADMIN_ONLY }, // reopen
]

// ---- Public functions -------------------------------------------------------

/**
 * Says whether a role may move a case from one status to another.
 * Inputs: role, from (current status), to (requested status).
 * Outputs: true only if the move is in the rule table for that role.
 */
export function canTransition(role: Role, from: Status, to: Status): boolean {
  return RULES.some((r) => r.from === from && r.to === to && r.roles.includes(role))
}

/**
 * Lists every status a role may move a case to from its current status.
 * Inputs: role, status (the case's current status).
 * Outputs: an array of target statuses; empty when no move is allowed.
 */
export function allowedTransitions(role: Role, status: Status): Status[] {
  return RULES.filter((r) => r.from === status && r.roles.includes(role)).map((r) => r.to)
}
