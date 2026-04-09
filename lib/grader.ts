import { GradeResult } from "@/lib/types";

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((acc, pattern) => acc + (pattern.test(text) ? 1 : 0), 0);
}

function safeSliceEvidence(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 3).map((item) => item.slice(0, 120));
}

export function heuristicGrade(transcriptFr: string): GradeResult {
  const text = transcriptFr.trim();
  const words = text.split(/\s+/).filter(Boolean).length;

  const opinionSignals = countMatches(text, [/je pense/i, /à mon avis/i, /selon moi/i, /parce que/i, /car/i]);
  const pastSignals = countMatches(text, [/j'ai/i, /c'était/i, /quand j'étais/i, /je suis allé/i]);
  const futureSignals = countMatches(text, [/je vais/i, /je ferai/i, /à l'avenir/i, /plus tard/i]);
  const conditionalSignals = countMatches(text, [/je voudrais/i, /j'aimerais/i, /si j'avais/i, /je pourrais/i]);
  const connectors = countMatches(text, [/mais/i, /ensuite/i, /par exemple/i, /cependant/i, /en plus/i, /donc/i]);

  const timeFrameSignals = Math.min(3, Number(pastSignals > 0) + Number(futureSignals > 0) + Number(conditionalSignals > 0));

  const communication = Math.min(12, Math.max(0, Math.round(words / 10) + opinionSignals + Math.min(2, connectors)));
  const interaction = Math.min(8, Math.max(0, Math.round(words / 22) + Math.min(2, opinionSignals) + Math.min(2, connectors > 0 ? 1 : 0)));
  const accuracy = Math.min(8, Math.max(0, 2 + timeFrameSignals + Math.min(2, connectors)));
  const total = communication + interaction + accuracy;

  const strengths: string[] = [];
  const targets: string[] = [];

  if (words >= 45) strengths.push("You are giving extended answers rather than stopping after one sentence.");
  if (opinionSignals > 0) strengths.push("You are expressing opinions and giving reasons.");
  if (timeFrameSignals > 0) strengths.push("You are attempting more than one time frame.");
  if (connectors > 0) strengths.push("You are using linking language to build flow.");

  if (words < 45) targets.push("Develop each answer with one detail, one reason, and one example.");
  if (opinionSignals === 0) targets.push("Use phrases like 'je pense que' and 'parce que' to justify your ideas.");
  if (timeFrameSignals === 0) targets.push("Add a past, future, or conditional phrase when the question allows it.");
  if (connectors === 0) targets.push("Use linking phrases such as 'mais', 'ensuite', 'donc', or 'par exemple'.");

  return {
    total,
    breakdown: [
      { criterion: "Communication and content", score: communication, max: 12 },
      { criterion: "Interaction and spontaneity", score: interaction, max: 8 },
      { criterion: "Linguistic knowledge and accuracy", score: accuracy, max: 8 }
    ],
    strengths: strengths.length ? strengths.slice(0, 3) : ["You attempted a full response in French."],
    targets: targets.slice(0, 3),
    evidence: safeSliceEvidence(text)
  };
}
