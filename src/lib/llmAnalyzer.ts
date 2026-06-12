import OpenAI from "openai";
import type { DraftAnalysis, EditorMode } from "@/types";
import { analyzeDraft as ruleBasedAnalyze } from "./analyzer";

const client = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-3.1-flash-lite";

const SYSTEM_PROMPT = `You are SpecPad, a prompt engineering assistant that analyzes draft prompts and provides structured diagnostics.

Given a draft prompt and its editor mode, you must return a JSON object with the following structure:

{
  "taskType": "bugfix" | "refactor" | "feature" | "architecture" | "skill" | "test-plan" | "debugging" | "other",
  "detectedPatterns": string[],
  "diagnostics": [
    {
      "type": "gap" | "ambiguity" | "risk",
      "message": "A specific, context-aware message about what is missing, vague, or risky in THIS draft.",
      "severity": "info" | "warning" | "error",
      "suggestionText": "A short actionable label for a button to fix this (e.g. 'Add acceptance criteria')"
    }
  ],
  "suggestions": [
    {
      "type": "append" | "insert_after_cursor" | "replace_selection" | "rewrite",
      "label": "Short label for the suggestion",
      "preview": "The actual text to insert (1-3 lines max)",
      "confidence": 0.0-1.0,
      "reason": "Why this suggestion helps"
    }
  ],
  "summary": "One sentence summary of the analysis"
}

RULES:
1. Be SPECIFIC to the actual content. Never give generic advice like "add expected behavior" unless the draft genuinely lacks it.
2. Reference actual words/phrases from the draft in your diagnostics.
3. Diagnostics should help the user write a MORE EFFECTIVE prompt for an AI coding assistant.
4. Keep diagnostics to the most important 5 items max. Quality over quantity.
5. Suggestions should be concrete text the user can insert, not vague placeholders.
6. detectedPatterns should be software engineering design patterns relevant to the draft content (e.g. "Strategy Pattern", "Observer Pattern", "Repository Pattern").
7. If the draft is already well-structured, return empty diagnostics and say so in the summary.
8. severity: "error" for critical issues, "warning" for important gaps, "info" for nice-to-haves.

Editor modes and what they expect:
- prompt: General AI coding prompt. Should have clear task, context, constraints, and expected output.
- skill: AI agent skill/system prompt. Should define role, capabilities, constraints, and output format.
- implementation-plan: Step-by-step plan. Should have phases, acceptance criteria, and risk assessment.
- architecture: System design document. Should define components, interfaces, data flow, and constraints.
- review: Code review criteria. Should define scope, review criteria, and severity levels.

Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

export type AnalysisEngine =
  | "llm"
  | "rule-no-key"
  | "rule-placeholder-key"
  | "rule-fallback-error"
  | "rule-cancelled";

export interface AnalyzeDraftResult {
  analysis: DraftAnalysis;
  engine: AnalysisEngine;
  model?: string;
  error?: string;
}

function isAbortError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const value = err as { name?: unknown; message?: unknown };
    return value.name === "AbortError" || value.message === "Request was aborted.";
  }
  return false;
}

export async function llmAnalyzeDraft(
  text: string,
  mode: EditorMode,
  signal?: AbortSignal,
): Promise<AnalyzeDraftResult> {
  const key = (process.env.OPENROUTER_API_KEY || "").trim();
  const isPlaceholderKey = key === "sk-or-v1-YOUR_KEY_HERE";

  if (!key) {
    return {
      analysis: ruleBasedAnalyze(text, mode),
      engine: "rule-no-key",
    };
  }

  if (isPlaceholderKey) {
    return {
      analysis: ruleBasedAnalyze(text, mode),
      engine: "rule-placeholder-key",
    };
  }

  try {
    const response = await client.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Editor mode: ${mode}\n\nDraft:\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      },
      { signal },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty LLM response");
    }

    const parsed = JSON.parse(content) as DraftAnalysis;

    let idCounter = 0;
    const uid = () => `llm-${Date.now()}-${++idCounter}`;

    return {
      analysis: {
        taskType: parsed.taskType || "other",
        detectedPatterns: parsed.detectedPatterns || [],
        diagnostics: (parsed.diagnostics || []).map((d) => ({
          id: uid(),
          type: d.type,
          message: d.message,
          severity: d.severity,
          suggestionText: d.suggestionText,
        })),
        suggestions: (parsed.suggestions || []).map((s) => ({
          id: uid(),
          type: s.type,
          label: s.label,
          preview: s.preview,
          confidence: s.confidence,
          reason: s.reason,
        })),
        summary: parsed.summary || "Analysis complete.",
      },
      engine: "llm",
      model: MODEL,
    };
  } catch (err) {
    if (isAbortError(err)) {
      return {
        analysis: ruleBasedAnalyze(text, mode),
        engine: "rule-cancelled",
        error: err instanceof Error ? err.message : "Request cancelled",
      };
    }
    console.error("LLM analysis failed, falling back to rule-based:", err);
    return {
      analysis: ruleBasedAnalyze(text, mode),
      engine: "rule-fallback-error",
      error:
        err instanceof Error && typeof err.message === "string"
          ? err.message
          : "Unknown LLM error",
    };
  }
}
