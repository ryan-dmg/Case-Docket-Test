/**
 * App.tsx
 * Purpose: top-level page; shows the title, the role switcher and the case list.
 * Inputs: none.
 * Outputs: the page layout. The chosen role is held here so every part of the
 * page reads the same value.
 */
import { useState } from 'react'
import { CaseList } from './components/CaseList'
import { cases } from './data/cases'
import { ROLES, type Role } from './types'

export default function App() {
  // Start with the least-privileged role
  const [role, setRole] = useState<Role>('viewer')

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
      <CaseList cases={cases} role={role} />
    </main>
  )
}
