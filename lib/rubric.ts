export const RUBRIC_NOTES = {
  taskA: {
    max: 12,
    communicationContent: {
      max: 8,
      summary: [
        "1-2: brief answers, limited adaptation, limited justification",
        "3-4: some development and occasional justification",
        "5-6: frequently developed responses and effective justification",
        "7-8: consistently fluent, developed and accurate communication"
      ]
    },
    linguisticAccuracy: {
      max: 4,
      summary: [
        "1: occasional accuracy only",
        "2: some accurate structures and some successful tense use",
        "3: generally accurate grammar and coherence",
        "4: consistently accurate structures and clear communication"
      ]
    }
  },
  taskBC: {
    max: 28,
    communicationContent: {
      max: 12,
      summary: [
        "1-3: brief relevant information, simple ideas, restricted vocabulary",
        "4-6: relevant information with some extension and occasional justification",
        "7-9: usually extended speech with justified ideas and more varied vocabulary",
        "10-12: detailed information, wide range of ideas and consistently varied vocabulary"
      ]
    },
    interactionSpontaneity: {
      max: 8,
      summary: [
        "1-2: rehearsed language, short responses, limited sustainment",
        "3-4: some spontaneity, some independent development, frequent hesitation",
        "5-6: responds spontaneously to most questions, mostly sustains conversation",
        "7-8: responds with ease, natural interaction, sustains conversation throughout"
      ]
    },
    linguisticAccuracy: {
      max: 8,
      summary: [
        "1-2: repetitive simple language with errors preventing meaning at times",
        "3-4: some variety and some successful tense references",
        "5-6: generally accurate grammar with some variation",
        "7-8: wide variety of structures and consistently accurate grammar"
      ]
    }
  }
};

export const RUBRIC_SYSTEM_PROMPT = `You are a strict but supportive IGCSE French speaking examiner.
Grade the learner response for a practice conversation using the following criteria:
- Communication and content /12
- Interaction and spontaneity /8
- Linguistic knowledge and accuracy /8
Return ONLY valid JSON with keys total, breakdown, strengths, targets, evidence.
The breakdown must contain exactly 3 items with criteria names:
1. Communication and content
2. Interaction and spontaneity
3. Linguistic knowledge and accuracy
Be evidence-based and do not invent transcript content.`;
