/**
 * CaseList.test.tsx
 * Purpose: checks the case list's search, status filter and saved views.
 * Inputs: the fictional `cases` data rendered through <CaseList />.
 * Outputs: pass/fail for each user-visible behavior.
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { cases } from '../data/cases'
import { CaseList } from './CaseList'

/** Returns the body rows of the case table (the header row is excluded). */
function bodyRows(): HTMLElement[] {
  return screen.getAllByRole('row').slice(1)
}

/** Counts cases in the data with any of the given statuses. */
function countWith(...statuses: string[]): number {
  return cases.filter((c) => statuses.includes(c.status)).length
}

describe('CaseList', () => {
  it('shows every case at first', () => {
    render(<CaseList cases={cases} role="viewer" />)
    expect(bodyRows()).toHaveLength(cases.length)
  })

  it('narrows rows when searching by title', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.type(screen.getByRole('searchbox', { name: /search/i }), 'Matter 07')
    expect(bodyRows()).toHaveLength(1)
    expect(within(bodyRows()[0]).getByText('Sample Matter 07')).toBeTruthy()
  })

  it('narrows rows when searching by party', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.type(screen.getByRole('searchbox', { name: /search/i }), 'Sample Party 41')
    expect(bodyRows()).toHaveLength(1)
  })

  it('shows a message when nothing matches', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.type(screen.getByRole('searchbox', { name: /search/i }), 'zzz-no-match')
    expect(screen.getByText(/no cases match/i)).toBeTruthy()
  })

  it('filters by status', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /status/i }), 'Decided')
    const rows = bodyRows()
    expect(rows).toHaveLength(countWith('Decided'))
    for (const row of rows) {
      expect(within(row).getByText('Decided')).toBeTruthy()
    }
  })

  it('applies the "Open cases" saved view', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.click(screen.getByRole('button', { name: 'Open cases' }))
    expect(bodyRows()).toHaveLength(countWith('Filed', 'Scheduled', 'Hearing Held', 'Decided'))
  })

  it('applies the "Awaiting hearing" saved view', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.click(screen.getByRole('button', { name: 'Awaiting hearing' }))
    expect(bodyRows()).toHaveLength(countWith('Scheduled'))
  })

  it('applies the "Decided" saved view', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.click(screen.getByRole('button', { name: 'Decided' }))
    expect(bodyRows()).toHaveLength(countWith('Decided'))
  })

  it('marks the active saved view for assistive technology', async () => {
    render(<CaseList cases={cases} role="viewer" />)
    await userEvent.click(screen.getByRole('button', { name: 'Awaiting hearing' }))
    expect(screen.getByRole('button', { name: 'Awaiting hearing' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'All cases' }).getAttribute('aria-pressed')).toBe('false')
  })
})
