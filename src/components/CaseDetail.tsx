/**
 * CaseDetail.tsx
 * Purpose: shows one case and the status changes the current role may make.
 * Inputs: `caseItem` (the case), `role` (current role), `onChangeStatus`
 * (called with the new status) and `onBack` (return to the list).
 * Outputs: the detail view. Only moves allowed by the rules module are offered.
 */
import { allowedTransitions } from '../rules'
import type { Case, Role, Status } from '../types'

export function CaseDetail({
  caseItem,
  role,
  onChangeStatus,
  onBack,
}: {
  caseItem: Case
  role: Role
  onChangeStatus: (to: Status) => void
  onBack: () => void
}) {
  // The buttons come straight from the rules, so the UI can't offer a rejected move
  const moves = allowedTransitions(role, caseItem.status)

  return (
    <section aria-labelledby="detail-heading">
      <button type="button" onClick={onBack}>
        Back to list
      </button>
      <h2 id="detail-heading">{caseItem.title}</h2>
      <dl>
        <dt>Id</dt>
        <dd>{caseItem.id}</dd>
        <dt>Parties</dt>
        <dd>
          {caseItem.plaintiff} / {caseItem.defendant}
        </dd>
        <dt>Filed on</dt>
        <dd>{caseItem.filedOn}</dd>
      </dl>
      <p aria-live="polite">
        <strong>Current status:</strong> {caseItem.status}
      </p>
      <div className="moves">
        {moves.map((to) => (
          <button key={to} type="button" onClick={() => onChangeStatus(to)}>
            Move to {to}
          </button>
        ))}
      </div>
      {moves.length === 0 && <p>No status changes are available for your role.</p>}
    </section>
  )
}
