"use client";

import { useEditorStore } from "@/store/editorStore";

export default function ExportButton() {
  const content = useEditorStore((s) => s.content);
  const mode = useEditorStore((s) => s.mode);

  const handleExport = () => {
    if (!content.trim()) {
      return;
    }

    const filename = `specpad-${mode}-${Date.now()}.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!content.trim()}
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      Export .md
    </button>
  );
}
