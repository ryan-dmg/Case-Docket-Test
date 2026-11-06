/**
 * CaseList.tsx
 * Purpose: the case table with saved views, text search and a status filter.
 * Inputs: `cases`, the list of cases to show.
 * Outputs: a React element; filtering is local state, nothing is sent anywhere.
 */
import { useState } from 'react'
import { allowedTransitions } from '../rules'
import { STATUSES, type Case, type Role, type Status } from '../types'

// ---- Saved views --------------------------------------------------------------

interface SavedView {
  name: string
  statuses: readonly Status[] | null // null means every status
}

// "Open" means any status except Closed and Dismissed (same rule as rules.ts)
const VIEWS: readonly SavedView[] = [
  { name: 'All cases', statuses: null },
  { name: 'Open cases', statuses: ['Filed', 'Scheduled', 'Hearing Held', 'Decided'] },
  { name: 'Awaiting hearing', statuses: ['Scheduled'] },
  { name: 'Decided', statuses: ['Decided'] },
]

// ---- Component ------------------------------------------------------------------

/**
 * Renders the saved views, the search and status controls, and the table.
 * Inputs: props.cases, the cases to list; props.role, the current user role.
 * Outputs: the case list UI. A row shows when it matches the active saved
 * view, the status dropdown and the search text together. Viewers see no
 * Actions column; other roles see a button per row that is enabled only
 * when the rules module allows that role to change the case's status.
 */
export function CaseList({ cases, role }: { cases: Case[]; role: Role }) {
  const [viewName, setViewName] = useState('All cases')
  const [status, setStatus] = useState<'' | Status>('')
  const [query, setQuery] = useState('')

  const view = VIEWS.find((v) => v.name === viewName) ?? VIEWS[0]
  const needle = query.trim().toLowerCase()
  const canAct = role !== 'viewer' // viewers read only, so the Actions column is hidden

  const visible = cases.filter((c) => {
    if (view.statuses && !view.statuses.includes(c.status)) return false
    if (status && c.status !== status) return false
    // Search covers every text column a person would look at
    return [c.id, c.title, c.plaintiff, c.defendant].some((t) => t.toLowerCase().includes(needle))
  })

  return (
    <div className="layout">
      <nav aria-label="Saved views">
        <h2>Saved views</h2>
        {VIEWS.map((v) => (
          <button
            key={v.name}
            type="button"
            aria-pressed={v.name === viewName}
            onClick={() => setViewName(v.name)}
          >
            {v.name}
          </button>
        ))}
      </nav>

      <section aria-labelledby="cases-heading">
        <h2 id="cases-heading">Cases</h2>
        <div className="controls">
          <input
            type="search"
            aria-label="Search cases"
            placeholder="Search by title, party or id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as '' | Status)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Title</th>
              <th scope="col">Parties</th>
              <th scope="col">Status</th>
              {canAct && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td>
                  {c.plaintiff} / {c.defendant}
                </td>
                <td>{c.status}</td>
                {canAct && (
                  <td>
                    <button
                      type="button"
                      aria-label={`Change status of ${c.id}`}
                      disabled={allowedTransitions(role, c.status).length === 0}
                    >
                      Change status
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p>No cases match your search.</p>}
        <p aria-live="polite">
          Showing {visible.length} of {cases.length} cases
        </p>
      </section>
    </div>
  )
}
