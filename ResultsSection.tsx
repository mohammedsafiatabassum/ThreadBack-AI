import type { AnalysisResponse, FilterType, TaskStatus } from '../types'
import { SummaryCard } from './SummaryCard'
import { FilterBar } from './FilterBar'
import { FindingCard } from './FindingCard'
import { ActionBoard } from './ActionBoard'
import { filterFindings } from '../utils'

interface ResultsSectionProps {
  response: AnalysisResponse
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  taskStatus: TaskStatus
  onToggleTask: (id: string) => void
  onReset: () => void
}

export function ResultsSection({
  response,
  activeFilter,
  onFilterChange,
  taskStatus,
  onToggleTask,
  onReset,
}: ResultsSectionProps) {
  const { result, provider } = response
  const filteredFindings = filterFindings(result.allFindings, activeFilter)

  return (
    <div className="space-y-5">
      <SummaryCard result={result} provider={provider} />

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Findings</h2>
          <button onClick={onReset} className="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            New Analysis
          </button>
        </div>

        <FilterBar
          findings={result.allFindings}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      {filteredFindings.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-400">No findings match this filter.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isCompleted={!!taskStatus[finding.id]}
              showCompleteButton={finding.type === 'action_item' || finding.type === 'deadline'}
              onComplete={onToggleTask}
            />
          ))}
        </div>
      )}

      <ActionBoard
        actionItems={result.actionItems}
        taskStatus={taskStatus}
        onToggleTask={onToggleTask}
      />
    </div>
  )
}
