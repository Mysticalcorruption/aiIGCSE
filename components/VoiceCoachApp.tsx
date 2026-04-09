"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getRandomQuestion, getQuestions } from "@/lib/questions";
import { ChatMessage, GradeResult, TenseBucket, TopicKey, TurnMode } from "@/lib/types";

const TOPIC_OPTIONS: Array<{ value: TopicKey; label: string }> = [
  { value: "home-abroad", label: "Home and abroad" },
  { value: "education-employment", label: "Education and employment" },
  { value: "personal-life", label: "Personal life and relationships" },
  { value: "world-around-us", label: "The world around us" },
  { value: "social-fitness-health", label: "Social activities, fitness and health" }
];

const TENSE_OPTIONS: Array<{ value: TenseBucket; label: string }> = [
  { value: "present", label: "Present" },
  { value: "past", label: "Past" },
  { value: "future", label: "Future" },
  { value: "conditional", label: "Conditional" }
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function VoiceCoachApp() {
  const [topic, setTopic] = useState<TopicKey>("education-employment");
  const [tense, setTense] = useState<TenseBucket>("present");
  const [mode, setMode] = useState<"text" | "voice">("voice");
  const [turnMode, setTurnMode] = useState<TurnMode>("semantic_vad");
  const [silenceDurationMs, setSilenceDurationMs] = useState(1600);
  const [voiceName, setVoiceName] = useState("marin");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Offline");
  const [isConnecting, setIsConnecting] = useState(false);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestionCount = useMemo(() => getQuestions(topic, tense).length, [topic, tense]);

  useEffect(() => {
    if (messages.length === 0) {
      const starter = getRandomQuestion(topic, tense);
      setMessages([
        {
          id: createId(),
          role: "assistant",
          text: `Bonjour. On commence. ${starter.promptFr}`,
          createdAt: Date.now()
        }
      ]);
    }
  }, [messages.length, tense, topic]);

  useEffect(() => {
    return () => {
      disconnectRealtime();
    };
  }, []);

  function addMessage(role: ChatMessage["role"], text: string, source?: ChatMessage["source"]) {
    setMessages((prev) => [...prev, { id: createId(), role, text, source, createdAt: Date.now() }]);
  }

  function sendRealtimeEvent(event: Record<string, unknown>) {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") return;
    dc.send(JSON.stringify(event));
  }

  function syncTurnSettings(nextTurnMode: TurnMode = turnMode, nextSilenceMs: number = silenceDurationMs) {
    if (nextTurnMode === "manual") {
      sendRealtimeEvent({
        type: "session.update",
        session: {
          turn_detection: {
            type: "server_vad",
            silence_duration_ms: nextSilenceMs,
            threshold: 0.5,
            prefix_padding_ms: 400,
            create_response: false,
            interrupt_response: true
          }
        }
      });
      return;
    }

    if (nextTurnMode === "server_vad") {
      sendRealtimeEvent({
        type: "session.update",
        session: {
          turn_detection: {
            type: "server_vad",
            silence_duration_ms: nextSilenceMs,
            threshold: 0.5,
            prefix_padding_ms: 400,
            create_response: true,
            interrupt_response: true
          }
        }
      });
      return;
    }

    sendRealtimeEvent({
      type: "session.update",
      session: {
        turn_detection: {
          type: "semantic_vad",
          eagerness: "low",
          create_response: true,
          interrupt_response: true
        }
      }
    });
  }

  async function connectRealtime() {
    if (pcRef.current) return;
    setIsConnecting(true);
    setConnectionStatus("Connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audio = new Audio();
      audio.autoplay = true;
      remoteAudioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
      };

      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }

      const dataChannel = pc.createDataChannel("oai-events");
      dcRef.current = dataChannel;

      dataChannel.addEventListener("open", () => {
        setConnectionStatus("Live");
        syncTurnSettings(turnMode, silenceDurationMs);
      });

      dataChannel.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === "response.audio_transcript.delta" && payload.delta) {
            setLiveTranscript((prev) => prev + payload.delta);
          }

          if (payload.type === "response.audio_transcript.done" && payload.transcript) {
            setLiveTranscript("");
            addMessage("assistant", payload.transcript);
          }

          if (payload.type === "conversation.item.input_audio_transcription.completed" && payload.transcript) {
            addMessage("user", payload.transcript, "voice");
          }

          if (payload.type === "error") {
            addMessage("system", `Realtime error: ${payload.error?.message ?? "Unknown error"}`);
          }
        } catch {
          // ignore malformed data-channel messages
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch("/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: offer.sdp,
          voice: voiceName
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setConnectionStatus("Live");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addMessage("system", `Failed to connect voice mode: ${message}`);
      setConnectionStatus("Offline");
      disconnectRealtime();
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectRealtime() {
    dcRef.current?.close();
    dcRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }

    setConnectionStatus("Offline");
    setLiveTranscript("");
  }

  function askNewQuestion() {
    const question = getRandomQuestion(topic, tense);
    addMessage("assistant", question.promptFr);

    if (mode === "voice" && dcRef.current?.readyState === "open") {
      sendRealtimeEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: `Ask the learner exactly this question in French: ${question.promptFr}` }]
        }
      });
      sendRealtimeEvent({ type: "response.create" });
    }
  }

  async function submitTypedAnswer() {
    const trimmed = draft.trim();
    if (!trimmed) return;

    addMessage("user", trimmed, "typed");
    setDraft("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptFr: trimmed })
      });

      const data = await response.json();
      setGrade(data);

      const followUp = "Merci. Développe encore un peu avec une raison et un exemple précis.";
      addMessage("assistant", followUp);

      if (mode === "voice" && dcRef.current?.readyState === "open") {
        sendRealtimeEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: `Respond as the examiner in French with this follow-up only: ${followUp}` }]
          }
        });
        sendRealtimeEvent({ type: "response.create" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function gradeLatestUserAnswer() {
    const latestUser = [...messages].reverse().find((message) => message.role === "user");
    if (!latestUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptFr: latestUser.text })
      });
      const data = await response.json();
      setGrade(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestManualResponse() {
    sendRealtimeEvent({ type: "response.create" });
  }

  const statusLive = connectionStatus === "Live";

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div>
            <h1>IGCSE French Oral Coach</h1>
            <p>
              Full website starter with ChatGPT-style practice, typed and spoken responses, rubric-based feedback,
              and OpenAI Realtime WebRTC voice mode configured to avoid the annoying fast cut-off by exposing manual,
              server-VAD, and semantic-VAD turn controls.
            </p>
            <div className="badgeLine" style={{ marginTop: 12 }}>
              <span className="badge">Text + voice</span>
              <span className="badge">Question bank seeded</span>
              <span className="badge">Rubric-based grading</span>
              <span className="badge">Vercel-ready</span>
            </div>
          </div>
          <div className="status">
            <span className={`dot ${statusLive ? "live" : ""}`} />
            {connectionStatus}
          </div>
        </header>

        <div className="layout">
          <aside className="card">
            <section className="sidebarSection">
              <h2>Practice setup</h2>
              <label className="label">
                Topic
                <select className="select" value={topic} onChange={(e) => setTopic(e.target.value as TopicKey)}>
                  {TOPIC_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="label">
                Tense focus
                <select className="select" value={tense} onChange={(e) => setTense(e.target.value as TenseBucket)}>
                  {TENSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <div className="small">Prompts available in this bucket: {currentQuestionCount}</div>
            </section>

            <section className="sidebarSection">
              <h2>Mode</h2>
              <div className="row">
                <button className={`pill ${mode === "text" ? "active" : ""}`} onClick={() => setMode("text")}>Text</button>
                <button className={`pill ${mode === "voice" ? "active" : ""}`} onClick={() => setMode("voice")}>Voice</button>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                {!statusLive ? (
                  <button className="button" onClick={connectRealtime} disabled={isConnecting || mode !== "voice"}>
                    {isConnecting ? "Connecting..." : "Connect voice"}
                  </button>
                ) : (
                  <button className="ghostButton" onClick={disconnectRealtime}>Disconnect voice</button>
                )}
              </div>
              <div className="small" style={{ marginTop: 10 }}>
                Voice uses browser WebRTC with your own server route on Vercel, so the browser talks to the Realtime API without you exposing your standard API key.
              </div>
            </section>

            <section className="sidebarSection settingsGrid">
              <h2>Turn-taking controls</h2>
              <div className="row">
                <button className={`pill ${turnMode === "manual" ? "active" : ""}`} onClick={() => { setTurnMode("manual"); syncTurnSettings("manual", silenceDurationMs); }}>Manual</button>
                <button className={`pill ${turnMode === "server_vad" ? "active" : ""}`} onClick={() => { setTurnMode("server_vad"); syncTurnSettings("server_vad", silenceDurationMs); }}>Auto wait</button>
                <button className={`pill ${turnMode === "semantic_vad" ? "active" : ""}`} onClick={() => { setTurnMode("semantic_vad"); syncTurnSettings("semantic_vad", silenceDurationMs); }}>Semantic</button>
              </div>
              <div className="sliderWrap">
                <label className="small">Silence wait before AI answers: {silenceDurationMs}ms</label>
                <input
                  className="range"
                  type="range"
                  min={800}
                  max={3000}
                  step={100}
                  value={silenceDurationMs}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSilenceDurationMs(next);
                    if (turnMode !== "semantic_vad") {
                      syncTurnSettings(turnMode, next);
                    }
                  }}
                />
              </div>
              <label className="label">
                Voice
                <select className="select" value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
                  <option value="marin">marin</option>
                  <option value="cedar">cedar</option>
                  <option value="alloy">alloy</option>
                </select>
              </label>
              <div className="small">
                Use <strong>Manual</strong> when you want zero interruptions. Use <strong>Auto wait</strong> with a longer silence window if the assistant usually cuts you off too early.
              </div>
            </section>

            <section className="sidebarSection">
              <h2>Quick actions</h2>
              <div className="row">
                <button className="ghostButton" onClick={askNewQuestion}>New question</button>
                <button className="ghostButton" onClick={gradeLatestUserAnswer}>Grade last answer</button>
                {turnMode === "manual" && statusLive ? (
                  <button className="ghostButton" onClick={requestManualResponse}>Make AI answer now</button>
                ) : null}
              </div>
            </section>
          </aside>

          <main className="card chatPanel">
            <div className="toolbar">
              <span className="pill active">Mode: {mode}</span>
              <span className="pill">Turn mode: {turnMode}</span>
              <span className="pill">Topic: {TOPIC_OPTIONS.find((item) => item.value === topic)?.label}</span>
              <span className="pill">Tense: {tense}</span>
            </div>

            <div className="messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role === "user" ? "user" : "assistant"}`}>
                  <div className="metaLine">
                    {message.role === "assistant" ? "Examiner AI" : message.role === "system" ? "System" : `You${message.source ? ` • ${message.source}` : ""}`}
                  </div>
                  {message.text}
                </div>
              ))}
              {liveTranscript ? (
                <div className="message assistant">
                  <div className="metaLine">AI transcript streaming</div>
                  {liveTranscript}
                </div>
              ) : null}
            </div>

            <div className="composer">
              <textarea
                className="textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Réponds ici en français..."
              />
              <div className="row">
                <button className="button" onClick={submitTypedAnswer} disabled={isSubmitting}>
                  {isSubmitting ? "Scoring..." : "Send typed answer"}
                </button>
                <button className="ghostButton" onClick={askNewQuestion}>Next question</button>
                {turnMode === "manual" && statusLive ? (
                  <button className="ghostButton" onClick={requestManualResponse}>AI speak</button>
                ) : null}
              </div>
              <div className="footerNote">
                Voice mode listens from your mic through WebRTC. Typed mode still works when voice is disconnected. The grading button uses the latest learner answer.
              </div>
            </div>
          </main>

          <aside className="card">
            <h2 className="panelTitle">Feedback panel</h2>
            {grade ? (
              <div className="scoreBox">
                <div className="scoreBadge">
                  <div className="small">Estimated speaking mark</div>
                  <strong>{grade.total}/28</strong>
                </div>
                <div>
                  {grade.breakdown.map((item) => (
                    <div className="kv" key={item.criterion}>
                      <span>{item.criterion}</span>
                      <strong>{item.score}/{item.max}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="panelTitle">Strengths</h3>
                  <ul className="list">
                    {grade.strengths.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="panelTitle">Targets</h3>
                  <ul className="list">
                    {grade.targets.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="panelTitle">Evidence</h3>
                  <div className="transcriptBox">
                    {grade.evidence.length ? grade.evidence.join("\n\n") : "No evidence extracted yet."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="small">Send an answer to generate a rubric-based estimate.</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
