import { PlannerData, Subject, Subtopic } from "@/types/planner";

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export function subtopicPreparedness(subtopic: Subtopic, now = new Date()): number {
  const target = Math.max(subtopic.targetMinutes, 1);
  const base = 1 - Math.exp(-subtopic.timeSpentMinutes / target);
  const confidenceMultiplier = 0.7 + (subtopic.confidence / 5) * 0.4;
  const daysSince = subtopic.lastStudiedAt ? Math.max(0, (now.getTime() - new Date(subtopic.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24)) : 120;
  const decay = Math.exp(-daysSince / 21);
  return clamp(base * confidenceMultiplier * decay);
}

export function subjectPreparedness(subject: Subject, data: PlannerData): number {
  const items = subject.topicIds.flatMap((topicId) => data.topics[topicId]?.subtopicIds || []).map((id) => data.subtopics[id]).filter(Boolean);
  if (!items.length) return 0;
  const weighted = items.reduce((sum, s) => sum + subtopicPreparedness(s) * Math.max(1, s.targetMinutes / 60), 0);
  const weight = items.reduce((sum, s) => sum + Math.max(1, s.targetMinutes / 60), 0);
  return Math.round((weighted / weight) * 100);
}

export function overallPreparedness(data: PlannerData): number {
  const subjects = data.subjectOrder.map((id) => data.subjects[id]).filter(Boolean);
  if (!subjects.length) return 0;
  const weighted = subjects.reduce((sum, subject) => sum + subjectPreparedness(subject, data) * Math.max(1, subject.targetStudyHours), 0);
  const weight = subjects.reduce((sum, subject) => sum + Math.max(1, subject.targetStudyHours), 0);
  return Math.round(weighted / weight);
}
