import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DomainBadge } from "@/components/badges/DomainBadge";
import { SecondaryChip } from "@/components/badges/SecondaryChip";
import { ToolChip } from "@/components/badges/ToolChip";
import { ArtifactChip } from "@/components/badges/ArtifactChip";
import { DifficultyChip } from "@/components/badges/DifficultyChip";
import type { DomainKey } from "@/lib/tagging/domainPalette";
import { rubrics } from "@/lib/relevance/rubrics";

function pickDomain(room: { category?: string | null; slug: string; tagsText: string[] }): DomainKey {
  const text = `${room.category ?? ""} ${room.slug} ${room.tagsText.join(" ")}`.toLowerCase();
  if (text.includes("active_directory") || text.includes("kerberos")) return "active_directory";
  if (text.includes("dfir") || text.includes("forensics") || text.includes("pcap")) return "dfir";
  if (text.includes("web") || text.includes("xss") || text.includes("sql")) return "web_exploitation";
  if (text.includes("cloud") || text.includes("aws") || text.includes("azure")) return "cloud_exploitation";
  if (text.includes("malware") || text.includes("reverse")) return "malware_re";
  if (text.includes("binary") || text.includes("pwn") || text.includes("buffer")) return "binary_exploitation";
  if (text.includes("osint") || text.includes("phish")) return "osint";
  return "ctf";
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await prisma.room.findUnique({
    where: { slug },
    include: { relevanceAssessments: true, roomTags: { include: { tag: true } } },
  });

  if (!room) return notFound();
  const domain = pickDomain({ category: room.category, slug: room.slug, tagsText: room.tagsText });

  const assessmentsByKey = new Map(room.relevanceAssessments.map((a) => [a.rubricKey, a]));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500">Room</div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">{room.name ?? room.slug}</h1>
          <div className="mt-1 text-sm text-zinc-500">/{room.slug}</div>
        </div>
        <Link
          href="/rooms"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Back to grid
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <DomainBadge domain={domain} />
          {room.difficulty ? <DifficultyChip difficulty={room.difficulty} /> : null}
          {room.timeText ? <SecondaryChip domain={domain} label={room.timeText} /> : null}
          {room.category ? <SecondaryChip domain={domain} label={room.category} /> : null}
        </div>

        <div className="mt-4 text-sm text-zinc-300">{room.description ?? "No description captured yet."}</div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-900 bg-black/20 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">URL</dt>
            <dd className="mt-2 break-words text-sm text-zinc-200">
              {room.url ? (
                <a href={room.url} className="text-sky-300 hover:underline" target="_blank" rel="noreferrer">
                  {room.url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="rounded-lg border border-zinc-900 bg-black/20 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Scrape</dt>
            <dd className="mt-2 text-sm text-zinc-200">
              <div>Status: {room.scrapeStatus}</div>
              <div className="text-xs text-zinc-500">Last: {room.lastScrapedAt?.toISOString() ?? "—"}</div>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(room.tagsText ?? []).slice(0, 24).map((t) => (
              <SecondaryChip key={t} domain={domain} label={t} />
            ))}
            {room.tagsText.length === 0 ? <div className="text-sm text-zinc-500">—</div> : null}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(room.toolsText ?? []).slice(0, 24).map((t) => (
              <ToolChip key={t} label={t} />
            ))}
            {room.toolsText.length === 0 ? <div className="text-sm text-zinc-500">—</div> : null}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Lessons</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(room.lessonsText ?? []).slice(0, 24).map((t) => (
              <ArtifactChip key={t} label={t} />
            ))}
            {room.lessonsText.length === 0 ? <div className="text-sm text-zinc-500">—</div> : null}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Relevance</h2>

          <div className="mt-3 space-y-3">
            {rubrics.map((r) => {
              const a = assessmentsByKey.get(r.key);
              return (
                <div key={r.key} className="rounded-lg border border-zinc-900 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-zinc-200">{r.key}</div>
                    <div className="text-xs text-zinc-500">{a?.generatedBy ?? "—"}</div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-100">Score: {a?.score ?? "—"}</div>
                  <div className="mt-2 text-sm text-zinc-400">{a?.justification ?? "No justification yet."}</div>
                  <div className="mt-2 text-xs">
                    <a href={r.url} className="text-sky-300 hover:underline" target="_blank" rel="noreferrer">
                      Rubric source
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

