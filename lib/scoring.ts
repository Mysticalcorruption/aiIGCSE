import { PlannerState } from "@/lib/types";

export function getPreparedness(state: PlannerState) {
  const allTopics = state.subjects.flatMap((s) => s.topics);
  const completedTopics = allTopics.filter((t) => t.completed).length;
  const completionScore = allTopics.length ? (completedTopics / allTopics.length) * 50 : 0;

  const totalTarget = state.subjects.reduce((sum, s) => sum + s.targetMinutes, 0);
  const totalStudied = state.subjects.reduce(
    (sum, s) => sum + s.topics.reduce((topicSum, t) => topicSum + t.minutesStudied, 0),
    0
  );
  const timeScore = totalTarget ? Math.min(totalStudied / totalTarget, 1) * 25 : 0;

  const donePlan = state.planItems.filter((p) => p.done).length;
  const consistencyScore = state.planItems.length ? (donePlan / state.planItems.length) * 15 : 0;

  const weakTopics = allTopics.filter((t) => t.confidence < 70);
  const weaknessRecovery = weakTopics.length
    ? (weakTopics.reduce((sum, t) => sum + t.confidence, 0) / (weakTopics.length * 100)) * 10
    : 10;

  const total = Math.round(completionScore + timeScore + consistencyScore + weaknessRecovery);

  return {
    total,
    completionScore: Math.round(completionScore),
    timeScore: Math.round(timeScore),
    consistencyScore: Math.round(consistencyScore),
    weaknessRecovery: Math.round(weaknessRecovery)
  };
}
