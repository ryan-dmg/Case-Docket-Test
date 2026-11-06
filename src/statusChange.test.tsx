/**
 * statusChange.test.tsx
 * Purpose: checks the case detail view and the status-change workflow.
 * Inputs: the full <App /> rendered with the fictional data.
 * Outputs: pass/fail for what is offered, what changes and what is kept.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { cases } from './data/cases'
import type { Role, Status } from './types'

/** Finds the first fictional case that has the given status. */
function caseWith(status: Status) {
  return cases.find((c) => c.status === status)!
}

/** Renders the app as a role and opens the detail view of one case. */
async function openCase(role: Role, status: Status) {
  render(<App />)
  await userEvent.selectOptions(screen.getByRole('combobox', { name: /role/i }), role)
  const c = caseWith(status)
  await userEvent.click(screen.getByRole('button', { name: `Change status of ${c.id}` }))
  return c
}

/** Lists the names of the "Move to ..." buttons shown in the detail view. */
function offered(): string[] {
  return screen.queryAllByRole('button', { name: /^move to/i }).map((b) => b.textContent ?? '')
}

describe('case detail', () => {
  it('shows the case title and current status', async () => {
    const c = await openCase('clerk', 'Filed')
    expect(screen.getByRole('heading', { name: c.title })).toBeTruthy()
    expect(screen.getByText(/current status/i).parentElement!.textContent).toContain('Filed')
  })

  it('returns to the list with the Back button', async () => {
    await openCase('clerk', 'Filed')
    await userEvent.click(screen.getByRole('button', { name: /back to list/i }))
    expect(screen.getByRole('table')).toBeTruthy()
  })

  it('keeps the search text when coming back to the list', async () => {
    render(<App />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /role/i }), 'clerk')
    await userEvent.type(screen.getByRole('searchbox', { name: /search/i }), 'Matter 01')
    await userEvent.click(screen.getByRole('button', { name: /change status of CD-2026-001/i }))
    await userEvent.click(screen.getByRole('button', { name: /back to list/i }))
    expect((screen.getByRole('searchbox', { name: /search/i }) as HTMLInputElement).value).toBe('Matter 01')
  })
})

describe('allowed transitions are offered, others are not', () => {
  it('offers a clerk only "Scheduled" on a Filed case', async () => {
    await openCase('clerk', 'Filed')
    expect(offered()).toEqual(['Move to Scheduled'])
  })

  it('offers a clerk only "Decided" on a Hearing Held case (no Dismissed)', async () => {
    await openCase('clerk', 'Hearing Held')
    expect(offered()).toEqual(['Move to Decided'])
  })

  it('offers an admin "Closed" and "Dismissed" on a Decided case', async () => {
    await openCase('admin', 'Decided')
    expect(offered().sort()).toEqual(['Move to Closed', 'Move to Dismissed'])
  })

  it('offers an admin only "Decided" (reopen) on a Closed case', async () => {
    await openCase('admin', 'Closed')
    expect(offered()).toEqual(['Move to Decided'])
  })
})

describe('changing a status', () => {
  it('updates the detail view after an allowed change', async () => {
    await openCase('clerk', 'Filed')
    await userEvent.click(screen.getByRole('button', { name: 'Move to Scheduled' }))
    expect(screen.getByText(/current status/i).parentElement!.textContent).toContain('Scheduled')
    expect(offered()).toEqual(['Move to Hearing Held'])
  })

  it('shows the new status in the list after going back', async () => {
    const c = await openCase('clerk', 'Filed')
    await userEvent.click(screen.getByRole('button', { name: 'Move to Scheduled' }))
    await userEvent.click(screen.getByRole('button', { name: /back to list/i }))
    const row = screen.getByRole('row', { name: new RegExp(c.id) })
    expect(within(row).getByText('Scheduled')).toBeTruthy()
  })

  it('shows a message when the role has no moves left', async () => {
    await openCase('clerk', 'Hearing Held')
    await userEvent.click(screen.getByRole('button', { name: 'Move to Decided' }))
    expect(offered()).toEqual([])
    expect(screen.getByText(/no status changes are available/i)).toBeTruthy()
  })
})
