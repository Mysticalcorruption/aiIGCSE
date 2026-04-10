export type Topic = {
  id: string;
  name: string;
  completed: boolean;
  confidence: number;
  minutesStudied: number;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  targetMinutes: number;
  topics: Topic[];
};

export type StudySession = {
  id: string;
  subjectId: string;
  topicId?: string;
  durationMinutes: number;
  createdAt: string;
};

export type DayPlanItem = {
  id: string;
  dayKey: string;
  title: string;
  subjectId: string;
  durationMinutes: number;
  done: boolean;
};

export type PlannerState = {
  subjects: Subject[];
  sessions: StudySession[];
  planItems: DayPlanItem[];
};
