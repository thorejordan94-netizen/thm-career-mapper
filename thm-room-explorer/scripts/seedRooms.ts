import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { rubrics } from "@/lib/relevance/rubrics";

function parseSlugsFromSpec(markdown: string) {
  const preMetadata = markdown.split("# **Metadata")[0] ?? markdown;
  const lines = preMetadata.split(/\r?\n/);
  const slugs: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*\d+\.\s*`([^`]+)`/);
    if (m?.[1]) slugs.push(m[1]);
  }
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of slugs) {
    if (!seen.has(s)) {
      seen.add(s);
      unique.push(s);
    }
  }
  return unique;
}

async function main() {
  const specPath = path.join(process.cwd(), "..", "uploads", "tryhackme-foundation-prompt (3).md");
  const md = readFileSync(specPath, "utf-8");
  const slugs = parseSlugsFromSpec(md);

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash, role: "admin" },
    create: { email: env.ADMIN_EMAIL.toLowerCase(), passwordHash, role: "admin" },
  });

  const rooms = await prisma.room.findMany({ select: { slug: true } });
  const existing = new Set(rooms.map((r) => r.slug));
  const toCreate = slugs.filter((s) => !existing.has(s));

  if (toCreate.length > 0) {
    await prisma.room.createMany({
      data: toCreate.map((slug) => ({ slug, scrapeStatus: "PENDING" })),
      skipDuplicates: true,
    });
  }

  // Ensure relevance rows exist per rubric.
  const allRooms = await prisma.room.findMany({ select: { id: true } });
  const inserts = [] as Array<{ roomId: string; rubricKey: string }>;
  for (const r of allRooms) {
    for (const rubric of rubrics) {
      inserts.push({ roomId: r.id, rubricKey: rubric.key });
    }
  }
  // Batch insert; duplicates are prevented by unique(roomId,rubricKey) at DB.
  const chunkSize = 2000;
  for (let i = 0; i < inserts.length; i += chunkSize) {
    const chunk = inserts.slice(i, i + chunkSize);
    await prisma.relevanceAssessment.createMany({ data: chunk, skipDuplicates: true });
  }

  console.log(JSON.stringify({ seededRooms: slugs.length, created: toCreate.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

