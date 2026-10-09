import type { Priority, FindingType, FilterType, Finding } from './types'

export function priorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case 'CRITICAL': return 'badge-critical'
    case 'HIGH': return 'badge-high'
    case 'MEDIUM': return 'badge-medium'
    case 'LOW': return 'badge-low'
    default: return 'badge-low'
  }
}

export function priorityLabel(priority: Priority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase()
}

export function typeLabel(type: FindingType): string {
  const labels: Record<FindingType, string> = {
    decision: 'Decision',
    action_item: 'Action Item',
    announcement: 'Announcement',
    deadline: 'Deadline',
    unresolved_question: 'Open Question',
    change: 'Change',
    request: 'Request',
    note: 'Note',
  }
  return labels[type] || 'Note'
}

export function typeIcon(type: FindingType): string {
  const icons: Record<FindingType, string> = {
    decision: '✓',
    action_item: '▸',
    announcement: '!',
    deadline: '⏱',
    unresolved_question: '?',
    change: '↻',
    request: '←',
    note: '•',
  }
  return icons[type] || '•'
}

export function isUrgent(finding: Finding): boolean {
  return finding.priority === 'CRITICAL' || finding.priority === 'HIGH'
}

export function filterFindings(findings: Finding[], filter: FilterType): Finding[] {
  switch (filter) {
    case 'urgent':
      return findings.filter(isUrgent)
    case 'decisions':
      return findings.filter((f) => f.type === 'decision' || f.type === 'change' || f.type === 'announcement')
    case 'action_items':
      return findings.filter((f) => f.type === 'action_item' || f.type === 'request')
    case 'deadlines':
      return findings.filter((f) => f.type === 'deadline' || !!f.deadline)
    case 'all':
    default:
      return findings
  }
}

export function filterLabel(filter: FilterType): string {
  const labels: Record<FilterType, string> = {
    all: 'All',
    urgent: 'Urgent',
    decisions: 'Decisions',
    action_items: 'Action Items',
    deadlines: 'Deadlines',
  }
  return labels[filter]
}

export function filterCount(findings: Finding[], filter: FilterType): number {
  return filterFindings(findings, filter).length
}
