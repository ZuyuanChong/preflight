import { NextResponse } from "next/server";
import { createRunFromBrief } from "@/lib/sprint";
import { generateOpenAIPreflight, normalizeBrief, OpenAIPreflightTimeoutError } from "@/lib/openai-preflight";
import type { VentureBrief } from "@/types/preflight";

export const runtime = "nodejs";

export function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const runtimeMode = process.env.PREFLIGHT_MODE?.toLowerCase();
  const forcedDemo = runtimeMode === "demo-only" || runtimeMode === "static";

  return NextResponse.json({
    ok: true,
    mode: forcedDemo || !apiKey ? "demo" : "live"
  });
}

export async function POST(request: Request) {
  let body: { brief?: Partial<VentureBrief> };

  try {
    body = (await request.json()) as { brief?: Partial<VentureBrief> };
  } catch {
    return NextResponse.json(
      {
        mode: "demo",
        run: createRunFromBrief(normalizeBrief({})),
        warning: "Request body was not valid JSON, so Preflight returned demo fallback output."
      },
      { status: 400 }
    );
  }

  const brief = normalizeBrief(body.brief ?? {});

  if (!brief.idea.trim()) {
    return NextResponse.json(
      {
        mode: "demo",
        run: createRunFromBrief(brief),
        warning: "Startup idea is required before Preflight can generate a run."
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const runtimeMode = process.env.PREFLIGHT_MODE?.toLowerCase();
  const forcedDemo = runtimeMode === "demo-only" || runtimeMode === "static";

  if (forcedDemo) {
    return NextResponse.json({
      mode: "demo",
      run: createRunFromBrief(brief),
      warning: "PREFLIGHT_MODE is set to demo-only, so OpenAI generation was skipped."
    });
  }

  if (!apiKey) {
    return NextResponse.json({
      mode: "demo",
      run: createRunFromBrief(brief),
      warning: "OPENAI_API_KEY was not available to the server, so Preflight used demo fallback output."
    });
  }

  try {
    const run = await generateOpenAIPreflight(brief, apiKey);
    return NextResponse.json({ mode: "live", run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI generation error.";
    const isTimeout = error instanceof OpenAIPreflightTimeoutError;

    return NextResponse.json(
      {
        mode: "error",
        retryable: true,
        warning: isTimeout
          ? `${message} Retry Start Preflight, or use Load completed demo if you need the fallback.`
          : `OpenAI generation failed. ${message} Retry Start Preflight, or use Load completed demo if you need the fallback.`
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
