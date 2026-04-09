# IGCSE French Oral Coach

A Vercel-ready Next.js app for IGCSE French oral preparation with:

- ChatGPT-style UI
- typed answers and realtime voice mode
- OpenAI Realtime WebRTC connection
- anti-cutoff turn-taking controls
- seeded question bank
- rubric-based grading endpoint

## What this code does

### Voice

The voice flow is:

1. Browser captures microphone audio with `getUserMedia()`.
2. Browser creates a WebRTC offer.
3. Browser sends the SDP offer to `/api/realtime/session`.
4. Your server route uses your normal OpenAI API key to create a Realtime session and returns the SDP answer.
5. Browser connects directly over WebRTC and uses a data channel for turn settings and transcript events.

This avoids exposing your standard API key in the browser.

### Anti-cutoff setup

The app includes three turn modes:

- `manual`: safest for long school answers; the model does not auto-answer until you press the button.
- `server_vad`: silence-based auto response with configurable `silence_duration_ms`.
- `semantic_vad`: lower eagerness style that tends to interrupt less than aggressive silence detection.

If the AI is cutting you off, use:

- `Manual`, or
- `Auto wait` with a longer silence value like `1600-2400ms`.

## Environment variables

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Set:

```env
OPENAI_API_KEY=sk-...
OPENAI_REALTIME_MODEL=gpt-realtime
OPENAI_TEXT_MODEL=gpt-4.1-mini
NEXT_PUBLIC_APP_NAME=IGCSE French Oral Coach
```

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Deploy to Vercel

1. Push this code to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. Open the site in Chrome or Edge and allow microphone access.

## Suggested public GitHub structure

```text
app/
  api/
    grade/route.ts
    realtime/session/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  VoiceCoachApp.tsx
lib/
  grader.ts
  openai.ts
  questions.ts
  rubric.ts
  types.ts
.env.example
README.md
```

## Notes

- The grader route falls back to a local heuristic if the OpenAI text-model call fails.
- The voice mode is browser-based, so a real microphone permission prompt is required.
- For school deployment, add auth, persistence, and teacher dashboards before public launch.
