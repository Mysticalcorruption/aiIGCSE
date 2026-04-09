import { NextRequest, NextResponse } from "next/server";
import { createRealtimeSession } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { sdp?: string; voice?: string };

    if (!body.sdp) {
      return NextResponse.json({ error: "Missing SDP offer." }, { status: 400 });
    }

    const answerSdp = await createRealtimeSession(body.sdp, body.voice || "marin");

    return new NextResponse(answerSdp, {
      status: 200,
      headers: {
        "Content-Type": "application/sdp"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
