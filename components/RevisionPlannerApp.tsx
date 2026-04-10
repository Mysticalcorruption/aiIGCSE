"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultState } from "@/lib/data";
import { getPreparedness } from "@/lib/scoring";
import { PlannerState } from "@/lib/types";

const STORAGE_KEY = "aiigcse-revision-planner-v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function minutesToClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function startOfDayOffset(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function RevisionPlannerApp() {
  const [state, setState] = useState<PlannerState>(defaultState);
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultState.subjects[0].id);
  const [selectedTopicId, setSelectedTopicId] = useState(defaultState.subjects[0].topics[0].id);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskDay, setNewTaskDay] = useState(startOfDayOffset(0));

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const preparedness = useMemo(() => getPreparedness(state), [state]);
  const selectedSubject = state.subjects.find((s) => s.id === selectedSubjectId) ?? state.subjects[0];
  const selectedTopic = selectedSubject.topics.find((t) => t.id === selectedTopicId) ?? selectedSubject.topics[0];

  const todayKey = startOfDayOffset(0);
  const todayTasks = state.planItems.filter((item) => item.dayKey === todayKey);
  const totalSessions = state.sessions.length;
  const totalMinutes = Math.round(state.subjects.reduce((sum, s) => sum + s.topics.reduce((a, t) => a + t.minutesStudied, 0), 0));
  const completedTasks = state.planItems.filter((p) => p.done).length;

  function togglePlanItem(id: string) {
    setState((prev) => ({
      ...prev,
      planItems: prev.planItems.map((item) => item.id === id ? { ...item, done: !item.done } : item)
    }));
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    setState((prev) => ({
      ...prev,
      planItems: [
        {
          id: uid(),
          title: newTaskTitle.trim(),
          dayKey: newTaskDay,
          durationMinutes: newTaskMinutes,
          subjectId: selectedSubjectId,
          done: false
        },
        ...prev.planItems
      ]
    }));
    setNewTaskTitle("");
  }

  function markTopicComplete(subjectId: string, topicId: string) {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id !== subjectId ? subject : {
          ...subject,
          topics: subject.topics.map((topic) =>
            topic.id !== topicId ? topic : {
              ...topic,
              completed: !topic.completed,
              confidence: topic.completed ? Math.max(20, topic.confidence - 10) : Math.min(100, topic.confidence + 20)
            }
          )
        }
      )
    }));
  }

  function adjustConfidence(subjectId: string, topicId: string, delta: number) {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id !== subjectId ? subject : {
          ...subject,
          topics: subject.topics.map((topic) =>
            topic.id !== topicId ? topic : { ...topic, confidence: Math.max(0, Math.min(100, topic.confidence + delta)) }
          )
        }
      )
    }));
  }

  function saveSession() {
    if (timerSeconds < 60) return;
    const durationMinutes = Math.round(timerSeconds / 60);
    setState((prev) => ({
      ...prev,
      sessions: [
        { id: uid(), subjectId: selectedSubjectId, topicId: selectedTopicId, durationMinutes, createdAt: new Date().toISOString() },
        ...prev.sessions
      ],
      subjects: prev.subjects.map((subject) =>
        subject.id !== selectedSubjectId ? subject : {
          ...subject,
          topics: subject.topics.map((topic) =>
            topic.id !== selectedTopicId ? topic : {
              ...topic,
              minutesStudied: topic.minutesStudied + durationMinutes,
              confidence: Math.min(100, topic.confidence + Math.max(4, Math.round(durationMinutes / 5)))
            }
          )
        }
      )
    }));
    setTimerSeconds(0);
    setRunning(false);
  }

  const days = Array.from({ length: 7 }, (_, i) => startOfDayOffset(i));

  return (
    <div className="page">
      <div className="shell">
        <section className="hero">
          <div>
            <div className="badge">aiIGCSE • Revision Planner</div>
            <h1 className="title">Plan smarter. Revise harder. Track exactly how ready you are.</h1>
            <p className="subtitle">
              Built as a fully interactive revision planner and tracker with a daily calendar, animated preparedness score, study timer, session logging, topic confidence controls, and subject-by-subject progress.
            </p>
          </div>
        </section>

        <div className="metricRow">
          <div className="metric"><div className="small">Preparedness</div><div className="metricValue">{preparedness.total}%</div></div>
          <div className="metric"><div className="small">Total study time</div><div className="metricValue">{totalMinutes}m</div></div>
          <div className="metric"><div className="small">Completed tasks</div><div className="metricValue">{completedTasks}</div></div>
          <div className="metric"><div className="small">Sessions logged</div><div className="metricValue">{totalSessions}</div></div>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Preparedness meter</h2>
            <div className="ringWrap">
              <div className="readinessCircle" style={{ ["--prepared" as string]: `${preparedness.total * 3.6}deg` }}>
                <div className="readinessInner">{preparedness.total}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="small">Topics completed</div>
                <div className="progressBar"><div className="progressFill" style={{ width: `${preparedness.completionScore * 2}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)" }} /></div>
                <div className="small" style={{ marginTop: 12 }}>Study time target</div>
                <div className="progressBar"><div className="progressFill" style={{ width: `${preparedness.timeScore * 4}%`, background: "linear-gradient(90deg,#60a5fa,#2563eb)" }} /></div>
                <div className="small" style={{ marginTop: 12 }}>Consistency</div>
                <div className="progressBar"><div className="progressFill" style={{ width: `${preparedness.consistencyScore * 6.67}%`, background: "linear-gradient(90deg,#a78bfa,#7c3aed)" }} /></div>
                <div className="small" style={{ marginTop: 12 }}>Weak-topic recovery</div>
                <div className="progressBar"><div className="progressFill" style={{ width: `${preparedness.weaknessRecovery * 10}%`, background: "linear-gradient(90deg,#f59e0b,#ea580c)" }} /></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Focus timer</h2>
            <div className="timerCircle" style={{ ["--p" as string]: `${Math.min((timerSeconds % 3600) / 36, 100) * 3.6}deg` }}>
              <div className="timerInner">
                <div>
                  <div className="small">Current session</div>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>{minutesToClock(timerSeconds)}</div>
                </div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 16 }}>
              <select className="select" value={selectedSubjectId} onChange={(e) => {
                const subject = state.subjects.find((s) => s.id === e.target.value)!;
                setSelectedSubjectId(subject.id);
                setSelectedTopicId(subject.topics[0].id);
              }}>
                {state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
              <select className="select" value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)}>
                {selectedSubject.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
              </select>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="button" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</button>
              <button className="ghost" onClick={() => { setRunning(false); setTimerSeconds(0); }}>Reset</button>
              <button className="ghost" onClick={saveSession}>Save session</button>
            </div>
          </div>

          <div className="card">
            <h2>Today</h2>
            <div className="planList">
              {todayTasks.length ? todayTasks.map((item) => (
                <label key={item.id} className="planItem spaceBetween">
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div className="small">{state.subjects.find((s) => s.id === item.subjectId)?.name} • {item.durationMinutes} min</div>
                  </div>
                  <input className="checkbox" type="checkbox" checked={item.done} onChange={() => togglePlanItem(item.id)} />
                </label>
              )) : <div className="small">No tasks for today yet.</div>}
            </div>
          </div>
        </div>

        <div className="layout2">
          <div className="card">
            <h2>Daily calendar</h2>
            <div className="row" style={{ marginBottom: 14 }}>
              <input className="input" placeholder="Add new task" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              <input className="input" type="number" min={10} max={240} value={newTaskMinutes} onChange={(e) => setNewTaskMinutes(Number(e.target.value))} />
              <input className="input" type="date" value={newTaskDay} onChange={(e) => setNewTaskDay(e.target.value)} />
              <button className="button" onClick={addTask}>Add</button>
            </div>
            <div className="calendarGrid">
              {days.map((day) => {
                const items = state.planItems.filter((item) => item.dayKey === day);
                return (
                  <div key={day} className="dayCell">
                    <div className="dayHeader">{new Date(day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</div>
                    <div className="planList">
                      {items.length ? items.map((item) => (
                        <div key={item.id} className="planItem">
                          <div className="spaceBetween">
                            <div>
                              <div style={{ fontWeight: 700 }}>{item.title}</div>
                              <div className="small">{item.durationMinutes} min</div>
                            </div>
                            <input className="checkbox" type="checkbox" checked={item.done} onChange={() => togglePlanItem(item.id)} />
                          </div>
                        </div>
                      )) : <div className="small">Nothing planned</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div className="card">
              <h2>Subjects</h2>
              <div className="subjectList">
                {state.subjects.map((subject) => {
                  const totalTopicMinutes = subject.topics.reduce((sum, t) => sum + t.minutesStudied, 0);
                  const completed = subject.topics.filter((t) => t.completed).length;
                  const progress = Math.round(((completed / subject.topics.length) * 60) + (Math.min(totalTopicMinutes / subject.targetMinutes, 1) * 40));
                  return (
                    <div key={subject.id} className="subjectCard">
                      <div className="spaceBetween">
                        <div>
                          <div style={{ fontWeight: 800 }}>{subject.name}</div>
                          <div className="small">{completed}/{subject.topics.length} topics complete • {totalTopicMinutes}/{subject.targetMinutes} min</div>
                        </div>
                        <span className="badge">{progress}%</span>
                      </div>
                      <div className="progressBar" style={{ marginTop: 10 }}>
                        <div className="progressFill" style={{ width: `${progress}%`, background: subject.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h2>Topic tracker</h2>
              <div className="small" style={{ marginBottom: 10 }}>{selectedSubject.name}</div>
              <div className="topicList">
                {selectedSubject.topics.map((topic) => (
                  <div key={topic.id} className="topicItem">
                    <div className="spaceBetween">
                      <div>
                        <div style={{ fontWeight: 700 }}>{topic.name}</div>
                        <div className="small">Confidence {topic.confidence}% • {topic.minutesStudied} min</div>
                      </div>
                      <input className="checkbox" type="checkbox" checked={topic.completed} onChange={() => markTopicComplete(selectedSubject.id, topic.id)} />
                    </div>
                    <div className="progressBar" style={{ marginTop: 10 }}>
                      <div className="progressFill" style={{ width: `${topic.confidence}%`, background: selectedSubject.color }} />
                    </div>
                    <div className="row" style={{ marginTop: 10 }}>
                      <button className="ghost" onClick={() => adjustConfidence(selectedSubject.id, topic.id, -10)}>-10</button>
                      <button className="ghost" onClick={() => adjustConfidence(selectedSubject.id, topic.id, 10)}>+10</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Recent sessions</h2>
              <div className="subjectList">
                {state.sessions.length ? state.sessions.slice(0, 6).map((session) => {
                  const subject = state.subjects.find((s) => s.id === session.subjectId);
                  const topic = subject?.topics.find((t) => t.id === session.topicId);
                  return (
                    <div key={session.id} className="sessionItem">
                      <div style={{ fontWeight: 700 }}>{subject?.name} • {topic?.name}</div>
                      <div className="small">{session.durationMinutes} min • {new Date(session.createdAt).toLocaleString()}</div>
                    </div>
                  );
                }) : <div className="small">No study sessions saved yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
