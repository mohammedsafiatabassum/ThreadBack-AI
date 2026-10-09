import { useState } from 'react'
import { SAMPLE_CONVERSATION, SAMPLE_CONVERSATION_TITLE } from '../sampleData'

interface InputPanelProps {
  onAnalyze: (conversation: string, title: string, userName: string, useDemoMode: boolean) => void
  isLoading: boolean
  error: string | null
  hasApiKey: boolean | null
}

export function InputPanel({ onAnalyze, isLoading, error, hasApiKey }: InputPanelProps) {
  const [conversation, setConversation] = useState('')
  const [title, setTitle] = useState('')
  const [userName, setUserName] = useState('')

  function handleAnalyze(useDemo: boolean) {
    if (conversation.trim().length < 20) return
    onAnalyze(conversation, title.trim() || 'Untitled conversation', userName.trim(), useDemo)
  }

  function handleLoadExample() {
    setConversation(SAMPLE_CONVERSATION)
    setTitle(SAMPLE_CONVERSATION_TITLE)
  }

  function handleClear() {
    setConversation('')
    setTitle('')
    setUserName('')
  }

  const charCount = conversation.length
  const canAnalyze = conversation.trim().length >= 20 && !isLoading

  return (
    <div className="card animate-slide-up p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Paste a conversation to analyze</h2>
        <p className="mt-1 text-sm text-slate-400">
          Paste a Slack thread, email chain, chat log, or meeting transcript. ThreadBack AI will identify what happened, what matters, and what you need to do.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="conversation-title" className="mb-1.5 block text-sm font-medium text-slate-300">
              Conversation title
            </label>
            <input
              id="conversation-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Launch — Slack #launch-team"
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Your name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Helps identify your action items"
              className="input-field"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="conversation-text" className="block text-sm font-medium text-slate-300">
              Conversation text
            </label>
            <span className={`text-xs ${charCount > 50000 ? 'text-accent-red' : 'text-slate-500'}`}>
              {charCount.toLocaleString()} / 50,000
            </span>
          </div>
          <textarea
            id="conversation-text"
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder="Paste your conversation here…"
            rows={10}
            className="textarea-field"
            disabled={isLoading}
            aria-describedby="conversation-help"
            maxLength={50000}
          />
          <p id="conversation-help" className="mt-1.5 text-xs text-slate-500">
            Include speaker names for best results. Text is sent securely to the AI analysis service — see the privacy notice.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3 animate-fade-in" role="alert">
            <div className="flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-accent-red">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-sm font-medium text-accent-red">Analysis failed</p>
                <p className="mt-0.5 text-sm text-slate-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleAnalyze(false)}
            disabled={!canAnalyze}
            className="btn-primary"
            aria-label="Analyze conversation with AI"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60" strokeLinecap="round" />
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Analyze Conversation
              </>
            )}
          </button>

          <button
            onClick={() => handleAnalyze(true)}
            disabled={!canAnalyze || isLoading}
            className="btn-secondary"
            aria-label="Run local demo analysis (rule-based, not AI)"
            title="Rule-based keyword matching — not AI"
          >
            Local Demo Mode
          </button>

          <button
            onClick={handleLoadExample}
            disabled={isLoading}
            className="btn-ghost"
          >
            Load Example
          </button>

          {conversation && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="btn-ghost"
            >
              Clear
            </button>
          )}
        </div>

        {hasApiKey === false && (
          <div className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 animate-fade-in">
            <p className="text-sm text-accent-amber">
              <strong>AI mode unavailable.</strong> The Gemini API key on the server is either missing, invalid, or expired. The error above has more details. You can use <strong>Local Demo Mode</strong> to explore the interface with rule-based keyword matching (not AI). See the README for setup instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
