/**
 * App.tsx
 * Purpose: top-level page; holds the role, the case data and which case is
 * open, and shows either the list or the case detail.
 * Inputs: none.
 * Outputs: the page layout. State lives here so every part reads the same values.
 */
import { useState } from 'react'
import { CaseDetail } from './components/CaseDetail'
import { CaseList } from './components/CaseList'
import { cases as initialCases } from './data/cases'
import { ROLES, type Role, type Status } from './types'

export default function App() {
  // Start with the least-privileged role
  const [role, setRole] = useState<Role>('viewer')
  const [cases, setCases] = useState(initialCases)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = cases.find((c) => c.id === selectedId)

  /** Sets one case's status; the detail view only offers moves the rules allow. */
  function changeStatus(to: Status) {
    setCases((all) => all.map((c) => (c.id === selectedId ? { ...c, status: to } : c)))
  }

  return (
    <main>
      <header>
        <h1>Case Docket</h1>
        <label>
          Role{' '}
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </header>
      {/* The list stays mounted but hidden, so search and filters survive a visit to the detail view */}
      <div hidden={selected !== undefined}>
        <CaseList cases={cases} role={role} onSelect={setSelectedId} />
      </div>
      {selected && (
        <CaseDetail
          caseItem={selected}
          role={role}
          onChangeStatus={changeStatus}
          onBack={() => setSelectedId(null)}
        />
      )}
    </main>
  )
}
