export type TopicKey =
  | "home-abroad"
  | "education-employment"
  | "personal-life"
  | "world-around-us"
  | "social-fitness-health";

export type TenseBucket = "present" | "past" | "future" | "conditional";

export type TaskType = "task-a" | "task-bc";

export type QuestionItem = {
  id: string;
  topic: TopicKey;
  title: string;
  subtopic: string;
  tense: TenseBucket;
  promptFr: string;
};

export type GradeCriterion = {
  criterion: string;
  score: number;
  max: number;
};

export type GradeResult = {
  total: number;
  breakdown: GradeCriterion[];
  strengths: string[];
  targets: string[];
  evidence: string[];
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  text: string;
  source?: "typed" | "voice";
  createdAt: number;
};

export type TurnMode = "manual" | "server_vad" | "semantic_vad";
