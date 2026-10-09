import type { AnalysisResult, AnalysisResponse, Finding, Priority, FindingType } from './types'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-conversation`

interface AnalyzeParams {
  conversation: string
  title: string
  userName?: string
}

export async function analyzeConversation(params: AnalyzeParams): Promise<AnalysisResponse> {
  const { conversation, title, userName } = params

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversation, title, userName }),
  })

  if (!response.ok) {
    let errorMsg = `Analysis request failed (HTTP ${response.status})`
    try {
      const errorBody = await response.json()
      if (errorBody.error) errorMsg = errorBody.error
    } catch {
      // response body wasn't JSON
    }
    throw new Error(errorMsg)
  }

  const data = await response.json()
  const result = validateAnalysisResult(data.result)
  const provider = data.provider === 'ai' ? 'ai' : 'local-demo'

  return { result, provider }
}

function validateAnalysisResult(raw: unknown): AnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Received an invalid analysis response from the server.')
  }

  const obj = raw as Record<string, unknown>

  const summary = obj.summary
  if (!summary || typeof summary !== 'object') {
    throw new Error('The analysis response is missing a summary section.')
  }

  const summaryObj = summary as Record<string, unknown>
  if (typeof summaryObj.mainTopic !== 'string' || typeof summaryObj.currentStatus !== 'string') {
    throw new Error('The summary section is malformed.')
  }

  const keyDevelopments = Array.isArray(summaryObj.keyDevelopments)
    ? summaryObj.keyDevelopments.filter((d): d is string => typeof d === 'string')
    : []

  const allFindings = Array.isArray(obj.allFindings) ? obj.allFindings : []
  const validatedFindings = allFindings.map(validateFinding)

  const missedInformation = Array.isArray(obj.missedInformation)
    ? obj.missedInformation.map(validateFinding)
    : []
  const actionItems = Array.isArray(obj.actionItems)
    ? obj.actionItems.map(validateFinding)
    : []

  return {
    summary: {
      mainTopic: summaryObj.mainTopic,
      keyDevelopments,
      currentStatus: summaryObj.currentStatus,
    },
    missedInformation,
    actionItems,
    allFindings: validatedFindings,
  }
}

const VALID_PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const VALID_TYPES: FindingType[] = [
  'decision', 'action_item', 'announcement', 'deadline',
  'unresolved_question', 'change', 'request', 'note',
]

function validateFinding(raw: unknown, index: number): Finding {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Finding #${index + 1} is malformed.`)
  }

  const obj = raw as Record<string, unknown>

  const priority = VALID_PRIORITIES.includes(obj.priority as Priority)
    ? (obj.priority as Priority)
    : 'MEDIUM'

  const type = VALID_TYPES.includes(obj.type as FindingType)
    ? (obj.type as FindingType)
    : 'note'

  if (typeof obj.title !== 'string' || typeof obj.description !== 'string') {
    throw new Error(`Finding #${index + 1} is missing a title or description.`)
  }

  if (typeof obj.sourceExcerpt !== 'string' || obj.sourceExcerpt.trim().length === 0) {
    throw new Error(`Finding #${index + 1} is missing a source excerpt — cannot verify.`)
  }

  return {
    id: typeof obj.id === 'string' ? obj.id : `finding-${index}`,
    type,
    priority,
    title: obj.title,
    description: obj.description,
    sourceExcerpt: obj.sourceExcerpt,
    sourceReference: typeof obj.sourceReference === 'string' ? obj.sourceReference : undefined,
    assignee: typeof obj.assignee === 'string' && obj.assignee.trim() ? obj.assignee : undefined,
    deadline: typeof obj.deadline === 'string' && obj.deadline.trim() ? obj.deadline : undefined,
    deadlineConfirmed: typeof obj.deadlineConfirmed === 'boolean' ? obj.deadlineConfirmed : false,
    uncertain: typeof obj.uncertain === 'boolean' ? obj.uncertain : false,
  }
}
