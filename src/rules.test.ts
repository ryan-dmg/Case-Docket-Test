/**
 * rules.test.ts
 * Purpose: checks the status-transition rules against the contract table.
 * Inputs: `canTransition` and `allowedTransitions` from ./rules.
 * Outputs: pass/fail for every role, from-status and to-status combination.
 */
import { describe, expect, it } from 'vitest'
import { ROLES, STATUSES, type Role, type Status } from './types'
import { allowedTransitions, canTransition } from './rules'

// ---- Expected contract (written separately from the implementation) -------

const CLERK_AND_ADMIN: Role[] = ['clerk', 'admin']
const ADMIN_ONLY: Role[] = ['admin']

// Every transition the table allows, with the roles that may perform it.
// "Open" is taken to mean any status except Closed and Dismissed.
const EXPECTED: { from: Status; to: Status; roles: Role[] }[] = [
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

/** Returns whether the contract table allows this exact move for this role. */
function expectedAllowed(role: Role, from: Status, to: Status): boolean {
  return EXPECTED.some((e) => e.from === from && e.to === to && e.roles.includes(role))
}

// ---- canTransition ---------------------------------------------------------

describe('canTransition', () => {
  // Checks all 108 combinations (3 roles x 6 from x 6 to) against the table
  for (const role of ROLES) {
    for (const from of STATUSES) {
      for (const to of STATUSES) {
        const want = expectedAllowed(role, from, to)
        it(`${role}: ${from} -> ${to} is ${want ? 'allowed' : 'rejected'}`, () => {
          expect(canTransition(role, from, to)).toBe(want)
        })
      }
    }
  }

  // Named cases that matter most, kept explicit for readability
  it('rejects every move for a viewer', () => {
    for (const from of STATUSES) {
      for (const to of STATUSES) {
        expect(canTransition('viewer', from, to)).toBe(false)
      }
    }
  })

  it('rejects a skipped step even for an admin', () => {
    expect(canTransition('admin', 'Filed', 'Decided')).toBe(false)
  })

  it('rejects moving to the same status', () => {
    expect(canTransition('admin', 'Filed', 'Filed')).toBe(false)
  })
})

// ---- allowedTransitions ----------------------------------------------------

describe('allowedTransitions', () => {
  it('lists nothing for a viewer', () => {
    for (const status of STATUSES) {
      expect(allowedTransitions('viewer', status)).toEqual([])
    }
  })

  it('lists Scheduled and nothing else for a clerk on a Filed case', () => {
    expect(allowedTransitions('clerk', 'Filed')).toEqual(['Scheduled'])
  })

  it('lists Scheduled and Dismissed for an admin on a Filed case', () => {
    expect([...allowedTransitions('admin', 'Filed')].sort()).toEqual(['Dismissed', 'Scheduled'])
  })

  it('lists only Decided for an admin on a Closed case', () => {
    expect(allowedTransitions('admin', 'Closed')).toEqual(['Decided'])
  })

  it('lists nothing for anyone on a Dismissed case', () => {
    for (const role of ROLES) {
      expect(allowedTransitions(role, 'Dismissed')).toEqual([])
    }
  })

  // The two functions must never disagree
  it('agrees with canTransition for every role and status', () => {
    for (const role of ROLES) {
      for (const from of STATUSES) {
        const listed = allowedTransitions(role, from)
        for (const to of STATUSES) {
          expect(listed.includes(to)).toBe(canTransition(role, from, to))
        }
      }
    }
  })
})
