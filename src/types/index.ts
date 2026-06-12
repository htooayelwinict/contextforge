// ─── Draft Analysis ────────────────────────────────────────────────

export type TaskType =
  | "bugfix"
  | "refactor"
  | "feature"
  | "architecture"
  | "skill"
  | "test-plan"
  | "debugging"
  | "other";

export type DiagnosticType = "gap" | "ambiguity" | "risk";
export type Severity = "info" | "warning" | "error";

export interface Diagnostic {
  id: string;
  type: DiagnosticType;
  message: string;
  severity: Severity;
  /** Optional suggestion to fix this diagnostic */
  suggestionText?: string;
}

export interface Suggestion {
  id: string;
  type: "insert_after_cursor" | "replace_selection" | "append" | "rewrite";
  label: string;
  preview: string;
  confidence: number;
  reason: string;
}

export interface DraftAnalysis {
  taskType: TaskType;
  detectedPatterns: string[];
  diagnostics: Diagnostic[];
  suggestions: Suggestion[];
  /** Raw summary text from the analyzer */
  summary?: string;
}

// ─── Pattern Registry ──────────────────────────────────────────────

export interface PatternEntry {
  pattern: string;
  signals: string[];
  suggestions: string[];
  insertableLines: string[];
}

// ─── Templates ─────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TaskType;
  content: string;
}

// ─── Editor Modes ──────────────────────────────────────────────────

export type EditorMode =
  | "prompt"
  | "skill"
  | "implementation-plan"
  | "architecture"
  | "review";

// ─── Documents ─────────────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  content: string;
  mode: EditorMode;
  createdAt: number;
  updatedAt: number;
}
