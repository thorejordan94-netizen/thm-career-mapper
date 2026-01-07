import { prisma } from "@/lib/db";
import { RoomGrid } from "@/components/rooms/RoomGrid";
import { SearchBar } from "@/components/rooms/SearchBar";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; difficulty?: string; status?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const difficulty = (sp.difficulty ?? "").trim();
  const status = (sp.status ?? "").trim();

  const rooms = await prisma.room.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { slug: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(difficulty ? { difficulty: { equals: difficulty, mode: "insensitive" } } : {}),
      ...(status && ["OK", "PENDING", "FAILED"].includes(status)
        ? { scrapeStatus: status as "OK" | "PENDING" | "FAILED" }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 120,
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-100">Rooms</h1>
        <SearchBar initial={{ q, difficulty, status }} />
      </div>
      <div className="mt-6">
        <RoomGrid rooms={rooms} />
      </div>
    </main>
  );
}
