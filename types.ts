export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type FindingType =
  | 'decision'
  | 'action_item'
  | 'announcement'
  | 'deadline'
  | 'unresolved_question'
  | 'change'
  | 'request'
  | 'note'

export interface Finding {
  id: string
  type: FindingType
  priority: Priority
  title: string
  description: string
  sourceExcerpt: string
  sourceReference?: string
  assignee?: string
  deadline?: string
  deadlineConfirmed: boolean
  uncertain: boolean
}

export interface AnalysisResult {
  summary: {
    mainTopic: string
    keyDevelopments: string[]
    currentStatus: string
  }
  missedInformation: Finding[]
  actionItems: Finding[]
  allFindings: Finding[]
}

export interface AnalysisResponse {
  result: AnalysisResult
  provider: 'ai' | 'local-demo'
}

export type FilterType = 'all' | 'urgent' | 'decisions' | 'action_items' | 'deadlines'

export interface TaskStatus {
  [findingId: string]: boolean
}
