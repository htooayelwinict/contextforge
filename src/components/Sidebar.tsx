"use client";

import { useEditorStore } from "@/store/editorStore";
import type { Diagnostic, Suggestion } from "@/types";

// ─── Diagnostic Card ───────────────────────────────────────────────

function DiagnosticCard({
  diagnostic,
  onInsert,
}: {
  diagnostic: Diagnostic;
  onInsert?: (text: string) => void;
}) {
  const severityStyles: Record<string, string> = {
    info: "border-l-blue-400 bg-blue-50 dark:bg-blue-950/30",
    warning: "border-l-amber-400 bg-amber-50 dark:bg-amber-950/30",
    error: "border-l-red-400 bg-red-50 dark:bg-red-950/30",
  };

  const severityIcons: Record<string, string> = {
    info: "ℹ",
    warning: "⚠",
    error: "✕",
  };

  const typeLabels: Record<string, string> = {
    gap: "Missing",
    ambiguity: "Vague",
    risk: "Risk",
  };

  return (
    <div
      className={`rounded-md border-l-4 p-3 ${severityStyles[diagnostic.severity] ?? severityStyles.info}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-sm">{severityIcons[diagnostic.severity]}</span>
        <div className="flex-1">
          <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {typeLabels[diagnostic.type] ?? diagnostic.type}
          </span>
          <p className="mt-1 text-sm leading-snug text-zinc-800 dark:text-zinc-200">
            {diagnostic.message}
          </p>
          {diagnostic.suggestionText && onInsert && (
            <button
              onClick={() => onInsert(diagnostic.suggestionText!)}
              className="mt-2 rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
            >
              + {diagnostic.suggestionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion Card ───────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {suggestion.label}
      </p>
      <p className="mt-1 rounded bg-zinc-50 px-2 py-1.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {suggestion.preview}
      </p>
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{suggestion.reason}</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onAccept}
          className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Insert
        </button>
        <button
          onClick={onReject}
          className="rounded border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────

export default function Sidebar() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const analysis = useEditorStore((s) => s.analysis);
  const isAnalyzing = useEditorStore((s) => s.isAnalyzing);
  const acceptSuggestion = useEditorStore((s) => s.acceptSuggestion);
  const rejectSuggestion = useEditorStore((s) => s.rejectSuggestion);
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);

  const handleAcceptSuggestion = (s: Suggestion) => {
    acceptSuggestion(s);

    // Insert the suggestion text into the editor
    switch (s.type) {
      case "append": {
        const separator = content.trim() ? "\n\n" : "";
        setContent(content + separator + s.preview);
        break;
      }
      case "insert_after_cursor": {
        // For now, append at end (cursor insertion will be wired in Phase 7)
        const separator = content.trim() ? "\n\n" : "";
        setContent(content + separator + s.preview);
        break;
      }
      case "replace_selection":
      case "rewrite": {
        // For now, append at end (selection replacement will be wired in Phase 7)
        const separator = content.trim() ? "\n\n" : "";
        setContent(content + separator + s.preview);
        break;
      }
    }
  };

  if (!sidebarOpen) return null;

  const diagnostics = analysis?.diagnostics ?? [];
  const suggestions = analysis?.suggestions ?? [];
  const detectedPatterns = analysis?.detectedPatterns ?? [];
  const taskType = analysis?.taskType;

  return (
    <aside className="flex w-80 flex-col border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Diagnostics
        </h2>
        {taskType && taskType !== "other" && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Detected: <span className="font-medium capitalize">{taskType}</span>
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Empty state */}
        {!content.trim() && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-3xl opacity-40">📝</div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Start writing to see diagnostics
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              SpecPad analyzes your prompt as you type
            </p>
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            Analyzing draft...
          </div>
        )}

        {/* Detected Patterns */}
        {detectedPatterns.length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Detected Patterns
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {detectedPatterns.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900 dark:text-violet-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Diagnostics */}
        {diagnostics.length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Issues ({diagnostics.length})
            </h3>
            <div className="flex flex-col gap-2">
              {diagnostics.map((d) => (
                <DiagnosticCard
                  key={d.id}
                  diagnostic={d}
                  onInsert={(text) => {
                    const separator = content.trim() ? "\n" : "";
                    setContent(content + separator + text);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Suggestions ({suggestions.length})
            </h3>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  onAccept={() => handleAcceptSuggestion(s)}
                  onReject={() => rejectSuggestion(s)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All clear state */}
        {content.trim() && !isAnalyzing && diagnostics.length === 0 && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 text-2xl">✅</div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Looking good!
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              No issues detected in your draft
            </p>
          </div>
        )}
      </div>

      {/* Footer: cursor position */}
      <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <CursorPosition />
      </div>
    </aside>
  );
}

function CursorPosition() {
  const line = useEditorStore((s) => s.cursorLine);
  const col = useEditorStore((s) => s.cursorColumn);
  const wordCount = useEditorStore((s) => s.content.split(/\s+/).filter(Boolean).length);

  return (
    <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
      <span>
        Ln {line}, Col {col}
      </span>
      <span>{wordCount} words</span>
    </div>
  );
}
