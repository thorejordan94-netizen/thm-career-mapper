import Link from "next/link";
import type { Room } from "@/generated/prisma";
import { DomainBadge } from "@/components/badges/DomainBadge";
import { SecondaryChip } from "@/components/badges/SecondaryChip";
import { ToolChip } from "@/components/badges/ToolChip";
import { DifficultyChip } from "@/components/badges/DifficultyChip";
import type { DomainKey } from "@/lib/tagging/domainPalette";

function pickDomain(room: Room): DomainKey {
  const text = `${room.category ?? ""} ${room.slug} ${(room.tagsText ?? []).join(" ")}`.toLowerCase();
  if (text.includes("active_directory") || text.includes("kerberos")) return "active_directory";
  if (text.includes("dfir") || text.includes("forensics") || text.includes("pcap")) return "dfir";
  if (text.includes("web") || text.includes("xss") || text.includes("sql")) return "web_exploitation";
  if (text.includes("cloud") || text.includes("aws") || text.includes("azure")) return "cloud_exploitation";
  if (text.includes("malware") || text.includes("reverse")) return "malware_re";
  if (text.includes("binary") || text.includes("pwn") || text.includes("buffer")) return "binary_exploitation";
  if (text.includes("osint") || text.includes("phish")) return "osint";
  return "ctf";
}

export function RoomCard({ room }: { room: Room }) {
  const domain = pickDomain(room);
  const platform = room.tagsText.find((t) => ["windows", "linux", "aws", "kubernetes"].includes(t.toLowerCase()));
  const topTool = room.toolsText?.[0];

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group rounded-xl border border-zinc-900 bg-zinc-950/50 p-4 transition hover:border-zinc-700 hover:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-zinc-100">
            {room.name ?? room.slug}
          </div>
          <div className="mt-1 text-xs text-zinc-500">/{room.slug}</div>
        </div>
        <div className="text-xs text-zinc-500">{room.scrapeStatus}</div>
      </div>

      <div className="mt-3 line-clamp-3 text-sm text-zinc-400">
        {room.description ?? "No description captured yet."}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DomainBadge domain={domain} />
        {platform ? <SecondaryChip domain={domain} label={platform} /> : null}
        {topTool ? <ToolChip label={topTool} /> : null}
        {room.difficulty ? <DifficultyChip difficulty={room.difficulty} /> : null}
      </div>
    </Link>
  );
}

