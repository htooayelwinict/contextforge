# SpecPad

SpecPad is an **editor-first prompt engineering assistant** for writing AI instructions, specs, skill prompts, and architecture plans. It watches the draft as you type and provides live diagnostics and suggestion candidates.

The app does not read your repository or execute code. It helps you write better prompts before handing them to an LLM.

## Current implementation summary

- Monaco-based markdown editor (right sidebar diagnostics)
- Debounced draft analysis on each edit (800ms)
- Live suggestion cards:
  - Gaps
  - Ambiguities
  - Risk warnings
  - Detected SE patterns
- Inline insertion support for accepted suggestions (currently append-style, cursor-aware insert is pending)
- Template insertion for common prompt shapes
- Markdown export
- Optional **OpenRouter LLM** analysis with rule-based fallback
- `/api/analyze-draft` debug mode for checking which engine is used

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Monaco Editor (`@monaco-editor/react`)
- OpenAI SDK (OpenRouter-compatible)

## Project structure

- `src/app/page.tsx` — app shell (header, editor, sidebar)
- `src/app/api/analyze-draft/route.ts` — analysis API route
- `src/components/EditorPanel.tsx` — Monaco editor wrapper
- `src/components/Sidebar.tsx` — diagnostics + suggestion rendering
- `src/components/Header.tsx` — mode switch, templates, export, panel toggle
- `src/components/TemplateSelector.tsx` — one-click template loading
- `src/components/ExportButton.tsx` — markdown export button
- `src/store/editorStore.ts` — global editor state (Zustand)
- `src/lib/analyzer.ts` — rule-based analyzer
- `src/lib/llmAnalyzer.ts` — OpenRouter LLM analyzer + fallback
- `src/lib/patternRegistry.ts` — SE pattern signal definitions and suggestion text
- `src/lib/templates.ts` — built-in templates
- `src/hooks/useDraftAnalyzer.ts` — debounced API call + request cancellation logic
- `src/types/index.ts` — shared types
- `plan/specpad-20260613-040500/` — implementation plan and phase docs

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` (or `.env.local`) in project root with:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # optional (defaults to this)
OPENROUTER_MODEL=google/gemini-3.1-flash-lite    # optional
```

Notes:

- The analyzer uses the real key from env unless it is missing or the placeholder value `sk-or-v1-YOUR_KEY_HERE`.
- If a placeholder key is present, analysis falls back to rule-based mode.
- For security, keep keys out of source control and never commit `.env` files.

### 3) Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Select a mode in the header:
   - Prompt
   - Skill
   - Plan
   - Architecture
   - Review
2. Write your draft in the editor.
3. Sidebar updates with diagnostics and suggestions automatically.
4. Click **Insert** on suggestion cards to append suggested text.
5. Use **Templates** for prefilled starting drafts.
6. Export final content as `.md`.

## API behavior

### `POST /api/analyze-draft`

Request body:

```json
{
  "text": "Current draft text",
  "mode": "prompt" // one of prompt | skill | implementation-plan | architecture | review
}
```

Response (normal mode): `DraftAnalysis`

```ts
interface DraftAnalysis {
  taskType: "bugfix" | "refactor" | "feature" | "architecture" | "skill" | "test-plan" | "debugging" | "other";
  detectedPatterns: string[];
  diagnostics: Array<{
    id: string;
    type: "gap" | "ambiguity" | "risk";
    message: string;
    severity: "info" | "warning" | "error";
    suggestionText?: string;
  }>;
  suggestions: Array<{
    id: string;
    type: "insert_after_cursor" | "replace_selection" | "append" | "rewrite";
    label: string;
    preview: string;
    confidence: number;
    reason: string;
  }>;
  summary?: string;
}
```

### Debug mode

Call with `?debug=1` or `?debug=true`:

```bash
POST /api/analyze-draft?debug=1
```

Response includes `_debug`:

```json
{
  "_debug": {
    "engine": "llm" | "rule-no-key" | "rule-placeholder-key" | "rule-fallback-error" | "rule-cancelled",
    "model": "google/gemini-3.1-flash-lite",
    "error": "optional"
  }
}
```

This is useful to confirm whether LLM is actually being used.

## Engine behavior and fallback

- `rule-no-key` → key missing
- `rule-placeholder-key` → placeholder key detected
- `rule-fallback-error` → LLM request failed, fell back to rule-based analysis
- `rule-cancelled` → request canceled while in-flight (often from rapid typing and prior aborts)
- `llm` → normal LLM-assisted analysis

## Scripts

```bash
npm run dev     # start local dev server
npm run build   # build production bundle (webpack)
npm start       # start production server
npm run lint    # run ESLint
```

## Current limitations / next steps

- Suggestion insertion is currently append-oriented (cursor-aware insertion is planned in Phase 7).
- No local persistence yet (no Dexie-backed draft history in this build).
- Inline autocomplete (ghost text) is deferred.
- No keyboard shortcuts yet (export shortcut, palette, etc.)

## Contributing and follow-up work

The implementation plan folder is the source of truth for staged work and risk tracking:
- `plan/specpad-20260613-040500/plan.md`
- `plan/specpad-20260613-040500/phases/*`

## License / notes

This repository is a local app project scaffold and is currently in iterative development.
