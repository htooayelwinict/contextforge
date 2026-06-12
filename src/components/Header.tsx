"use client";

import { useEditorStore } from "@/store/editorStore";
import type { EditorMode } from "@/types";
import TemplateSelector from "./TemplateSelector";
import ExportButton from "./ExportButton";

const modes: { value: EditorMode; label: string }[] = [
  { value: "prompt", label: "Prompt" },
  { value: "skill", label: "Skill" },
  { value: "implementation-plan", label: "Plan" },
  { value: "architecture", label: "Architecture" },
  { value: "review", label: "Review" },
];

export default function Header() {
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const isAnalyzing = useEditorStore((s) => s.isAnalyzing);

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          S
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          SpecPad
        </h1>
        {isAnalyzing && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
            Analyzing
          </span>
        )}
      </div>

      {/* Center: Mode selector */}
      <nav className="flex items-center gap-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m.value
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <TemplateSelector />
        <ExportButton />
        <button
          onClick={toggleSidebar}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sidebarOpen
              ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? "◧ Hide Panel" : "◧ Show Panel"}
        </button>
      </div>
    </header>
  );
}
