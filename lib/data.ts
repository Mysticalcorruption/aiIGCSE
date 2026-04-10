import { PlannerState } from "@/lib/types";

function makeTopics(names: string[]) {
  return names.map((name, index) => ({
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    name,
    completed: false,
    confidence: 20,
    minutesStudied: 0
  }));
}

const today = new Date();
function dayKey(offset: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export const defaultState: PlannerState = {
  subjects: [
    {
      id: "maths",
      name: "Maths",
      color: "linear-gradient(135deg, #60a5fa, #2563eb)",
      targetMinutes: 360,
      topics: makeTopics(["Algebra", "Geometry", "Quadratics", "Statistics", "Trigonometry"])
    },
    {
      id: "biology",
      name: "Biology",
      color: "linear-gradient(135deg, #4ade80, #16a34a)",
      targetMinutes: 300,
      topics: makeTopics(["Cells", "Enzymes", "Respiration", "Transport", "Ecology"])
    },
    {
      id: "chemistry",
      name: "Chemistry",
      color: "linear-gradient(135deg, #facc15, #f59e0b)",
      targetMinutes: 300,
      topics: makeTopics(["Bonding", "Acids and Alkalis", "Rates", "Electrolysis", "Organic Chemistry"])
    },
    {
      id: "physics",
      name: "Physics",
      color: "linear-gradient(135deg, #c084fc, #7c3aed)",
      targetMinutes: 300,
      topics: makeTopics(["Forces", "Energy", "Electricity", "Waves", "Space Physics"])
    },
    {
      id: "french",
      name: "French",
      color: "linear-gradient(135deg, #fb7185, #e11d48)",
      targetMinutes: 240,
      topics: makeTopics(["Speaking", "Reading", "Writing", "Listening", "Vocabulary"])
    }
  ],
  sessions: [],
  planItems: [
    { id: "1", dayKey: dayKey(0), title: "Algebra practice", subjectId: "maths", durationMinutes: 45, done: false },
    { id: "2", dayKey: dayKey(0), title: "French vocab review", subjectId: "french", durationMinutes: 30, done: false },
    { id: "3", dayKey: dayKey(1), title: "Biology enzymes", subjectId: "biology", durationMinutes: 40, done: false },
    { id: "4", dayKey: dayKey(2), title: "Physics electricity questions", subjectId: "physics", durationMinutes: 50, done: false },
    { id: "5", dayKey: dayKey(3), title: "Chemistry bonding flashcards", subjectId: "chemistry", durationMinutes: 35, done: false }
  ]
};
