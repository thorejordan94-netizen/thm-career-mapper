import type { Room } from "@/generated/prisma";
import { RoomCard } from "@/components/rooms/RoomCard";

export function RoomGrid({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-10 text-center text-sm text-zinc-400">
        No rooms match the current filters.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((r) => (
        <RoomCard key={r.id} room={r} />
      ))}
    </section>
  );
}

