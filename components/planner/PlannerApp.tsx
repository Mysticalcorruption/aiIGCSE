"use client";

import { useMemo, useState } from "react";
import { PlannerStoreProvider, usePlannerStore } from "@/store/usePlannerStore";
import { overallPreparedness, subjectPreparedness, subtopicPreparedness } from "@/lib/scoring";
import { addDays, startOfDay, uid } from "@/lib/utils";

function PlannerInner() {
  const { data, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic, addSubtopic, updateSubtopic, deleteSubtopic, addSession, updateSession, deleteSession, completeSession, restoreTrash, purgeTrash, exportJson, importJson } = usePlannerStore();
  const [open, setOpen] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState(data.subjectOrder[0]);
  const [view, setView] = useState<"day" | "week">("week");
  const [anchorDate, setAnchorDate] = useState(startOfDay(new Date()));
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  const selected = data.subjects[selectedSubjectId];
  const preparedness = overallPreparedness(data);
  const sessionList = Object.values(data.sessions).sort((a, b) => a.startAt.localeCompare(b.startAt));
  const days = view === "day" ? [anchorDate] : [...Array(7)].map((_, i) => addDays(anchorDate, i));

  const heatmap = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(data.logs).forEach((log) => {
      const k = log.startedAt.slice(0, 10);
      map[k] = (map[k] || 0) + log.durationMinutes;
    });
    return map;
  }, [data.logs]);

  const weak = useMemo(() => Object.values(data.subtopics).map((s) => ({ ...s, score: subtopicPreparedness(s) })).sort((a, b) => a.score - b.score).slice(0, 4), [data.subtopics]);

  return <div className="app-shell">
    <header className="topbar card">
      <button className="icon" onClick={() => setOpen((v) => !v)}>☰</button>
      <div>
        <h1>AI IGCSE Revision Planner V3</h1>
        <p>Startup-grade planning, tracking, and realistic preparedness.</p>
      </div>
      <div className="badge">Overall {preparedness}%</div>
    </header>

    <div className="layout">
      {open && <aside className="sidebar card">
        <div className="row between"><h3>Subjects</h3><button onClick={addSubject}>+ Subject</button></div>
        {data.subjectOrder.map((sid) => {
          const subject = data.subjects[sid];
          if (!subject) return null;
          return <div key={sid} className="subjectNode">
            <button className="subjectBtn" style={{ borderLeftColor: subject.color }} onClick={() => setSelectedSubjectId(sid)}>{subject.name}</button>
            {subject.topicIds.map((tid) => {
              const topic = data.topics[tid];
              if (!topic) return null;
              return <div key={tid} className="topicNode"><div>▸ {topic.name}</div>{topic.subtopicIds.map((stid) => <div className="subNode" key={stid}>• {data.subtopics[stid]?.name}</div>)}</div>;
            })}
          </div>;
        })}
      </aside>}

      <main className="main card">
        <div className="row between">
          <div className="row"><button onClick={() => setView("day")} className={view === "day" ? "active" : ""}>Day</button><button onClick={() => setView("week")} className={view === "week" ? "active" : ""}>Week</button></div>
          <button onClick={() => {
            const sub = weak[0];
            if (!sub) return;
            const topic = Object.values(data.topics).find((t) => t.subtopicIds.includes(sub.id));
            const subject = Object.values(data.subjects).find((s) => s.topicIds.includes(topic?.id || ""));
            if (!topic || !subject) return;
            const start = new Date(); start.setMinutes(0,0,0); start.setHours(start.getHours() + 1);
            const end = new Date(start.getTime() + 45 * 60000);
            addSession({ subjectId: subject.id, topicId: topic.id, subtopicId: sub.id, title: `${subject.name} • ${sub.name}`, startAt: start.toISOString(), endAt: end.toISOString() });
          }}>Auto-plan weak topic</button>
        </div>

        <div className="calendar">
          {days.map((day) => <div className="dayCol" key={day.toISOString()}>
            <div className="dayHead">{day.toDateString()}</div>
            <div className="slots">
              {[...Array(24)].map((_, h) => <div key={h} className="slot" onDoubleClick={() => {
                const sub = weak[0];
                if (!sub) return;
                const topic = Object.values(data.topics).find((t) => t.subtopicIds.includes(sub.id));
                const subject = Object.values(data.subjects).find((s) => s.topicIds.includes(topic?.id || ""));
                if (!topic || !subject) return;
                const start = new Date(day); start.setHours(h, 0, 0, 0);
                const end = new Date(day); end.setHours(h, 45, 0, 0);
                const id = addSession({ subjectId: subject.id, topicId: topic.id, subtopicId: sub.id, title: `${subject.name} • ${sub.name}`, startAt: start.toISOString(), endAt: end.toISOString() });
                if (!id) alert("Session overlaps with an existing one.");
              }}>{String(h).padStart(2, "0")}:00</div>)}
              {sessionList.filter((s) => s.startAt.slice(0,10) === day.toISOString().slice(0,10)).map((session) => {
                const start = new Date(session.startAt); const end = new Date(session.endAt);
                const top = (start.getHours() * 60 + start.getMinutes()) / (24 * 60) * 100;
                const height = Math.max(2, (end.getTime() - start.getTime()) / (24 * 60 * 60000) * 100);
                const color = data.subjects[session.subjectId]?.color || "#64748b";
                return <div key={session.id} className="session" style={{ top: `${top}%`, height: `${height}%`, borderLeftColor: color }} onClick={() => setActiveSession(session.id)}>
                  <strong>{session.title}</strong>
                  <span>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>;
              })}
            </div>
          </div>)}
        </div>
      </main>

      <aside className="panel card">
        {selected && <>
          <h3>Subject details</h3>
          <input value={selected.name} onChange={(e) => updateSubject(selected.id, { name: e.target.value })} />
          <input type="color" value={selected.color} onChange={(e) => updateSubject(selected.id, { color: e.target.value })} />
          <input type="number" value={selected.targetStudyHours} onChange={(e) => updateSubject(selected.id, { targetStudyHours: Number(e.target.value) })} />
          <div>Progress: {subjectPreparedness(selected, data)}%</div>
          <button className="danger" onClick={() => confirm("Delete subject?") && deleteSubject(selected.id)}>Delete subject</button>
          <button onClick={() => addTopic(selected.id)}>+ Topic</button>
          {selected.topicIds.map((tid) => {
            const topic = data.topics[tid];
            if (!topic) return null;
            return <div className="topicEdit" key={tid}>
              <input value={topic.name} onChange={(e) => updateTopic(tid, { name: e.target.value })} />
              <button className="danger" onClick={() => confirm("Delete topic?") && deleteTopic(selected.id, tid)}>Del</button>
              <button onClick={() => addSubtopic(tid)}>+ Subtopic</button>
              {topic.subtopicIds.map((stid) => {
                const st = data.subtopics[stid]; if (!st) return null;
                return <div key={stid} className="subEdit">
                  <input value={st.name} onChange={(e) => updateSubtopic(stid, { name: e.target.value })} />
                  <input type="number" value={st.targetMinutes} onChange={(e) => updateSubtopic(stid, { targetMinutes: Number(e.target.value) })} />
                  <input type="number" min={1} max={5} value={st.difficulty} onChange={(e) => updateSubtopic(stid, { difficulty: Number(e.target.value) as 1|2|3|4|5 })} />
                  <input type="number" min={1} max={5} value={st.confidence} onChange={(e) => updateSubtopic(stid, { confidence: Number(e.target.value) as 1|2|3|4|5 })} />
                  <textarea value={st.notes} onChange={(e) => updateSubtopic(stid, { notes: e.target.value })} />
                  <div>{st.timeSpentMinutes} min • last {st.lastStudiedAt ? new Date(st.lastStudiedAt).toLocaleDateString() : "never"}</div>
                  <button className="danger" onClick={() => confirm("Delete sub-topic?") && deleteSubtopic(tid, stid)}>Delete</button>
                </div>;
              })}
            </div>;
          })}
        </>}

        <hr />
        <h3>Analytics</h3>
        <div>Weekly hours: {(Object.values(data.logs).filter((l) => Date.now() - new Date(l.startedAt).getTime() < 7*864e5).reduce((a,b) => a + b.durationMinutes, 0) / 60).toFixed(1)}</div>
        <div>Streak: {Object.keys(heatmap).length} active days</div>
        <div className="heatmap">{[...Array(28)].map((_, idx) => { const d = new Date(Date.now() - (27 - idx) * 864e5).toISOString().slice(0,10); const mins = heatmap[d] || 0; return <div key={d} title={`${d} ${mins}m`} style={{ opacity: Math.min(1, 0.15 + mins / 120) }} />; })}</div>

        <hr />
        <div className="row between"><h3>Trash (undo)</h3><span>{data.trash.length}</span></div>
        {data.trash.slice(0,8).map((t) => <div key={t.id} className="row between"><span>{t.label}</span><div className="row"><button onClick={() => restoreTrash(t.id)}>Undo</button><button className="danger" onClick={() => purgeTrash(t.id)}>Purge</button></div></div>)}

        <hr />
        <h3>Import / Export</h3>
        <button onClick={() => navigator.clipboard.writeText(exportJson())}>Copy JSON Export</button>
        <textarea placeholder="Paste JSON to import" onBlur={(e) => e.target.value && importJson(e.target.value)} />
      </aside>
    </div>

    {activeSession && <div className="modalBack" onClick={() => setActiveSession(null)}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <h3>{data.sessions[activeSession].title}</h3>
        <div className="row">
          <input type="datetime-local" value={data.sessions[activeSession].startAt.slice(0,16)} onChange={(e) => updateSession(activeSession, { startAt: new Date(e.target.value).toISOString() })} />
          <input type="datetime-local" value={data.sessions[activeSession].endAt.slice(0,16)} onChange={(e) => updateSession(activeSession, { endAt: new Date(e.target.value).toISOString() })} />
        </div>
        <div className="row">
          {!timerStart ? <button onClick={() => setTimerStart(Date.now())}>Start timer</button> : <button onClick={() => setTimerStart(null)}>Stop timer</button>}
          <button onClick={() => {
            const conf = Number(prompt("Confidence 1-5", "3") || "3") as 1|2|3|4|5;
            const notes = prompt("Study notes", "") || "";
            completeSession(activeSession, conf, notes);
            setTimerStart(null);
            setActiveSession(null);
          }}>Finish + log</button>
          <button className="danger" onClick={() => { if (confirm("Delete session?")) deleteSession(activeSession); setActiveSession(null); }}>Delete</button>
        </div>
      </div>
    </div>}
  </div>;
}

export default function PlannerApp() {
  return <PlannerStoreProvider><PlannerInner /></PlannerStoreProvider>;
}
