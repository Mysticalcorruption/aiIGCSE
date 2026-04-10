"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultPlannerData } from "@/lib/data";
import { getOverallPreparedness, getSubjectPreparedness } from "@/lib/scoring";
import { PlannerData } from "@/lib/types";

const STORAGE_KEY = "aiigcse-planner-v2";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function RevisionPlannerApp() {
  const [data, setData] = useState<PlannerData>(defaultPlannerData);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const overallPreparedness = useMemo(() => getOverallPreparedness(data), [data]);
  const todaySessions = data.sessions.filter((session) => session.day === selectedDay);

  function updateSession(id: string, patch: Record<string, string | boolean | number>) {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session) => (session.id === id ? { ...session, ...patch } : session))
    }));
  }

  function addSession() {
    const firstSubject = data.subjects[0];
    const firstTopic = firstSubject.topics[0];
    const firstSubtopic = firstTopic.subtopics[0];
    setData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          id: uid(),
          subjectId: firstSubject.id,
          topicId: firstTopic.id,
          subtopicId: firstSubtopic.id,
          title: `${firstSubject.name} • ${firstSubtopic.name}`,
          day: selectedDay,
          start: "17:00",
          end: "17:30",
          completed: false,
          minutesLogged: 0
        }
      ]
    }));
  }

  function addSubject() {
    setData((prev) => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          id: uid(),
          name: "New Subject",
          color: "var(--accent-4)",
          topics: [
            {
              id: uid(),
              name: "New Topic",
              subtopics: [
                { id: uid(), name: "New Sub-topic", complete: false, confidence: 3, targetMinutes: 60, minutesStudied: 0 }
              ]
            }
          ]
        }
      ]
    }));
  }

  function startTimer(sessionId: string) {
    setActiveSessionId(sessionId);
    setTimerSeconds(0);
    setTimerRunning(true);
  }

  function stopTimer() {
    if (!activeSessionId) return;
    const minutes = Math.round(timerSeconds / 60);
    updateSession(activeSessionId, { minutesLogged: minutes });
    setTimerRunning(false);
    setActiveSessionId(null);
    setTimerSeconds(0);
  }

  function updateSubjectName(subjectId: string, value: string) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) => (subject.id === subjectId ? { ...subject, name: value } : subject))
    }));
  }

  function updateTopicName(subjectId: string, topicId: string, value: string) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id !== subjectId
          ? subject
          : {
              ...subject,
              topics: subject.topics.map((topic) => (topic.id === topicId ? { ...topic, name: value } : topic))
            }
      )
    }));
  }

  function updateSubtopic(subjectId: string, topicId: string, subtopicId: string, patch: Record<string, string | number | boolean>) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id !== subjectId
          ? subject
          : {
              ...subject,
              topics: subject.topics.map((topic) =>
                topic.id !== topicId
                  ? topic
                  : {
                      ...topic,
                      subtopics: topic.subtopics.map((subtopic) =>
                        subtopic.id === subtopicId ? { ...subtopic, ...patch } : subtopic
                      )
                    }
              )
            }
      )
    }));
  }

  function addSubtopic(subjectId: string, topicId: string) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id !== subjectId
          ? subject
          : {
              ...subject,
              topics: subject.topics.map((topic) =>
                topic.id !== topicId
                  ? topic
                  : {
                      ...topic,
                      subtopics: [
                        ...topic.subtopics,
                        { id: uid(), name: "New Sub-topic", complete: false, confidence: 3, targetMinutes: 45, minutesStudied: 0 }
                      ]
                    }
              )
            }
      )
    }));
  }

  return (
    <div className="page">
      <div className="shell">
        <header className="hero card fadeUp">
          <div>
            <div className="eyebrow">aiIGCSE Planner v2</div>
            <h1>Interactive revision planner with editable subjects, sub-topics, and a manageable calendar</h1>
            <p>
              Plan each day, track actual study time, edit subject breakdowns, and see how close you are to being fully prepared.
            </p>
          </div>
          <div className="ringWrap pulseGlow">
            <div className="ring" style={{ background: `conic-gradient(var(--accent-1) ${overallPreparedness}%, rgba(255,255,255,0.08) 0)` }}>
              <div className="ringInner">
                <strong>{overallPreparedness}%</strong>
                <span>Prepared</span>
              </div>
            </div>
          </div>
        </header>

        <section className="gridTop">
          <div className="card statCard fadeUp delay1">
            <span>Today’s sessions</span>
            <strong>{todaySessions.length}</strong>
          </div>
          <div className="card statCard fadeUp delay2">
            <span>Study streak</span>
            <strong>{data.streak} days</strong>
          </div>
          <div className="card statCard fadeUp delay3">
            <span>Subjects</span>
            <strong>{data.subjects.length}</strong>
          </div>
          <div className="card statCard fadeUp delay4">
            <span>Timer</span>
            <strong>{`${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s`}</strong>
          </div>
        </section>

        <div className="mainGrid">
          <aside className="card sidebar fadeUp">
            <div className="sidebarHeader">
              <h2>Calendar</h2>
              <button className="button" onClick={addSession}>Add session</button>
            </div>
            <div className="days">
              {DAYS.map((day) => (
                <button
                  key={day}
                  className={`dayButton ${selectedDay === day ? "active" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="sessionList">
              {todaySessions.map((session) => (
                <div key={session.id} className="sessionCard floatIn">
                  <input
                    className="titleInput"
                    value={session.title}
                    onChange={(e) => updateSession(session.id, { title: e.target.value })}
                  />
                  <div className="timeRow">
                    <input type="time" value={session.start} onChange={(e) => updateSession(session.id, { start: e.target.value })} />
                    <span>to</span>
                    <input type="time" value={session.end} onChange={(e) => updateSession(session.id, { end: e.target.value })} />
                  </div>
                  <div className="timeRow">
                    <label>
                      <input
                        type="checkbox"
                        checked={session.completed}
                        onChange={(e) => updateSession(session.id, { completed: e.target.checked })}
                      /> Completed
                    </label>
                    <span>{session.minutesLogged} min logged</span>
                  </div>
                  <div className="row">
                    <button className="ghostButton" onClick={() => startTimer(session.id)}>Start timer</button>
                    <button className="ghostButton" onClick={stopTimer} disabled={activeSessionId !== session.id || !timerRunning}>Stop</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="contentCol">
            <section className="card fadeUp delay2">
              <div className="sectionHeader">
                <h2>Subject breakdown</h2>
                <button className="button" onClick={addSubject}>Add subject</button>
              </div>
              <div className="subjectGrid">
                {data.subjects.map((subject) => {
                  const subjectPreparedness = getSubjectPreparedness(subject);
                  return (
                    <div key={subject.id} className="subjectCard slideIn">
                      <div className="subjectHead">
                        <input
                          className="subjectName"
                          value={subject.name}
                          onChange={(e) => updateSubjectName(subject.id, e.target.value)}
                        />
                        <span className="subjectPercent">{subjectPreparedness}%</span>
                      </div>
                      <div className="progressBar">
                        <div className="progressFill" style={{ width: `${subjectPreparedness}%`, background: subject.color }} />
                      </div>
                      {subject.topics.map((topic) => (
                        <div key={topic.id} className="topicBox">
                          <input
                            className="topicName"
                            value={topic.name}
                            onChange={(e) => updateTopicName(subject.id, topic.id, e.target.value)}
                          />
                          {topic.subtopics.map((subtopic) => (
                            <div key={subtopic.id} className="subtopicRow">
                              <input
                                className="subtopicName"
                                value={subtopic.name}
                                onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, { name: e.target.value })}
                              />
                              <label>
                                Confidence
                                <input
                                  type="range"
                                  min={1}
                                  max={5}
                                  value={subtopic.confidence}
                                  onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, { confidence: Number(e.target.value) })}
                                />
                              </label>
                              <label>
                                Target mins
                                <input
                                  type="number"
                                  value={subtopic.targetMinutes}
                                  onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, { targetMinutes: Number(e.target.value) })}
                                />
                              </label>
                              <label>
                                Studied mins
                                <input
                                  type="number"
                                  value={subtopic.minutesStudied}
                                  onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, { minutesStudied: Number(e.target.value) })}
                                />
                              </label>
                              <label className="checkboxLine">
                                <input
                                  type="checkbox"
                                  checked={subtopic.complete}
                                  onChange={(e) => updateSubtopic(subject.id, topic.id, subtopic.id, { complete: e.target.checked })}
                                /> Done
                              </label>
                            </div>
                          ))}
                          <button className="ghostButton smallBtn" onClick={() => addSubtopic(subject.id, topic.id)}>Add sub-topic</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
