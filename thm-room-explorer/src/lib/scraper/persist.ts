import type { Room, TagType } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { canonicalizeTag } from "@/lib/tagging/canonicalize";
import { inferTagType } from "@/lib/tagging/typing";
import { autoScore } from "@/lib/relevance/autoScore";
import { rubrics } from "@/lib/relevance/rubrics";

export async function persistRoomScrape({
  roomId,
  scrape,
}: {
  roomId: string;
  scrape: {
    name?: string;
    url?: string;
    category?: string;
    description?: string;
    tags: string[];
    tools: string[];
    lessons: string[];
    timeText?: string;
    difficulty?: string;
    rawSourceHash?: string;
  };
}) {
  const tagInputs = scrape.tags.map((raw) => {
    const canonical = canonicalizeTag(raw);
    const inferred = inferTagType(raw);
    return {
      raw,
      canonical,
      type: inferred.type as TagType,
      primaryCluster: inferred.primaryCluster,
      confidence: inferred.confidence,
    };
  });

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      name: scrape.name,
      url: scrape.url,
      category: scrape.category,
      description: scrape.description,
      timeText: scrape.timeText,
      difficulty: scrape.difficulty,
      tagsText: scrape.tags,
      toolsText: scrape.tools,
      lessonsText: scrape.lessons,
      rawSourceHash: scrape.rawSourceHash,
      lastScrapedAt: new Date(),
      scrapeStatus: "OK",
      scrapeError: null,
    },
  });

  for (const t of tagInputs) {
    await prisma.tag.upsert({
      where: { nameCanonical: t.canonical },
      update: {
        displayName: t.raw,
        type: t.type,
        primaryCluster: t.primaryCluster,
        confidence: t.confidence,
      },
      create: {
        nameCanonical: t.canonical,
        displayName: t.raw,
        type: t.type,
        primaryCluster: t.primaryCluster,
        confidence: t.confidence,
      },
    });
  }

  const tags = await prisma.tag.findMany({
    where: { nameCanonical: { in: tagInputs.map((t) => t.canonical) } },
  });
  const tagByCanonical = new Map(tags.map((t) => [t.nameCanonical, t]));

  await prisma.roomTag.deleteMany({ where: { roomId } });
  await prisma.roomTag.createMany({
    data: tagInputs
      .map((t) => {
        const tag = tagByCanonical.get(t.canonical);
        if (!tag) return null;
        return { roomId, tagId: tag.id, originalText: t.raw };
      })
      .filter(Boolean) as Array<{ roomId: string; tagId: string; originalText: string }>,
    skipDuplicates: true,
  });

  const relevance = autoScore({
    description: updatedRoom.description,
    tools: updatedRoom.toolsText,
    tags: tagInputs.map((t) => ({ canonical: t.canonical, type: t.type })),
  });

  // Upsert auto relevance for each rubric unless admin changed it.
  for (const rubric of rubrics) {
    const existing = await prisma.relevanceAssessment.findUnique({
      where: { roomId_rubricKey: { roomId, rubricKey: rubric.key } },
    });
    if (existing && existing.generatedBy === "admin") continue;
    await prisma.relevanceAssessment.upsert({
      where: { roomId_rubricKey: { roomId, rubricKey: rubric.key } },
      update: { score: relevance.score, justification: relevance.justification, generatedBy: "auto" },
      create: {
        roomId,
        rubricKey: rubric.key,
        score: relevance.score,
        justification: relevance.justification,
        generatedBy: "auto",
      },
    });
  }

  return updatedRoom as Room;
}
