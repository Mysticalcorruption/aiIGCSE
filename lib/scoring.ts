import { PlannerData, Subject } from "@/lib/types";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function getSubjectPreparedness(subject: Subject): number {
  const subtopics = subject.topics.flatMap((topic) => topic.subtopics);
  if (!subtopics.length) return 0;

  const completed = subtopics.filter((item) => item.complete).length / subtopics.length;
  const confidence = subtopics.reduce((sum, item) => sum + item.confidence, 0) / (subtopics.length * 5);
  const timeRatio = subtopics.reduce((sum, item) => sum + Math.min(item.minutesStudied / Math.max(item.targetMinutes, 1), 1), 0) / subtopics.length;

  return Math.round(clamp((completed * 0.45 + confidence * 0.25 + timeRatio * 0.30) * 100));
}

export function getOverallPreparedness(data: PlannerData): number {
  if (!data.subjects.length) return 0;
  const avgSubject = data.subjects.reduce((sum, subject) => sum + getSubjectPreparedness(subject), 0) / data.subjects.length;
  const completedSessions = data.sessions.length
    ? data.sessions.filter((s) => s.completed).length / data.sessions.length
    : 0;
  const streakBoost = Math.min(data.streak / 7, 1) * 10;

  return Math.round(clamp(avgSubject * 0.8 + completedSessions * 10 + streakBoost));
}
