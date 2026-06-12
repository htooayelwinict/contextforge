import { NextRequest, NextResponse } from "next/server";
import { llmAnalyzeDraft } from "@/lib/llmAnalyzer";
import type { EditorMode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, mode } = body as { text: string; mode: EditorMode };
    const debug = request.nextUrl.searchParams.get("debug") === "1" || request.nextUrl.searchParams.get("debug") === "true";

    if (typeof text !== "string") {
      return NextResponse.json(
        { error: "text must be a string" },
        { status: 400 },
      );
    }

    const validModes: EditorMode[] = [
      "prompt",
      "skill",
      "implementation-plan",
      "architecture",
      "review",
    ];

    const editorMode = validModes.includes(mode) ? mode : "prompt";
    const analysisResult = await llmAnalyzeDraft(text, editorMode);

    if (debug) {
      return NextResponse.json({
        ...analysisResult.analysis,
        _debug: {
          engine: analysisResult.engine,
          model: analysisResult.model,
          error: analysisResult.error,
        },
      });
    }

    return NextResponse.json(analysisResult.analysis);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
