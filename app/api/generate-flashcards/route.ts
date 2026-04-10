import { NextResponse } from "next/server";

type ContextRow = { name: string; notes: string; difficulty: number };

export async function POST(req: Request) {
  try {
    const { prompt, cardCount, context } = await req.json() as { prompt: string; cardCount: number; context: ContextRow[] };
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY in environment variables." }, { status: 500 });
    }

    const safeCount = Math.min(20, Math.max(1, Number(cardCount) || 5));
    const slicedContext = (Array.isArray(context) ? context : []).slice(0, 50);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: "Create concise GCSE/IGCSE revision flashcards. Return strict JSON only: {\"cards\":[{\"front\":string,\"back\":string}]}. No markdown."
          },
          {
            role: "user",
            content: `Prompt: ${prompt}\nCard count: ${safeCount}\nContext:\n${JSON.stringify(slicedContext)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const raw = await response.text();
      return NextResponse.json({ error: `OpenAI request failed: ${raw}` }, { status: 500 });
    }

    const data = await response.json() as { output_text?: string };
    const text = data.output_text || "{\"cards\":[]}";

    let parsed: { cards: Array<{ front: string; back: string }> } = { cards: [] };
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { cards: [] };
    }

    const cleanCards = (parsed.cards || [])
      .filter((card) => card?.front && card?.back)
      .slice(0, safeCount);

    return NextResponse.json({ cards: cleanCards });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
