import type {
  Diagnostic,
  DraftAnalysis,
  Suggestion,
  TaskType,
  EditorMode,
} from "@/types";
import { patternRegistry } from "./patternRegistry";

// ─── Helpers ───────────────────────────────────────────────────────

let idCounter = 0;
function uid(): string {
  return `d-${Date.now()}-${++idCounter}`;
}

const TASK_KEYWORDS: Record<TaskType, string[]> = {
  bugfix: [
    "fix",
    "bug",
    "error",
    "crash",
    "broken",
    "regression",
    "issue",
    "defect",
    "patch",
    "not working",
    "failing",
    "exception",
    "stack trace",
  ],
  refactor: [
    "refactor",
    "clean up",
    "cleanup",
    "restructure",
    "reorganize",
    "simplify",
    "improve code",
    "make clean",
    "technical debt",
    "code smell",
    "decouple",
  ],
  feature: [
    "add",
    "implement",
    "create",
    "new feature",
    "build",
    "introduce",
    "support",
    "enable",
    "extend",
    "new functionality",
  ],
  architecture: [
    "architecture",
    "design",
    "pattern",
    "structure",
    "modular",
    "scalable",
    "microservice",
    "monolith",
    "layered",
    "component",
  ],
  skill: [
    "skill",
    "system prompt",
    "instruction",
    "agent",
    "persona",
    "role",
    "you are",
    "act as",
    "behave as",
  ],
  "test-plan": [
    "test",
    "testing",
    "test plan",
    "coverage",
    "qa",
    "quality",
    "validate",
    "verify",
    "assertion",
  ],
  debugging: [
    "debug",
    "diagnose",
    "investigate",
    "trace",
    "root cause",
    "why is",
    "what causes",
    "reproduce",
  ],
  other: [],
};

// ─── Vague / Ambiguous Phrases ─────────────────────────────────────

const VAGUE_PHRASES: { phrase: string; suggestion: string }[] = [
  { phrase: "make it better", suggestion: "Specify what 'better' means: faster, cleaner, more readable?" },
  { phrase: "make it clean", suggestion: "Define 'clean': follow SOLID, reduce coupling, remove duplication?" },
  { phrase: "fix it properly", suggestion: "Specify expected behavior and acceptance criteria." },
  { phrase: "make it work", suggestion: "Describe the expected working behavior." },
  { phrase: "clean up", suggestion: "Specify what to clean: naming, structure, dependencies, dead code?" },
  { phrase: "optimize", suggestion: "Specify what to optimize: speed, memory, readability, bundle size?" },
  { phrase: "improve", suggestion: "Define the improvement target and success criteria." },
  { phrase: "as soon as possible", suggestion: "Specify a concrete deadline or priority level." },
  { phrase: "etc", suggestion: "List the remaining items explicitly instead of using 'etc'." },
  { phrase: "and so on", suggestion: "Enumerate the remaining items instead of 'and so on'." },
  { phrase: "properly", suggestion: "Define what 'properly' means in this context." },
  { phrase: "correctly", suggestion: "Specify the expected correct behavior." },
  { phrase: "nice", suggestion: "Replace 'nice' with a concrete quality attribute." },
  { phrase: "good", suggestion: "Replace 'good' with measurable criteria." },
  { phrase: "bad", suggestion: "Describe what specifically is wrong." },
  { phrase: "some", suggestion: "Be specific about which items or how many." },
  { phrase: "things", suggestion: "Name the specific things you're referring to." },
  { phrase: "stuff", suggestion: "Name the specific items you're referring to." },
];

// ─── Required Elements per Mode ────────────────────────────────────

interface RequiredElement {
  synonyms: string[];
  label: string;
  description: string;
}

const MODE_REQUIREMENTS: Record<EditorMode, RequiredElement[]> = {
  prompt: [
    {
      synonyms: ["expected", "should output", "should return", "result should", "expected result", "expected output", "the output should", "it should produce"],
      label: "Expected behavior",
      description: "Describe what the output should look like or do.",
    },
    {
      synonyms: ["constraint", "do not", "don't", "must not", "should not", "avoid", "boundary", "limit", "scope", "denied"],
      label: "Constraints",
      description: "Add boundaries: what should NOT change.",
    },
    {
      synonyms: ["test", "verify", "validate", "check that", "confirm", "assert", "ensure that", "acceptance"],
      label: "Test requirement",
      description: "Specify how to verify the result.",
    },
  ],
  skill: [
    {
      synonyms: ["role", "you are", "act as", "behave as", "persona", "identity", "your role"],
      label: "Role definition",
      description: "Define who the AI should be.",
    },
    {
      synonyms: ["context", "situation", "domain", "background", "scenario", "environment"],
      label: "Context",
      description: "Describe the situation or domain.",
    },
    {
      synonyms: ["output", "format", "response", "return", "structure", "schema", "template"],
      label: "Output format",
      description: "Specify the expected output structure.",
    },
  ],
  "implementation-plan": [
    {
      synonyms: ["phase", "step", "stage", "milestone", "sprint", "iteration"],
      label: "Phases",
      description: "Break the work into ordered phases.",
    },
    {
      synonyms: ["acceptance", "done when", "complete when", "definition of done", "criteria", "success"],
      label: "Acceptance criteria",
      description: "Define when each phase is done.",
    },
    {
      synonyms: ["risk", "could go wrong", "mitigation", "fallback", "danger", "pitfall", "edge case"],
      label: "Risk assessment",
      description: "Identify what could go wrong.",
    },
  ],
  architecture: [
    {
      synonyms: ["component", "module", "layer", "service", "subsystem", "building block"],
      label: "Components",
      description: "Name the key components or layers.",
    },
    {
      synonyms: ["interface", "api", "contract", "protocol", "communication", "interaction", "endpoint"],
      label: "Interfaces",
      description: "Define how components communicate.",
    },
    {
      synonyms: ["constraint", "requirement", "non-functional", "performance", "scalability", "security", "latency"],
      label: "Constraints",
      description: "Specify non-functional requirements.",
    },
  ],
  review: [
    {
      synonyms: ["criteria", "check for", "look for", "review for", "evaluate", "assess"],
      label: "Review criteria",
      description: "What aspects to review.",
    },
    {
      synonyms: ["scope", "in scope", "out of scope", "focus on", "exclude", "include"],
      label: "Scope",
      description: "What is in/out of review scope.",
    },
    {
      synonyms: ["severity", "critical", "high", "medium", "low", "priority", "classify"],
      label: "Severity levels",
      description: "How to classify findings.",
    },
  ],
};

// ─── Analysis Functions ────────────────────────────────────────────

function detectTaskType(text: string, mode: EditorMode): TaskType {
  // Mode gives a strong hint
  if (mode === "architecture") return "architecture";
  if (mode === "skill") return "skill";
  if (mode === "implementation-plan") return "feature";
  if (mode === "review") return "refactor";

  const lower = text.toLowerCase();
  const scores: Record<TaskType, number> = {
    bugfix: 0,
    refactor: 0,
    feature: 0,
    architecture: 0,
    skill: 0,
    "test-plan": 0,
    debugging: 0,
    other: 0,
  };

  for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[taskType as TaskType]++;
      }
    }
  }

  const best = (Object.entries(scores) as [TaskType, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])[0];

  return best ? best[0] : "other";
}

function detectPatterns(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const entry of patternRegistry) {
    const hitCount = entry.signals.filter((signal) => lower.includes(signal)).length;
    if (hitCount >= 2) {
      matched.push(entry.pattern);
    }
  }

  return matched;
}

function detectAmbiguities(text: string): Diagnostic[] {
  const lower = text.toLowerCase();
  const diagnostics: Diagnostic[] = [];

  for (const { phrase, suggestion } of VAGUE_PHRASES) {
    if (lower.includes(phrase)) {
      diagnostics.push({
        id: uid(),
        type: "ambiguity",
        message: `"${phrase}" is vague. ${suggestion}`,
        severity: "warning",
        suggestionText: suggestion,
      });
    }
  }

  return diagnostics;
}

function detectGaps(text: string, mode: EditorMode): Diagnostic[] {
  const lower = text.toLowerCase();
  const diagnostics: Diagnostic[] = [];
  const requirements = MODE_REQUIREMENTS[mode] ?? MODE_REQUIREMENTS.prompt;

  for (const req of requirements) {
    const found = req.synonyms.some((syn) => lower.includes(syn));
    if (!found) {
      diagnostics.push({
        id: uid(),
        type: "gap",
        message: `Missing: ${req.label}. ${req.description}`,
        severity: "info",
        suggestionText: `Add ${req.label.toLowerCase()}`,
      });
    }
  }

  return diagnostics;
}

function detectRisks(text: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lower = text.toLowerCase();

  // Broad scope warnings
  const broadPhrases = [
    "all files",
    "everything",
    "the whole",
    "entire codebase",
    "all the",
    "every file",
    "completely rewrite",
    "from scratch",
  ];

  for (const phrase of broadPhrases) {
    if (lower.includes(phrase)) {
      diagnostics.push({
        id: uid(),
        type: "risk",
        message: `Scope risk: "${phrase}" is very broad. Consider narrowing the scope to specific files or modules.`,
        severity: "warning",
        suggestionText: "Add denied-scope wording",
      });
      break; // Only one scope risk needed
    }
  }

  // No stop condition
  if (text.length > 50 && !lower.includes("stop") && !lower.includes("limit") && !lower.includes("do not") && !lower.includes("don't") && !lower.includes("avoid")) {
    diagnostics.push({
      id: uid(),
      type: "risk",
      message: "No stop condition or denied scope. The AI may make unwanted changes.",
      severity: "info",
      suggestionText: "Add 'do not change...' constraints",
    });
  }

  return diagnostics;
}

function generateSuggestions(
  diagnostics: Diagnostic[],
  detectedPatterns: string[],
  text: string,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Generate suggestions from diagnostics that have suggestion text
  for (const d of diagnostics) {
    if (d.suggestionText && d.type === "gap") {
      suggestions.push({
        id: uid(),
        type: "append",
        label: d.suggestionText,
        preview: `${d.suggestionText}: [describe here]`,
        confidence: 0.8,
        reason: d.message,
      });
    }
  }

  // Generate suggestions from detected patterns
  for (const patternName of detectedPatterns) {
    const entry = patternRegistry.find((p) => p.pattern === patternName);
    if (entry && entry.insertableLines.length > 0) {
      suggestions.push({
        id: uid(),
        type: "append",
        label: `Consider ${patternName}`,
        preview: entry.insertableLines[0],
        confidence: 0.75,
        reason: `Your draft mentions concepts related to ${patternName}.`,
      });
    }
  }

  // Short draft suggestion
  if (text.trim().length > 0 && text.trim().length < 30) {
    suggestions.push({
      id: uid(),
      type: "append",
      label: "Expand your prompt",
      preview: "Context: [describe the current situation]\nTask: [describe what to do]\nConstraints: [describe boundaries]\nOutput: [describe expected result]",
      confidence: 0.7,
      reason: "Your draft is very short. Adding structure will improve results.",
    });
  }

  return suggestions;
}

// ─── Main Analyzer ─────────────────────────────────────────────────

export function analyzeDraft(text: string, mode: EditorMode): DraftAnalysis {
  if (!text.trim()) {
    return {
      taskType: "other",
      detectedPatterns: [],
      diagnostics: [],
      suggestions: [],
    };
  }

  const taskType = detectTaskType(text, mode);
  const detectedPatterns = detectPatterns(text);
  const ambiguities = detectAmbiguities(text);
  const gaps = detectGaps(text, mode);
  const risks = detectRisks(text);

  const diagnostics = [...risks, ...ambiguities, ...gaps];
  const suggestions = generateSuggestions(diagnostics, detectedPatterns, text);

  return {
    taskType,
    detectedPatterns,
    diagnostics,
    suggestions,
    summary: `Detected ${taskType} task with ${diagnostics.length} diagnostics and ${detectedPatterns.length} patterns.`,
  };
}
