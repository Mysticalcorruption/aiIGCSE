import { RUBRIC_SYSTEM_PROMPT } from "@/lib/rubric";
import { GradeResult } from "@/lib/types";

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function createRealtimeSession(offerSdp: string, voice: string) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const formData = new FormData();
  formData.set("sdp", offerSdp);
  formData.set(
    "session",
    JSON.stringify({
      type: "realtime",
      model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime",
      instructions:
        "You are a friendly IGCSE French oral examiner. Speak mostly in French. Ask one clear question at a time. Wait patiently for the learner to finish. Avoid interrupting short pauses. Give short follow-ups.",
      audio: {
        output: { voice }
      }
    })
  );

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Realtime session failed: ${await response.text()}`);
  }

  return response.text();
}

export async function gradeWithOpenAI(transcriptFr: string): Promise<GradeResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: RUBRIC_SYSTEM_PROMPT }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: `Transcript:\n${transcriptFr}` }]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "igcse_french_grade",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["total", "breakdown", "strengths", "targets", "evidence"],
            properties: {
              total: { type: "number" },
              breakdown: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["criterion", "score", "max"],
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    max: { type: "number" }
                  }
                }
              },
              strengths: {
                type: "array",
                minItems: 1,
                maxItems: 3,
                items: { type: "string" }
              },
              targets: {
                type: "array",
                minItems: 1,
                maxItems: 3,
                items: { type: "string" }
              },
              evidence: {
                type: "array",
                minItems: 0,
                maxItems: 3,
                items: { type: "string" }
              }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Responses API failed: ${await response.text()}`);
  }

  const data = await response.json();
  const outputText: string | undefined = data.output_text;
  if (!outputText) {
    throw new Error("No output_text returned from Responses API");
  }

  return JSON.parse(outputText) as GradeResult;
}
