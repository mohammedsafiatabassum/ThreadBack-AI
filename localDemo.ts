import type { AnalysisResult, Finding } from './types'

/**
 * This is a LOCAL, rule-based analyzer — NOT AI.
 * It uses keyword matching and pattern detection to produce a rough summary.
 * It is clearly labeled as "local demo" in the UI and must never be presented
 * as AI-generated output.
 */
export function localDemoAnalyze(conversation: string, title: string, _userName?: string): AnalysisResult {
  const lines = conversation.split('\n').filter((l) => l.trim().length > 0)

  // Detect speakers (lines that look like "Name ...")
  const speakerPattern = /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/
  const speakers = new Set<string>()
  for (const line of lines) {
    const match = line.match(speakerPattern)
    if (match) speakers.add(match[1])
  }

  // Detect deadlines
  const deadlineKeywords = /\b(by|due|before|deadline|end of (?:day|week|month)|today|tomorrow|this (?:Friday|Monday|Wednesday)|next (?:Monday|week)|October \d+|November \d+)\b/gi
  const deadlineLines: { line: string; index: number }[] = []
  lines.forEach((line, i) => {
    if (deadlineKeywords.test(line)) deadlineLines.push({ line, index: i })
  })

  // Detect decisions
  const decisionKeywords = /\b(confirmed|approved|decided|signed off|agreed|finalized|locked in)\b/gi
  const decisionLines: { line: string; index: number }[] = []
  lines.forEach((line, i) => {
    if (decisionKeywords.test(line)) decisionLines.push({ line, index: i })
  })

  // Detect action items
  const actionKeywords = /\b(I(?:'ll| will)|can you|need someone|please|I can take|assign|task|follow up|schedule)\b/gi
  const actionLines: { line: string; index: number }[] = []
  lines.forEach((line, i) => {
    if (actionKeywords.test(line)) actionLines.push({ line, index: i })
  })

  // Detect questions
  const questionLines: { line: string; index: number }[] = []
  lines.forEach((line, i) => {
    if (line.includes('?')) questionLines.push({ line, index: i })
  })

  // Detect critical/urgent
  const criticalKeywords = /\b(critical|urgent|p0|blocker|escalation|threatening|churn|broken|down)\b/gi
  const criticalLines: { line: string; index: number }[] = []
  lines.forEach((line, i) => {
    if (criticalKeywords.test(line)) criticalLines.push({ line, index: i })
  })

  const findings: Finding[] = []
  let findingCounter = 0

  function makeFinding(
    type: Finding['type'],
    priority: Finding['priority'],
    title: string,
    description: string,
    excerpt: string,
    extra?: Partial<Finding>,
  ): Finding {
    findingCounter++
    return {
      id: `demo-f${findingCounter}`,
      type,
      priority,
      title,
      description,
      sourceExcerpt: excerpt.trim(),
      uncertain: true, // demo findings are always marked uncertain
      deadlineConfirmed: false,
      ...extra,
    }
  }

  // Critical findings
  for (const { line } of criticalLines) {
    findings.push(
      makeFinding(
        'note',
        'CRITICAL',
        'Urgent issue detected in conversation',
        'This message contains urgent or critical language that likely requires immediate attention.',
        line,
      ),
    )
  }

  // Decisions
  for (const { line } of decisionLines) {
    findings.push(
      makeFinding(
        'decision',
        'HIGH',
        'Decision made during the conversation',
        'A decision was confirmed or approved. This may affect your plans or require alignment.',
        line,
        { uncertain: false },
      ),
    )
  }

  // Deadlines
  for (const { line } of deadlineLines) {
    const hasConfirmed = /\b(confirmed|approved|signed off|finalized)\b/i.test(line)
    findings.push(
      makeFinding(
        'deadline',
        'HIGH',
        'Deadline or time-sensitive commitment mentioned',
        'A specific date or deadline was referenced. Verify the exact date and your responsibilities.',
        line,
        { deadlineConfirmed: hasConfirmed },
      ),
    )
  }

  // Action items
  for (const { line } of actionLines) {
    if (findings.some((f) => f.sourceExcerpt === line.trim())) continue
    const assigneeMatch = line.match(speakerPattern)
    findings.push(
      makeFinding(
        'action_item',
        'MEDIUM',
        'Possible action item or task',
        'This message may describe a task or commitment. Verify who is responsible and what needs to be done.',
        line,
        assigneeMatch ? { assignee: assigneeMatch[1] } : undefined,
      ),
    )
  }

  // Unresolved questions
  for (const { line } of questionLines) {
    if (findings.some((f) => f.sourceExcerpt === line.trim())) continue
    findings.push(
      makeFinding(
        'unresolved_question',
        'MEDIUM',
        'Open question in the conversation',
        'This message contains a question that may or may not have been answered. Check if it affects you.',
        line,
      ),
    )
  }

  const actionItems = findings.filter((f) => f.type === 'action_item' || f.type === 'deadline')
  const missedInformation = findings.filter(
    (f) => f.type === 'decision' || f.type === 'announcement' || f.type === 'change' || f.type === 'unresolved_question' || f.type === 'note',
  )

  const mainTopic = title || 'Conversation summary'
  const keyDevelopments: string[] = []
  if (decisionLines.length > 0) keyDevelopments.push(`${decisionLines.length} decision(s) were made or confirmed.`)
  if (deadlineLines.length > 0) keyDevelopments.push(`${deadlineLines.length} deadline(s) or time-sensitive items were mentioned.`)
  if (criticalLines.length > 0) keyDevelopments.push(`${criticalLines.length} critical or urgent issue(s) were raised.`)
  if (actionLines.length > 0) keyDevelopments.push(`${actionLines.length} possible action item(s) or commitments were discussed.`)
  if (keyDevelopments.length === 0) keyDevelopments.push('No major developments detected by the rule-based analyzer.')

  const currentStatus = `This conversation involves ${speakers.size > 0 ? speakers.size : 'multiple'} participant(s). ` +
    `The local demo analyzer detected ${findings.length} potential findings using keyword matching. ` +
    `Note: This is a simplified rule-based analysis, not AI. For accurate analysis, configure the Gemini API key.`

  return {
    summary: {
      mainTopic,
      keyDevelopments,
      currentStatus,
    },
    missedInformation,
    actionItems,
    allFindings: findings,
  }
}
