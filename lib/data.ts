import { PlannerData } from "@/lib/types";

export const defaultPlannerData: PlannerData = {
  streak: 4,
  subjects: [
    {
      id: "maths",
      name: "Maths",
      color: "var(--accent-1)",
      topics: [
        {
          id: "algebra",
          name: "Algebra",
          subtopics: [
            { id: "quadratics", name: "Quadratics", complete: false, confidence: 3, targetMinutes: 120, minutesStudied: 45 },
            { id: "simultaneous", name: "Simultaneous equations", complete: true, confidence: 4, targetMinutes: 90, minutesStudied: 90 }
          ]
        }
      ]
    },
    {
      id: "biology",
      name: "Biology",
      color: "var(--accent-2)",
      topics: [
        {
          id: "cells",
          name: "Cells and transport",
          subtopics: [
            { id: "osmosis", name: "Osmosis", complete: false, confidence: 2, targetMinutes: 75, minutesStudied: 20 },
            { id: "diffusion", name: "Diffusion", complete: false, confidence: 4, targetMinutes: 60, minutesStudied: 35 }
          ]
        }
      ]
    },
    {
      id: "french",
      name: "French",
      color: "var(--accent-3)",
      topics: [
        {
          id: "speaking",
          name: "Speaking",
          subtopics: [
            { id: "school-topic", name: "School topic", complete: false, confidence: 3, targetMinutes: 80, minutesStudied: 25 },
            { id: "tenses", name: "Key tenses", complete: false, confidence: 2, targetMinutes: 120, minutesStudied: 30 }
          ]
        }
      ]
    }
  ],
  sessions: [
    {
      id: "s1",
      subjectId: "maths",
      topicId: "algebra",
      subtopicId: "quadratics",
      title: "Maths • Quadratics",
      day: "Monday",
      start: "17:00",
      end: "17:45",
      completed: false,
      minutesLogged: 0
    },
    {
      id: "s2",
      subjectId: "biology",
      topicId: "cells",
      subtopicId: "osmosis",
      title: "Biology • Osmosis",
      day: "Monday",
      start: "18:00",
      end: "18:40",
      completed: true,
      minutesLogged: 40
    }
  ]
};
