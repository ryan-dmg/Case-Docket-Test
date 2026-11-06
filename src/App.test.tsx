/**
 * App.test.tsx
 * Purpose: checks the role switcher and what each role can see and do.
 * Inputs: the full <App /> rendered with the fictional data.
 * Outputs: pass/fail for each role's visible controls.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { cases } from './data/cases'
import { allowedTransitions } from './rules'
import { ROLES, type Role } from './types'

/** Picks a role in the role switcher. */
async function chooseRole(role: Role) {
  await userEvent.selectOptions(screen.getByRole('combobox', { name: /role/i }), role)
}

/** Returns every per-row action button currently on the page. */
function actionButtons(): HTMLButtonElement[] {
  return screen.queryAllByRole('button', { name: /change status/i }) as HTMLButtonElement[]
}

describe('role switcher and permissions', () => {
  it('starts as a viewer, the least-privileged role', () => {
    render(<App />)
    const select = screen.getByRole('combobox', { name: /role/i }) as HTMLSelectElement
    expect(select.value).toBe('viewer')
  })

  it('offers exactly the three roles', () => {
    render(<App />)
    const options = within(screen.getByRole('combobox', { name: /role/i })).getAllByRole('option')
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual([...ROLES])
  })

  it('hides all actions from a viewer', () => {
    render(<App />)
    expect(actionButtons()).toHaveLength(0)
    expect(screen.queryByRole('columnheader', { name: /actions/i })).toBeNull()
  })

  it('shows an action on every row for a clerk', async () => {
    render(<App />)
    await chooseRole('clerk')
    expect(actionButtons()).toHaveLength(cases.length)
  })

  // The UI must never enable an action the rules module rejects
  for (const role of ['clerk', 'admin'] as const) {
    it(`enables an action only where the rules allow it (${role})`, async () => {
      render(<App />)
      await chooseRole(role)
      for (const c of cases) {
        const button = screen.getByRole('button', { name: `Change status of ${c.id}` }) as HTMLButtonElement
        const allowed = allowedTransitions(role, c.status).length > 0
        expect(button.disabled).toBe(!allowed)
      }
    })
  }

  it('disables clerk actions on a Decided case but not on a Filed case', async () => {
    render(<App />)
    await chooseRole('clerk')
    const filed = cases.find((c) => c.status === 'Filed')!
    const decided = cases.find((c) => c.status === 'Decided')!
    expect((screen.getByRole('button', { name: `Change status of ${filed.id}` }) as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByRole('button', { name: `Change status of ${decided.id}` }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('hides actions again when switching back to viewer', async () => {
    render(<App />)
    await chooseRole('admin')
    await chooseRole('viewer')
    expect(actionButtons()).toHaveLength(0)
  })

  it('is reachable first by keyboard', async () => {
    render(<App />)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: /role/i }))
  })
})
