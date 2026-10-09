import type { Finding } from '../types'
import { FindingCard } from './FindingCard'
import type { TaskStatus } from '../types'

interface ActionBoardProps {
  actionItems: Finding[]
  taskStatus: TaskStatus
  onToggleTask: (id: string) => void
}

export function ActionBoard({ actionItems, taskStatus, onToggleTask }: ActionBoardProps) {
  if (actionItems.length === 0) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm text-slate-400">No action items detected in this conversation.</p>
      </div>
    )
  }

  const completed = actionItems.filter((f) => taskStatus[f.id]).length
  const total = actionItems.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-green">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <h2 className="text-lg font-semibold text-white">Action Board</h2>
        </div>
        <span className="text-sm text-slate-400">{completed}/{total} done</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-navy-700">
        <div
          className="h-full rounded-full bg-accent-green transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="space-y-3">
        {actionItems.map((item) => (
          <FindingCard
            key={item.id}
            finding={item}
            onComplete={onToggleTask}
            isCompleted={!!taskStatus[item.id]}
            showCompleteButton
          />
        ))}
      </div>
    </div>
  )
}
