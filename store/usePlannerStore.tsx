"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { sampleData } from "@/lib/sampleData";
import { minutesBetween, uid } from "@/lib/utils";
import { PlannerData, SessionLog, StudySession, Subject, Topic, Subtopic, Confidence } from "@/types/planner";

const STORAGE_KEY = "ai-igcse-v3";

type PlannerStore = {
  data: PlannerData;
  setData: React.Dispatch<React.SetStateAction<PlannerData>>;
  save: (next: PlannerData) => void;
  addSubject: () => void;
  updateSubject: (id: string, patch: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string) => void;
  updateTopic: (id: string, patch: Partial<Topic>) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  addSubtopic: (topicId: string) => void;
  updateSubtopic: (id: string, patch: Partial<Subtopic>) => void;
  deleteSubtopic: (topicId: string, subtopicId: string) => void;
  addSession: (draft: Omit<StudySession, "id" | "status" | "loggedMinutes">) => string | null;
  updateSession: (id: string, patch: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  completeSession: (id: string, confidence: Confidence, notes: string) => void;
  restoreTrash: (id: string) => void;
  purgeTrash: (id: string) => void;
  exportJson: () => string;
  importJson: (text: string) => void;
};

const Ctx = createContext<PlannerStore | null>(null);

function hasOverlap(session: StudySession, all: Record<string, StudySession>) {
  return Object.values(all).some((s) => s.id !== session.id && !s.deletedAt && new Date(s.startAt) < new Date(session.endAt) && new Date(session.startAt) < new Date(s.endAt));
}

export function PlannerStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PlannerData>(() => {
    if (typeof window === "undefined") return sampleData;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sampleData;
    try {
      const parsed = JSON.parse(raw) as PlannerData;
      if (parsed.schemaVersion !== 3) return sampleData;
      return parsed;
    } catch {
      return sampleData;
    }
  });

  const save = (next: PlannerData) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const api: PlannerStore = useMemo(() => ({
    data,
    setData,
    save,
    addSubject: () => {
      const id = uid();
      save({ ...data, subjects: { ...data.subjects, [id]: { id, name: "New Subject", color: "#7c3aed", targetStudyHours: 20, topicIds: [] } }, subjectOrder: [...data.subjectOrder, id] });
    },
    updateSubject: (id, patch) => save({ ...data, subjects: { ...data.subjects, [id]: { ...data.subjects[id], ...patch } } }),
    deleteSubject: (id) => {
      const label = data.subjects[id]?.name || "Subject";
      const next = { ...data, subjects: { ...data.subjects } };
      delete next.subjects[id];
      next.subjectOrder = next.subjectOrder.filter((s) => s !== id);
      next.trash = [{ id: uid(), type: "subject", label, deletedAt: new Date().toISOString(), payload: data.subjects[id] }, ...next.trash];
      save(next);
    },
    addTopic: (subjectId) => {
      const id = uid();
      save({ ...data, topics: { ...data.topics, [id]: { id, name: "New Topic", expanded: true, subtopicIds: [] } }, subjects: { ...data.subjects, [subjectId]: { ...data.subjects[subjectId], topicIds: [...data.subjects[subjectId].topicIds, id] } } });
    },
    updateTopic: (id, patch) => save({ ...data, topics: { ...data.topics, [id]: { ...data.topics[id], ...patch } } }),
    deleteTopic: (subjectId, topicId) => {
      const next = { ...data, topics: { ...data.topics }, subjects: { ...data.subjects }, trash: [...data.trash] };
      next.subjects[subjectId] = { ...next.subjects[subjectId], topicIds: next.subjects[subjectId].topicIds.filter((id) => id !== topicId) };
      const topic = next.topics[topicId];
      delete next.topics[topicId];
      next.trash.unshift({ id: uid(), type: "topic", label: topic.name, deletedAt: new Date().toISOString(), payload: topic });
      save(next);
    },
    addSubtopic: (topicId) => {
      const id = uid();
      save({ ...data, subtopics: { ...data.subtopics, [id]: { id, name: "New Sub-topic", targetMinutes: 120, difficulty: 3, notes: "", timeSpentMinutes: 0, lastStudiedAt: null, confidence: 3 } }, topics: { ...data.topics, [topicId]: { ...data.topics[topicId], subtopicIds: [...data.topics[topicId].subtopicIds, id] } } });
    },
    updateSubtopic: (id, patch) => save({ ...data, subtopics: { ...data.subtopics, [id]: { ...data.subtopics[id], ...patch } } }),
    deleteSubtopic: (topicId, subtopicId) => {
      const next = { ...data, subtopics: { ...data.subtopics }, topics: { ...data.topics }, trash: [...data.trash] };
      next.topics[topicId] = { ...next.topics[topicId], subtopicIds: next.topics[topicId].subtopicIds.filter((id) => id !== subtopicId) };
      const sub = next.subtopics[subtopicId];
      delete next.subtopics[subtopicId];
      next.trash.unshift({ id: uid(), type: "subtopic", label: sub.name, deletedAt: new Date().toISOString(), payload: sub });
      save(next);
    },
    addSession: (draft) => {
      const id = uid();
      const session: StudySession = { id, ...draft, status: "planned", loggedMinutes: 0 };
      if (hasOverlap(session, data.sessions)) return null;
      save({ ...data, sessions: { ...data.sessions, [id]: session } });
      return id;
    },
    updateSession: (id, patch) => {
      const session = { ...data.sessions[id], ...patch };
      if (hasOverlap(session, data.sessions)) return;
      save({ ...data, sessions: { ...data.sessions, [id]: session } });
    },
    deleteSession: (id) => {
      const next = { ...data, sessions: { ...data.sessions }, trash: [...data.trash] };
      const item = next.sessions[id];
      delete next.sessions[id];
      next.trash.unshift({ id: uid(), type: "session", label: item.title, deletedAt: new Date().toISOString(), payload: item });
      save(next);
    },
    completeSession: (id, confidence, notes) => {
      const s = data.sessions[id];
      const minutes = minutesBetween(s.startAt, s.endAt);
      const log: SessionLog = { id: uid(), sessionId: id, startedAt: s.startAt, endedAt: s.endAt, durationMinutes: minutes, confidence, notes };
      const sub = data.subtopics[s.subtopicId];
      save({
        ...data,
        sessions: { ...data.sessions, [id]: { ...s, status: "completed", loggedMinutes: minutes, confidenceAfter: confidence, notesAfter: notes } },
        logs: { ...data.logs, [log.id]: log },
        subtopics: { ...data.subtopics, [s.subtopicId]: { ...sub, timeSpentMinutes: sub.timeSpentMinutes + minutes, confidence, notes: notes || sub.notes, lastStudiedAt: new Date().toISOString() } }
      });
    },
    restoreTrash: (trashId) => {
      const item = data.trash.find((x) => x.id === trashId);
      if (!item) return;
      const next = { ...data, trash: data.trash.filter((x) => x.id !== trashId) };
      if (item.type === "subject") {
        const subject = item.payload as Subject;
        next.subjects = { ...next.subjects, [subject.id]: subject };
        next.subjectOrder = [...next.subjectOrder, subject.id];
      }
      if (item.type === "topic") next.topics = { ...next.topics, [(item.payload as Topic).id]: item.payload as Topic };
      if (item.type === "subtopic") next.subtopics = { ...next.subtopics, [(item.payload as Subtopic).id]: item.payload as Subtopic };
      if (item.type === "session") next.sessions = { ...next.sessions, [(item.payload as StudySession).id]: item.payload as StudySession };
      if (item.type === "log") next.logs = { ...next.logs, [(item.payload as SessionLog).id]: item.payload as SessionLog };
      save(next);
    },
    purgeTrash: (id) => save({ ...data, trash: data.trash.filter((x) => x.id !== id) }),
    exportJson: () => JSON.stringify(data, null, 2),
    importJson: (text) => {
      const parsed = JSON.parse(text) as PlannerData;
      if (parsed.schemaVersion !== 3) throw new Error("Unsupported file version");
      save(parsed);
    }
  }), [data]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const usePlannerStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlannerStore must be inside provider");
  return ctx;
};
