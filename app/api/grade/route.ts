import { NextRequest, NextResponse } from "next/server";
import { heuristicGrade } from "@/lib/grader";
import { gradeWithOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { transcriptFr?: string };
    const transcriptFr = body.transcriptFr?.trim();

    if (!transcriptFr) {
      return NextResponse.json({ error: "Missing transcriptFr." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(heuristicGrade(transcriptFr));
    }

    try {
      const grade = await gradeWithOpenAI(transcriptFr);
      return NextResponse.json(grade);
    } catch {
      return NextResponse.json(heuristicGrade(transcriptFr));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
