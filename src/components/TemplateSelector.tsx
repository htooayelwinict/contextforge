"use client";

import { useState } from "react";
import { templates } from "@/lib/templates";
import { useEditorStore } from "@/store/editorStore";

export default function TemplateSelector() {
  const [open, setOpen] = useState(false);
  const setContent = useEditorStore((s) => s.setContent);
  const content = useEditorStore((s) => s.content);

  const handleSelect = (templateContent: string) => {
    // If editor has content, ask before replacing
    if (content.trim() && !window.confirm("Replace current content with this template?")) {
      setOpen(false);
      return;
    }
    setContent(templateContent);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Templates
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Choose a template
            </p>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.content)}
                className="flex w-full flex-col rounded-md px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
