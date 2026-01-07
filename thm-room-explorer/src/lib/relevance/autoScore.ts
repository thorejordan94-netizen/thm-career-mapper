import type { TagType } from "@/generated/prisma";

const domainWeight = 0.42;
const tacticWeight = 0.2;
const toolWeight = 0.16;
const techniqueWeight = 0.12;
const platformWeight = 0.07;
const artifactWeight = 0.03;

type Inputs = {
  description?: string | null;
  tags?: Array<{ canonical: string; type: TagType }>;
  tools?: string[];
  rubricHints?: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function autoScore(inputs: Inputs) {
  const haystack = [inputs.description ?? "", ...(inputs.tools ?? []), ...(inputs.tags ?? []).map((t) => t.canonical)]
    .join(" ")
    .toLowerCase();

  const hintHits = (inputs.rubricHints ?? []).filter((h) => h && haystack.includes(h.toLowerCase()));

  let score = 25;
  const tags = inputs.tags ?? [];

  const byType = new Map<TagType, number>();
  for (const t of tags) byType.set(t.type, (byType.get(t.type) ?? 0) + 1);

  score += (byType.get("Domain") ?? 0) * 25 * domainWeight;
  score += (byType.get("Tactic") ?? 0) * 25 * tacticWeight;
  score += (byType.get("Tool") ?? 0) * 25 * toolWeight;
  score += (byType.get("Technique") ?? 0) * 15 * techniqueWeight;
  score += (byType.get("Platform") ?? 0) * 10 * platformWeight;
  score += (byType.get("Artifact") ?? 0) * 10 * artifactWeight;
  score += hintHits.length * 5;

  const finalScore = Math.round(clamp(score, 0, 100));

  const summary = [
    byType.get("Domain") ? "domain focus" : null,
    byType.get("Tactic") ? "clear attacker phase" : null,
    byType.get("Tool") ? "tool-driven practice" : null,
    hintHits.length ? `matches ${hintHits.length} rubric hints` : null,
  ].filter(Boolean);

  const justification =
    summary.length > 0
      ? `Auto-score based on metadata: ${summary.join(", ")}. Adjust in Admin if needed.`
      : "Auto-score set conservatively due to limited metadata. Adjust in Admin if needed.";

  return { score: finalScore, justification };
}

