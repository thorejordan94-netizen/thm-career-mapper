import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/db";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  if (/[\n\r,\"]/g.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

async function main() {
  const rooms = await prisma.room.findMany({
    include: { relevanceAssessments: true },
    orderBy: { slug: "asc" },
  });

  const rubricKeys = Array.from(
    new Set(rooms.flatMap((r) => r.relevanceAssessments.map((a) => a.rubricKey))),
  ).sort();

  const header = [
    "slug",
    "name",
    "url",
    "category",
    "description",
    "timeText",
    "difficulty",
    "tagsText",
    "toolsText",
    "lessonsText",
    "scrapeStatus",
    "lastScrapedAt",
    ...rubricKeys.flatMap((k) => [`${k}_score`, `${k}_justification`, `${k}_generatedBy`]),
  ];

  const lines = [header.map(csvEscape).join(",")];

  for (const r of rooms) {
    const byKey = new Map(r.relevanceAssessments.map((a) => [a.rubricKey, a]));
    const row = [
      r.slug,
      r.name ?? "",
      r.url ?? "",
      r.category ?? "",
      r.description ?? "",
      r.timeText ?? "",
      r.difficulty ?? "",
      JSON.stringify(r.tagsText ?? []),
      JSON.stringify(r.toolsText ?? []),
      JSON.stringify(r.lessonsText ?? []),
      r.scrapeStatus,
      r.lastScrapedAt?.toISOString() ?? "",
    ];
    for (const k of rubricKeys) {
      const a = byKey.get(k);
      row.push(a?.score ?? "");
      row.push(a?.justification ?? "");
      row.push(a?.generatedBy ?? "");
    }
    lines.push(row.map(csvEscape).join(","));
  }

  writeFileSync("export.rooms.csv", lines.join("\n"));
  console.log(`Wrote export.rooms.csv (${rooms.length} rooms)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

