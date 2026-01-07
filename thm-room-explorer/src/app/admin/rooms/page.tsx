"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RoomRow = {
  id: string;
  slug: string;
  name: string | null;
  difficulty: string | null;
  category: string | null;
  scrapeStatus: string;
  lastScrapedAt: string | null;
};

export default function AdminRoomsPage() {
  const [q, setQ] = useState("");
  const [rooms, setRooms] = useState<RoomRow[]>([]);

  async function load() {
    const res = await fetch(`/api/admin/rooms?q=${encodeURIComponent(q)}&take=80`, { cache: "no-store" });
    const data = (await res.json()) as { rooms: RoomRow[] };
    setRooms(data.rooms);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Rooms</h2>
          <p className="mt-1 text-sm text-zinc-500">Search, open details, and edit relevance.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
            placeholder="Search by slug or name"
            className="h-9 w-64 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            onClick={load}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 hover:bg-zinc-800"
          >
            Search
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-900">
        <table className="w-full border-collapse bg-zinc-950/40 text-left text-sm">
          <thead className="bg-black/30 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last scrape</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-t border-zinc-900">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-200">
                    <Link href={`/admin/rooms/${r.slug}`} className="hover:underline">
                      {r.name ?? r.slug}
                    </Link>
                  </div>
                  <div className="text-xs text-zinc-600">/{r.slug}</div>
                  {r.category ? <div className="text-xs text-zinc-500">{r.category}</div> : null}
                </td>
                <td className="px-4 py-3 text-zinc-300">{r.difficulty ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-300">{r.scrapeStatus}</td>
                <td className="px-4 py-3 text-zinc-500">{r.lastScrapedAt ?? "—"}</td>
              </tr>
            ))}
            {rooms.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={4}>
                  No matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

