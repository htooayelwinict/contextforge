import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import type { DraftAnalysis } from "@/types";

/**
 * Debounced draft analyzer hook.
 *
 * Watches `content` and `mode` from the editor store.
 * After a debounce period (default 800ms), sends the draft
 * to the `/api/analyze-draft` endpoint and updates the analysis.
 */
export function useDraftAnalyzer(debounceMs = 800) {
  const content = useEditorStore((s) => s.content);
  const mode = useEditorStore((s) => s.mode);
  const setAnalysis = useEditorStore((s) => s.setAnalysis);
  const setIsAnalyzing = useEditorStore((s) => s.setIsAnalyzing);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Empty content → clear analysis
    if (!content.trim()) {
      setAnalysis(null);
      setIsAnalyzing(false);
      return;
    }

    // Set analyzing state immediately for UI feedback
    setIsAnalyzing(true);

    // Debounce the API call
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/analyze-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, mode }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }

        const analysis: DraftAnalysis = await response.json();
        setAnalysis(analysis);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was cancelled, ignore
          return;
        }
        // On error, clear analysis but don't crash
        console.error("Draft analysis error:", err);
        setAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, mode, debounceMs, setAnalysis, setIsAnalyzing]);
}
