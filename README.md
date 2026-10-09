# ThreadBack AI

> **You were away. Your conversations weren't.**

ThreadBack AI helps you catch up on long or overwhelming conversations — Slack threads, email chains, chat logs, meeting transcripts — by identifying what happened, what matters, what you need to do, and what you might have missed.

---

## Features

### Core Workflow
1. **Paste a conversation** — large text area with optional title and your name
2. **Analyze** — AI extracts a structured summary, missed information, action items, and priorities
3. **Catch-Up Summary** — main topic, key developments, current status
4. **Missed Information** — announcements, decisions, requests, changes, unresolved questions
5. **Action Items** — tasks, deadlines, assignees (only when explicitly stated)
6. **Priority Labels** — CRITICAL, HIGH, MEDIUM, LOW with explanations
7. **Source Evidence** — every finding includes an exact excerpt from the original conversation
8. **Filters** — All, Urgent, Decisions, Action Items, Deadlines
9. **Action Board** — task list with completion checkboxes, persisted in browser local storage
10. **Privacy Notice** — transparent disclosure of where analysis happens

### Design
- Dark navy background with slate panels
- Cyan accents, amber urgency indicators, red critical alerts
- Rounded cards, subtle animations, responsive layout
- Accessible labels, keyboard-friendly controls, readable contrast

---

## Setup

### Prerequisites
- Node.js 18+
- npm

### Install & Run
```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

The following are pre-configured in `.env` (Supabase project credentials):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (used to call the edge function) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (for edge function authentication) |

### Gemini API Key (Required for AI Mode)

The app uses **Google Gemini** (`gemini-3.8-flash` model) for AI analysis. This model has a free tier available through Google AI Studio.

**To enable AI analysis:**

1. Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Add the key as a Supabase Edge Function secret named `GEMINI_API_KEY`
   - In Bolt, go to your project's **Secrets** tab in the database/edge-function settings
   - Create a new secret with the name `GEMINI_API_KEY` and paste your key as the value
3. The key is stored securely on the server — it is never exposed in the browser or committed to the code repository

Until the key is set, the Analyze button will show a clear setup message, and users can use Local Demo Mode to explore the interface.

---

## Architecture

```
┌─────────────────────────────────────────┐
│              Browser (React)             │
│                                          │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │  Input   │  │   Results Dashboard   │ │
│  │  Panel   │──│  Summary, Findings,   │ │
│  │          │  │  Filters, Action Board│ │
│  └────┬─────┘  └──────────────────────┘ │
│       │                    │             │
│       │ fetch()            │ localStorage│
│       ▼                    ▼             │
└───────┼────────────────────┼─────────────┘
        │                    │
        ▼                    │
┌───────────────────┐        │
│  Supabase Edge    │        │
│  Function         │        │
│  (analyze-        │        │
│   conversation)   │        │
│       │           │        │
│       ▼           │        │
│  ┌─────────┐      │        │
│  │ Google  │      │        │
│  │ Gemini  │      │        │
│  │ API     │      │        │
│  │(server- │      │        │
│  │ side key)│     │        │
│  └─────────┘      │        │
└───────────────────┘        │
                             │
              ┌──────────────┘
              ▼
    ┌──────────────────┐
    │ Browser Local    │
    │ Storage          │
    │ (task status)    │
    └──────────────────┘
```

### Key Design Decisions

- **API key security**: The Gemini key lives only on the server (Supabase Edge Function secret). The browser never sees it.
- **No database**: Conversations and analysis results are not persisted. They exist only in the current browser session.
- **Local task status**: Completed tasks are saved in `localStorage` under the key `threadback_task_status`.
- **Output validation**: The frontend validates the AI response structure before rendering — malformed or missing fields trigger an error state, not silent rendering.

---

## Two Analysis Modes

### AI Mode (Analyze Conversation button)
- Sends conversation text to the Supabase Edge Function
- The edge function forwards it to Google Gemini (`gemini-3.8-flash`)
- Returns structured JSON: summary, findings with priority, source excerpts
- Requires `GEMINI_API_KEY` secret on Supabase
- Uses Gemini's native JSON response mode (`responseMimeType: application/json`)

### Local Demo Mode (Local Demo Mode button)
- Runs entirely in the browser using keyword matching
- No data leaves the device
- **This is NOT AI** — it's a simplified rule-based analyzer
- Clearly labeled as "Local demo (not AI)" in the UI
- All findings are marked as "Uncertain" since keyword matching is imprecise

---

## Privacy & AI Disclosure

- **AI Mode**: Your conversation text is sent to a Supabase Edge Function, which forwards it to Google's Gemini API. Text is processed by Google's servers.
- **Local Demo Mode**: Analysis runs entirely in your browser. No data leaves your device.
- **API Key**: Stored as a server-side Supabase secret named `GEMINI_API_KEY`. Never exposed in browser code or committed to the repository.
- **Task Status**: Saved in browser local storage. Not sent to any server.
- **No Data Persistence**: Conversations and results are not stored in any database.

---

## Error Handling

The application distinguishes between these error types and shows specific messages:

| Condition | Behavior |
|-----------|----------|
| Missing `GEMINI_API_KEY` | Shows "AI analysis is not configured" with instructions |
| Invalid/expired key (HTTP 403) | Shows "The AI provider rejected the API key" |
| Rate limit / quota exceeded (HTTP 429) | Shows "rate-limited" message, suggests trying later |
| Model not found (HTTP 404) | Shows the model name that wasn't found |
| Malformed AI output | Shows "malformed response" message |
| Network failures | Shows a generic error with retry suggestion |
| Empty input | Analyze button is disabled |
| Safety filter blocked | Shows "blocked due to safety filters" message |

---

## Testing Steps

1. **Start the dev server**: `npm run dev`
2. **Load example**: Click "Load Example" to populate the form with sample data
3. **Local Demo Mode**: Click "Local Demo Mode" — should produce rule-based findings labeled as "Local demo (not AI)"
4. **AI Mode** (requires `GEMINI_API_KEY`): Click "Analyze Conversation" — should produce AI-generated findings with source excerpts
5. **AI Mode without key**: Click "Analyze Conversation" — should show a clear setup message
6. **Filters**: Click each filter tab (All, Urgent, Decisions, Action Items, Deadlines) — findings should update
7. **Action Board**: Click "Mark complete" on tasks — progress bar should update, status persists across page reload
8. **Empty input**: Try analyzing with empty or very short text — button should be disabled
9. **Privacy notice**: Click "Privacy" in the header — modal should appear
10. **Build**: `npm run build` — should complete without errors

---

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase Edge Functions** (Deno) for server-side AI API calls
- **Google Gemini** (`gemini-3.8-flash`) for AI analysis

## Project Structure

```
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── .env.example              # Placeholder template (no real secrets)
├── .gitignore                # Excludes .env, node_modules, dist
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app component & state
│   ├── index.css             # Tailwind + custom styles
│   ├── types.ts              # TypeScript types
│   ├── api.ts                # Edge function API client + validation
│   ├── localDemo.ts          # Rule-based local analyzer (NOT AI)
│   ├── sampleData.ts         # Example conversation
│   ├── utils.ts              # Helper functions (filtering, labels)
│   ├── vite-env.d.ts         # Vite env type declarations
│   └── components/
│       ├── Header.tsx
│       ├── InputPanel.tsx
│       ├── SummaryCard.tsx
│       ├── FindingCard.tsx
│       ├── FilterBar.tsx
│       ├── ActionBoard.tsx
│       ├── ResultsSection.tsx
│       └── PrivacyNotice.tsx
├── supabase/
│   ├── config.toml
│   └── functions/
│       └── analyze-conversation/
│           └── index.ts      # Edge function: proxies Google Gemini API
└── .env                      # Supabase URL + anon key (gitignored)
```

---

## Feature Status

| Feature | Status |
|---------|--------|
| Conversation input with example data | ✅ Working |
| AI analysis (Google Gemini 3.8 Flash) | ✅ Working (requires `GEMINI_API_KEY` secret) |
| Local demo mode (rule-based) | ✅ Working |
| Catch-up summary | ✅ Working |
| Missed information extraction | ✅ Working |
| Action items with deadlines/assignees | ✅ Working |
| Priority labels (CRITICAL/HIGH/MEDIUM/LOW) | ✅ Working |
| Source evidence excerpts | ✅ Working |
| Filters (All/Urgent/Decisions/Action Items/Deadlines) | ✅ Working |
| Action board with task completion | ✅ Working (localStorage persistence) |
| Privacy notice | ✅ Working |
| Loading & error states | ✅ Working |
| Output validation | ✅ Working |
| Responsive design | ✅ Working |
| Accessible labels & keyboard controls | ✅ Working |
