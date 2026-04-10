"use client";

import { useMemo, useState } from "react";
import { PlannerStoreProvider, usePlannerStore } from "@/store/usePlannerStore";
import { overallPreparedness, subjectPreparedness, subtopicPreparedness } from "@/lib/scoring";

type View = "home" | "calendar" | "subject" | "flashcards";

function PlannerInner() {
  const {
    data,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    addSubtopic,
    updateSubtopic,
    deleteSubtopic,
    addSession,
    updateSession,
    deleteSession,
    completeSession
  } = usePlannerStore();

  const [view, setView] = useState<View>("home");
  const [selectedSubjectId, setSelectedSubjectId] = useState(data.subjectOrder[0] || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({
    subjectId: data.subjectOrder[0] || "",
    topicId: "",
    subtopicId: "",
    start: "17:00",
    end: "17:45"
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [flashSubjectId, setFlashSubjectId] = useState<string>("all");
  const [flashIndex, setFlashIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flashStats, setFlashStats] = useState({ correct: 0, incorrect: 0 });

  const selectedSubject = data.subjects[selectedSubjectId];
  const overall = overallPreparedness(data);
  const subjects = data.subjectOrder.map((id) => data.subjects[id]).filter(Boolean);

  const sessionsForDate = useMemo(
    () =>
      Object.values(data.sessions)
        .filter((s) => s.startAt.slice(0, 10) === selectedDate)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [data.sessions, selectedDate]
  );

  const topicsForSubject = form.subjectId ? data.subjects[form.subjectId]?.topicIds.map((id) => data.topics[id]).filter(Boolean) || [] : [];
  const subtopicsForTopic = form.topicId ? data.topics[form.topicId]?.subtopicIds.map((id) => data.subtopics[id]).filter(Boolean) || [] : [];
  const graphData = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    progress: subjectPreparedness(subject, data)
  }));
  const flashcards = useMemo(() => {
    const allowedSubjectIds = flashSubjectId === "all" ? new Set(subjects.map((s) => s.id)) : new Set([flashSubjectId]);
    return Object.values(data.subtopics)
      .map((subtopic) => {
        const topic = Object.values(data.topics).find((t) => t.subtopicIds.includes(subtopic.id));
        const subject = topic ? Object.values(data.subjects).find((s) => s.topicIds.includes(topic.id)) : undefined;
        return subject && allowedSubjectIds.has(subject.id)
          ? {
              id: subtopic.id,
              subject: subject.name,
              question: subtopic.name,
              answer: subtopic.notes || "No notes yet. Add notes to use this as revision content."
            }
          : null;
      })
      .filter((item): item is { id: string; subject: string; question: string; answer: string } => Boolean(item));
  }, [data.subtopics, data.subjects, data.topics, flashSubjectId, subjects]);
  const currentCard = flashcards[flashIndex];

  function addAppointment() {
    if (!form.subjectId || !form.topicId || !form.subtopicId) {
      alert("Please choose subject, topic and sub-topic.");
      return;
    }
    const subject = data.subjects[form.subjectId];
    const subtopic = data.subtopics[form.subtopicId];
    const startAt = new Date(`${selectedDate}T${form.start}`).toISOString();
    const endAt = new Date(`${selectedDate}T${form.end}`).toISOString();
    const id = addSession({
      subjectId: form.subjectId,
      topicId: form.topicId,
      subtopicId: form.subtopicId,
      title: `${subject.name} • ${subtopic.name}`,
      startAt,
      endAt
    });
    if (!id) {
      alert("This appointment overlaps with another one. Choose another time.");
      return;
    }
  }

  return (
    <div className="app">
      <aside className="sidebar card">
        <h2>AI IGCSE Planner</h2>
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}>Home</button>
        <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>Calendar</button>
        <button className={view === "flashcards" ? "active" : ""} onClick={() => setView("flashcards")}>Flashcards</button>

        <div className="menuTitle">Subjects</div>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            className={`subjectMenu ${view === "subject" && selectedSubjectId === subject.id ? "active" : ""}`}
            style={{ borderLeft: `6px solid ${subject.color}` }}
            onClick={() => {
              setSelectedSubjectId(subject.id);
              setView("subject");
            }}
          >
            <span>{subject.name}</span>
            <strong>{subjectPreparedness(subject, data)}%</strong>
          </button>
        ))}

        <button className="addBtn" onClick={addSubject}>+ Add subject</button>
      </aside>

      <main className="content card">
        {view === "home" && (
          <section>
            <h1>Homepage</h1>
            <p>Keep revision simple: choose a subject, schedule a session, and track confidence.</p>
            <div className="stats">
              <div className="stat"><span>Overall progress</span><strong>{overall}%</strong></div>
              <div className="stat"><span>Total subjects</span><strong>{subjects.length}</strong></div>
              <div className="stat"><span>Appointments today</span><strong>{sessionsForDate.length}</strong></div>
            </div>

            <h3>Weak topics to revise next</h3>
            <div className="chips">
              {Object.values(data.subtopics)
                .map((s) => ({ ...s, score: subtopicPreparedness(s) }))
                .sort((a, b) => a.score - b.score)
                .slice(0, 4)
                .map((s) => (
                  <div key={s.id} className="chip">
                    {s.name} • {Math.round(s.score * 100)}%
                  </div>
                ))}
            </div>

            <h3>Subject progress graph</h3>
            <div className="chartCard">
              <svg viewBox="0 0 620 260" className="progressChart" role="img" aria-label="Subject progress bar chart">
                <line x1="50" y1="20" x2="50" y2="220" stroke="#94a3b8" strokeWidth="1" />
                <line x1="50" y1="220" x2="600" y2="220" stroke="#94a3b8" strokeWidth="1" />
                {[0, 25, 50, 75, 100].map((tick) => {
                  const y = 220 - tick * 2;
                  return (
                    <g key={tick}>
                      <line x1="45" y1={y} x2="600" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                      <text x="18" y={y + 4} className="axisLabel">{tick}%</text>
                    </g>
                  );
                })}
                {graphData.map((item, idx) => {
                  const width = Math.max(34, Math.floor(460 / Math.max(1, graphData.length)));
                  const x = 70 + idx * (width + 20);
                  const height = item.progress * 2;
                  const y = 220 - height;
                  return (
                    <g key={item.id}>
                      <rect x={x} y={y} width={width} height={height} rx="6" fill={item.color} opacity="0.9" />
                      <text x={x + width / 2} y={y - 8} textAnchor="middle" className="barValue">{item.progress}%</text>
                      <text x={x + width / 2} y={240} textAnchor="middle" className="axisLabel">{item.name.slice(0, 10)}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>
        )}

        {view === "calendar" && (
          <section>
            <h1>Calendar</h1>
            <p>Simple appointment manager: add, edit time, mark complete, or delete.</p>

            <div className="formGrid">
              <label>
                Date
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </label>
              <label>
                Subject
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value, topicId: "", subtopicId: "" }))}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label>
                Topic
                <select value={form.topicId} onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value, subtopicId: "" }))}>
                  <option value="">Select topic</option>
                  {topicsForSubject.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label>
                Sub-topic
                <select value={form.subtopicId} onChange={(e) => setForm((f) => ({ ...f, subtopicId: e.target.value }))}>
                  <option value="">Select sub-topic</option>
                  {subtopicsForTopic.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label>
                Start time
                <input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
              </label>
              <label>
                End time
                <input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
              </label>
            </div>
            <button className="addBtn" onClick={addAppointment}>Add appointment</button>

            <h3>{selectedDate} appointments</h3>
            <div className="appointments">
              {sessionsForDate.map((session) => {
                const subjectColor = data.subjects[session.subjectId]?.color || "#64748b";
                return (
                  <div key={session.id} className="appointment" style={{ borderLeft: `8px solid ${subjectColor}` }}>
                    <div>
                      <strong>{session.title}</strong>
                      <div className="small">{new Date(session.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(session.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div className="row">
                      {editingSessionId === session.id ? (
                        <>
                          <label className="inlineLabel">
                            Start
                            <input type="time" value={session.startAt.slice(11, 16)} onChange={(e) => updateSession(session.id, { startAt: new Date(`${selectedDate}T${e.target.value}`).toISOString() })} />
                          </label>
                          <label className="inlineLabel">
                            End
                            <input type="time" value={session.endAt.slice(11, 16)} onChange={(e) => updateSession(session.id, { endAt: new Date(`${selectedDate}T${e.target.value}`).toISOString() })} />
                          </label>
                          <button onClick={() => setEditingSessionId(null)}>Done</button>
                        </>
                      ) : (
                        <button onClick={() => setEditingSessionId(session.id)}>Edit time</button>
                      )}
                      <button onClick={() => {
                        const confidence = Number(prompt("Confidence (1-5)", "3") || "3") as 1|2|3|4|5;
                        const notes = prompt("Notes", "") || "";
                        completeSession(session.id, confidence, notes);
                      }}>Complete</button>
                      <button className="danger" onClick={() => confirm("Delete appointment?") && deleteSession(session.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {!sessionsForDate.length && <p>No appointments yet for this date.</p>}
            </div>
          </section>
        )}

        {view === "flashcards" && (
          <section>
            <h1>Flashcards / Self-test</h1>
            <p>Test yourself on vocabulary and key notes from your sub-topics.</p>
            <div className="formGrid">
              <label>
                Subject filter
                <select
                  value={flashSubjectId}
                  onChange={(e) => {
                    setFlashSubjectId(e.target.value);
                    setFlashIndex(0);
                    setShowAnswer(false);
                    setFlashStats({ correct: 0, incorrect: 0 });
                  }}
                >
                  <option value="all">All subjects</option>
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
            </div>
            {!currentCard ? (
              <p>No flashcards available. Add notes to your sub-topics first.</p>
            ) : (
              <div className="flashCard">
                <div className="small">{currentCard.subject} • Card {flashIndex + 1} / {flashcards.length}</div>
                <h3>{currentCard.question}</h3>
                {showAnswer ? <p className="answerBox">{currentCard.answer}</p> : <p className="small">Think first, then reveal the answer.</p>}
                <div className="row">
                  <button onClick={() => setShowAnswer((v) => !v)}>{showAnswer ? "Hide answer" : "Show answer"}</button>
                  <button onClick={() => {
                    setFlashStats((s) => ({ ...s, correct: s.correct + 1 }));
                    setShowAnswer(false);
                    setFlashIndex((i) => (i + 1) % flashcards.length);
                  }}>✅ I got it</button>
                  <button className="danger" onClick={() => {
                    setFlashStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
                    setShowAnswer(false);
                    setFlashIndex((i) => (i + 1) % flashcards.length);
                  }}>❌ Needs work</button>
                </div>
                <div className="small">Score: {flashStats.correct} correct • {flashStats.incorrect} needs work</div>
              </div>
            )}
          </section>
        )}

        {view === "subject" && selectedSubject && (
          <section>
            <h1>{selectedSubject.name}</h1>
            <p>Revision complete: <strong>{subjectPreparedness(selectedSubject, data)}%</strong></p>

            <div className="formGrid">
              <label>
                Subject name
                <input value={selectedSubject.name} onChange={(e) => updateSubject(selectedSubject.id, { name: e.target.value })} />
              </label>
              <label>
                Subject colour
                <input type="color" value={selectedSubject.color} onChange={(e) => updateSubject(selectedSubject.id, { color: e.target.value })} />
              </label>
              <label>
                Target study hours
                <input type="number" value={selectedSubject.targetStudyHours} onChange={(e) => updateSubject(selectedSubject.id, { targetStudyHours: Number(e.target.value) })} />
              </label>
            </div>
            <button className="danger" onClick={() => confirm("Delete subject?") && deleteSubject(selectedSubject.id)}>Delete subject</button>
            <button className="addBtn" onClick={() => addTopic(selectedSubject.id)}>+ Add topic</button>

            {selectedSubject.topicIds.map((topicId) => {
              const topic = data.topics[topicId];
              if (!topic) return null;
              return (
                <div key={topicId} className="topicCard">
                  <div className="row between">
                    <label>
                      Topic name
                      <input value={topic.name} onChange={(e) => updateTopic(topicId, { name: e.target.value })} />
                    </label>
                    <button className="danger" onClick={() => confirm("Delete topic?") && deleteTopic(selectedSubject.id, topicId)}>Delete topic</button>
                  </div>
                  <button className="addBtn" onClick={() => addSubtopic(topicId)}>+ Add sub-topic</button>

                  {topic.subtopicIds.map((subtopicId) => {
                    const subtopic = data.subtopics[subtopicId];
                    if (!subtopic) return null;
                    return (
                      <div key={subtopicId} className="subtopicCard">
                        <div className="formGrid">
                          <label>
                            Sub-topic name
                            <input value={subtopic.name} onChange={(e) => updateSubtopic(subtopicId, { name: e.target.value })} />
                          </label>
                          <label>
                            Target minutes
                            <input type="number" value={subtopic.targetMinutes} onChange={(e) => updateSubtopic(subtopicId, { targetMinutes: Number(e.target.value) })} />
                          </label>
                          <label>
                            Difficulty (1-5)
                            <input type="number" min={1} max={5} value={subtopic.difficulty} onChange={(e) => updateSubtopic(subtopicId, { difficulty: Number(e.target.value) as 1|2|3|4|5 })} />
                          </label>
                          <label>
                            Confidence (1-5)
                            <input type="number" min={1} max={5} value={subtopic.confidence} onChange={(e) => updateSubtopic(subtopicId, { confidence: Number(e.target.value) as 1|2|3|4|5 })} />
                          </label>
                        </div>
                        <label>
                          Notes
                          <textarea value={subtopic.notes} onChange={(e) => updateSubtopic(subtopicId, { notes: e.target.value })} />
                        </label>
                        <div className="small">Time spent: {subtopic.timeSpentMinutes} mins • Last studied: {subtopic.lastStudiedAt ? new Date(subtopic.lastStudiedAt).toLocaleDateString() : "Never"}</div>
                        <button className="danger" onClick={() => confirm("Delete sub-topic?") && deleteSubtopic(topicId, subtopicId)}>Delete sub-topic</button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default function PlannerApp() {
  return (
    <PlannerStoreProvider>
      <PlannerInner />
    </PlannerStoreProvider>
  );
}
