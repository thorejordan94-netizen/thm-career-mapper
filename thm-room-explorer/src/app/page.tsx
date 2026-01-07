import Link from "next/link";
import { prisma } from "@/lib/db";
import { RoomGrid } from "@/components/rooms/RoomGrid";
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { SearchBar } from "@/components/rooms/SearchBar";

export default async function Home({
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
      ...(status ? { scrapeStatus: status as any } : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 48,
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-100">
            Room Explorer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Discover rooms, inspect metadata, and track scrape progress.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/rooms"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Browse
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Admin
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <DashboardKpis />
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Discovered Rooms
        </h2>
        <SearchBar initial={{ q, difficulty, status }} />
      </div>

      <div className="mt-4">
        <RoomGrid rooms={rooms} />
      </div>
    </main>
  );
}

