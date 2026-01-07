import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/db";

async function main() {
  const rooms = await prisma.room.findMany({
    include: { roomTags: { include: { tag: true } }, relevanceAssessments: true },
    orderBy: { slug: "asc" },
  });
  writeFileSync("export.rooms.json", JSON.stringify(rooms, null, 2));
  console.log(`Wrote export.rooms.json (${rooms.length} rooms)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

