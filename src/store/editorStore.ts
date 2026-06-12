import { create } from "zustand";
import type {
  DraftAnalysis,
  EditorMode,
  Suggestion,
} from "@/types";

interface EditorState {
  // ── Document ──────────────────────────────────────────────
  content: string;
  mode: EditorMode;
  setContent: (content: string) => void;
  setMode: (mode: EditorMode) => void;

  // ── Cursor ───────────────────────────────────────────────
  cursorLine: number;
  cursorColumn: number;
  setCursorPosition: (line: number, column: number) => void;

  // ── Analysis ─────────────────────────────────────────────
  analysis: DraftAnalysis | null;
  isAnalyzing: boolean;
  setAnalysis: (analysis: DraftAnalysis | null) => void;
  setIsAnalyzing: (v: boolean) => void;

  // ── Sidebar ──────────────────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // ── Accepted / Rejected Suggestions ──────────────────────
  acceptedSuggestions: Suggestion[];
  rejectedSuggestions: Suggestion[];
  acceptSuggestion: (s: Suggestion) => void;
  rejectSuggestion: (s: Suggestion) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // ── Document ──────────────────────────────────────────────
  content: "",
  mode: "prompt",
  setContent: (content) => set({ content }),
  setMode: (mode) => set({ mode }),

  // ── Cursor ───────────────────────────────────────────────
  cursorLine: 1,
  cursorColumn: 1,
  setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),

  // ── Analysis ─────────────────────────────────────────────
  analysis: null,
  isAnalyzing: false,
  setAnalysis: (analysis) => set({ analysis }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  // ── Sidebar ──────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ── Accepted / Rejected Suggestions ──────────────────────
  acceptedSuggestions: [],
  rejectedSuggestions: [],
  acceptSuggestion: (s) =>
    set((state) => ({ acceptedSuggestions: [...state.acceptedSuggestions, s] })),
  rejectSuggestion: (s) =>
    set((state) => ({ rejectedSuggestions: [...state.rejectedSuggestions, s] })),
}));
