import type { AnalysisResult } from '../types'

interface SummaryCardProps {
  result: AnalysisResult
  provider: 'ai' | 'local-demo'
}

export function SummaryCard({ result, provider }: SummaryCardProps) {
  return (
    <div className="card animate-slide-up p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <h2 className="text-lg font-semibold text-white">Catch-Up Summary</h2>
        {provider === 'local-demo' && (
          <span className="rounded-md bg-slate-600/20 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-600/30">
            Local demo (not AI)
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Main topic</h3>
          <p className="text-base text-slate-200">{result.summary.mainTopic}</p>
        </div>

        {result.summary.keyDevelopments.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Key developments</h3>
            <ul className="space-y-1.5">
              {result.summary.keyDevelopments.map((dev, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                  <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                  {dev}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Current status</h3>
          <p className="text-sm text-slate-300">{result.summary.currentStatus}</p>
        </div>
      </div>
    </div>
  )
}
