"use client";

import { useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useEditorStore } from "@/store/editorStore";

export default function EditorPanel() {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition(e.position.lineNumber, e.position.column);
      });

      // Focus editor on mount
      editor.focus();
    },
    [setCursorPosition],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      setContent(value ?? "");
    },
    [setContent],
  );

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={content}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 15,
          lineHeight: 24,
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          renderLineHighlight: "line",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: false,
          quickSuggestions: false,
          parameterHints: { enabled: false },
        }}
      />
    </div>
  );
}
