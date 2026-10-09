import type { FilterType } from '../types'
import { filterLabel, filterCount } from '../utils'
import type { Finding } from '../types'

interface FilterBarProps {
  findings: Finding[]
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const FILTERS: FilterType[] = ['all', 'urgent', 'decisions', 'action_items', 'deadlines']

export function FilterBar({ findings, activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter findings">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          role="tab"
          aria-selected={activeFilter === filter}
          onClick={() => onFilterChange(filter)}
          className={`filter-btn ${activeFilter === filter ? 'filter-btn-active' : 'filter-btn-inactive'}`}
        >
          {filterLabel(filter)}
          <span className="ml-1.5 text-xs opacity-70">({filterCount(findings, filter)})</span>
        </button>
      ))}
    </div>
  )
}
