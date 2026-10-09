interface PrivacyNoticeProps {
  open: boolean
  onClose: () => void
}

export function PrivacyNotice({ open, onClose }: PrivacyNoticeProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative max-w-lg p-6 animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 id="privacy-title" className="text-lg font-semibold text-white">Privacy Notice</h2>
          </div>
          <button onClick={onClose} className="btn-ghost" aria-label="Close privacy notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p>
            <strong className="text-white">AI Mode:</strong> When you click "Analyze Conversation", your conversation text is sent to a Supabase Edge Function, which forwards it to Google's Gemini API for analysis. Your text is processed by Google's servers — it does not stay on your device.
          </p>
          <p>
            <strong className="text-white">Local Demo Mode:</strong> When you click "Local Demo Mode", analysis runs entirely in your browser using keyword matching. No data leaves your device. This is a simplified rule-based analyzer — it is <strong className="text-white">not AI</strong> and should not be relied upon for accurate results.
          </p>
          <p>
            <strong className="text-white">API Key:</strong> The Gemini API key is stored securely as a server-side secret on Supabase. It is never exposed in the browser or committed to the code repository.
          </p>
          <p>
            <strong className="text-white">Task Status:</strong> When you mark tasks as complete, that status is saved in your browser's local storage. It is not sent to any server.
          </p>
          <p>
            <strong className="text-white">No Persistence:</strong> Conversation text and analysis results are not stored in any database. They exist only in your current browser session.
          </p>
        </div>

        <button onClick={onClose} className="btn-primary mt-5 w-full">
          Got it
        </button>
      </div>
    </div>
  )
}
