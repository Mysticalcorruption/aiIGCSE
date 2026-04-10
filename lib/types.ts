export type StudySession = {
  id: string;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  title: string;
  day: string;
  start: string;
  end: string;
  completed: boolean;
  minutesLogged: number;
};

export type Subtopic = {
  id: string;
  name: string;
  complete: boolean;
  confidence: number;
  targetMinutes: number;
  minutesStudied: number;
};

export type Topic = {
  id: string;
  name: string;
  subtopics: Subtopic[];
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
};

export type PlannerData = {
  subjects: Subject[];
  sessions: StudySession[];
  streak: number;
};
