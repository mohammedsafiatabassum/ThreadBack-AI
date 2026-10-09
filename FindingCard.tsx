import type { Finding } from '../types'
import { priorityBadgeClass, priorityLabel, typeLabel, typeIcon } from '../utils'

interface FindingCardProps {
  finding: Finding
  onComplete?: (id: string) => void
  isCompleted?: boolean
  showCompleteButton?: boolean
}

export function FindingCard({ finding, onComplete, isCompleted, showCompleteButton }: FindingCardProps) {
  return (
    <div
      className={`card card-hover p-4 animate-fade-in ${isCompleted ? 'opacity-50' : ''}`}
      role="article"
      aria-label={`${typeLabel(finding.type)}: ${finding.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
              finding.priority === 'CRITICAL'
                ? 'bg-accent-red/15 text-accent-red border border-accent-red/30'
                : finding.priority === 'HIGH'
                ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                : finding.priority === 'MEDIUM'
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
            }`}
            aria-hidden="true"
          >
            {typeIcon(finding.type)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={priorityBadgeClass(finding.priority)}>{priorityLabel(finding.priority)}</span>
            <span className="rounded-full bg-navy-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              {typeLabel(finding.type)}
            </span>
            {finding.uncertain && (
              <span className="rounded-full bg-accent-amber/10 px-2.5 py-0.5 text-xs font-medium text-accent-amber border border-accent-amber/20">
                Uncertain
              </span>
            )}
            {isCompleted && (
              <span className="rounded-full bg-accent-green/15 px-2.5 py-0.5 text-xs font-medium text-accent-green border border-accent-green/30">
                Completed
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-white">{finding.title}</h4>
          <p className="mt-1 text-sm text-slate-400">{finding.description}</p>

          {(finding.assignee || finding.deadline) && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              {finding.assignee && (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {finding.assignee}
                </span>
              )}
              {finding.deadline && (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {finding.deadline}
                  {!finding.deadlineConfirmed && <span className="text-accent-amber">(unconfirmed)</span>}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 rounded-lg border border-navy-700 bg-navy-900/60 px-3 py-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Source evidence</p>
            <p className="text-xs italic leading-relaxed text-slate-400">"{finding.sourceExcerpt}"</p>
            {finding.sourceReference && (
              <p className="mt-1 text-xs text-slate-600">— {finding.sourceReference}</p>
            )}
          </div>

          {showCompleteButton && onComplete && (
            <button
              onClick={() => onComplete(finding.id)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-accent-green"
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark task as complete'}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded border ${isCompleted ? 'border-accent-green bg-accent-green/20 text-accent-green' : 'border-slate-600'}`}>
                {isCompleted && '✓'}
              </span>
              {isCompleted ? 'Completed' : 'Mark complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
