interface HeaderProps {
  onShowPrivacy: () => void
}

export function Header({ onShowPrivacy }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-700 bg-navy-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-cyan/15 border border-accent-cyan/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white sm:text-xl">ThreadBack AI</h1>
            <p className="hidden text-xs text-slate-400 sm:block">You were away. Your conversations weren't.</p>
          </div>
        </div>
        <button
          onClick={onShowPrivacy}
          className="btn-ghost"
          aria-label="Privacy notice"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="hidden sm:inline">Privacy</span>
        </button>
      </div>
    </header>
  )
}
