export type ID = string;
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type Confidence = 1 | 2 | 3 | 4 | 5;
export type SessionStatus = "planned" | "in_progress" | "completed";

export type Subtopic = { id: ID; name: string; targetMinutes: number; difficulty: Difficulty; notes: string; timeSpentMinutes: number; lastStudiedAt: string | null; confidence: Confidence; deletedAt?: string };
export type Topic = { id: ID; name: string; expanded: boolean; subtopicIds: ID[]; deletedAt?: string };
export type Subject = { id: ID; name: string; color: string; targetStudyHours: number; topicIds: ID[]; deletedAt?: string };
export type StudySession = { id: ID; subjectId: ID; topicId: ID; subtopicId: ID; title: string; startAt: string; endAt: string; status: SessionStatus; confidenceAfter?: Confidence; notesAfter?: string; loggedMinutes: number; deletedAt?: string };
export type SessionLog = { id: ID; sessionId: ID; startedAt: string; endedAt: string; durationMinutes: number; confidence: Confidence; notes: string; deletedAt?: string };

export type TrashItemType = "subject" | "topic" | "subtopic" | "session" | "log";
export type TrashItem = { id: ID; type: TrashItemType; label: string; deletedAt: string; payload: unknown };

export type PlannerData = { schemaVersion: 3; subjects: Record<ID, Subject>; topics: Record<ID, Topic>; subtopics: Record<ID, Subtopic>; sessions: Record<ID, StudySession>; logs: Record<ID, SessionLog>; subjectOrder: ID[]; trash: TrashItem[]; theme: "light" | "dark" };

export type CalendarView = "day" | "week";
