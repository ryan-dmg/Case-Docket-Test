/**
 * App.tsx
 * Purpose: top-level page; shows the app title and the case list.
 * Inputs: none.
 * Outputs: the page layout.
 */
import { CaseList } from './components/CaseList'
import { cases } from './data/cases'

export default function App() {
  return (
    <main>
      <h1>Case Docket</h1>
      <CaseList cases={cases} />
    </main>
  )
}
