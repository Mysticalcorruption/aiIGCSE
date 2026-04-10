import { PlannerData } from "@/types/planner";

export const sampleData: PlannerData = {
  schemaVersion: 3,
  theme: "light",
  subjectOrder: ["s_math", "s_bio"],
  subjects: {
    s_math: { id: "s_math", name: "Mathematics", color: "#2563eb", targetStudyHours: 30, topicIds: ["t_alg"] },
    s_bio: { id: "s_bio", name: "Biology", color: "#16a34a", targetStudyHours: 22, topicIds: ["t_cells"] }
  },
  topics: {
    t_alg: { id: "t_alg", name: "Algebra", expanded: true, subtopicIds: ["st_quad", "st_ineq"] },
    t_cells: { id: "t_cells", name: "Cells", expanded: true, subtopicIds: ["st_osmosis"] }
  },
  subtopics: {
    st_quad: { id: "st_quad", name: "Quadratics", targetMinutes: 300, difficulty: 4, notes: "Practice factorisation + graph roots", timeSpentMinutes: 120, lastStudiedAt: new Date().toISOString(), confidence: 3 },
    st_ineq: { id: "st_ineq", name: "Inequalities", targetMinutes: 180, difficulty: 3, notes: "Number line interpretation", timeSpentMinutes: 60, lastStudiedAt: new Date(Date.now() - 86400000 * 3).toISOString(), confidence: 2 },
    st_osmosis: { id: "st_osmosis", name: "Osmosis", targetMinutes: 200, difficulty: 2, notes: "Core practical setup", timeSpentMinutes: 95, lastStudiedAt: new Date(Date.now() - 86400000 * 2).toISOString(), confidence: 4 }
  },
  sessions: {},
  logs: {},
  trash: []
};
