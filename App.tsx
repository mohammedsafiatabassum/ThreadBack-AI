import { useState, useEffect, useCallback } from 'react'
import type { AnalysisResponse, FilterType, TaskStatus } from './types'
import { Header } from './components/Header'
import { InputPanel } from './components/InputPanel'
import { ResultsSection } from './components/ResultsSection'
import { PrivacyNotice } from './components/PrivacyNotice'
import { analyzeConversation } from './api'
import { localDemoAnalyze } from './localDemo'

const TASK_STATUS_KEY = 'threadback_task_status'

export default function App() {
  const [response, setResponse] = useState<AnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TASK_STATUS_KEY)
      if (saved) setTaskStatus(JSON.parse(saved))
    } catch {
      // localStorage unavailable or corrupted
    }
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTaskStatus((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(TASK_STATUS_KEY, JSON.stringify(next))
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }, [])

  const handleAnalyze = useCallback(
    async (conversation: string, title: string, userName: string, useDemo: boolean) => {
      setIsLoading(true)
      setError(null)

      if (useDemo) {
        try {
          const result = localDemoAnalyze(conversation, title, userName || undefined)
          setResponse({ result, provider: 'local-demo' })
          setActiveFilter('all')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Local demo analysis failed.')
        } finally {
          setIsLoading(false)
        }
        return
      }

      try {
        const res = await analyzeConversation({ conversation, title, userName: userName || undefined })
        setResponse(res)
        setHasApiKey(true)
        setActiveFilter('all')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
        setError(msg)
        if (msg.includes('not configured') || msg.includes('GEMINI_API_KEY') || msg.includes('invalid or expired') || msg.includes('401') || msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
          setHasApiKey(false)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const handleReset = useCallback(() => {
    setResponse(null)
    setError(null)
    setActiveFilter('all')
  }, [])

  return (
    <div className="min-h-screen bg-navy-950">
      <Header onShowPrivacy={() => setShowPrivacy(true)} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {!response && (
          <div className="mb-6 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              You were away. <span className="text-accent-cyan">Your conversations weren't.</span>
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Paste a conversation and ThreadBack AI will tell you what happened, what matters, what you need to do, and what you might have missed.
            </p>
          </div>
        )}

        {!response ? (
          <InputPanel
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            hasApiKey={hasApiKey}
          />
        ) : (
          <ResultsSection
            response={response}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            taskStatus={taskStatus}
            onToggleTask={toggleTask}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-navy-700 py-4">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          ThreadBack AI — AI-powered conversation catch-up. Analysis powered by Google Gemini.
          {' '}
          <button onClick={() => setShowPrivacy(true)} className="underline hover:text-slate-300">
            Privacy notice
          </button>
        </div>
      </footer>

      <PrivacyNotice open={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  )
}
