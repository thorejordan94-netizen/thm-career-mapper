"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { rubrics } from "@/lib/relevance/rubrics";

type RoomDetail = {
  id: string;
  slug: string;
  name: string | null;
  tagsText: string[];
  toolsText: string[];
  lessonsText: string[];
  relevanceAssessments: Array<{
    rubricKey: string;
    score: number | null;
    justification: string | null;
    generatedBy: string;
  }>;
};

export default function AdminRoomDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [busy, setBusy] = useState(false);

  const assessments = useMemo(() => {
    const m = new Map(room?.relevanceAssessments.map((a) => [a.rubricKey, a]));
    return rubrics.map((r) => m.get(r.key) ?? { rubricKey: r.key, score: null, justification: null, generatedBy: "auto" });
  }, [room]);

  async function load() {
    const res = await fetch(`/api/admin/rooms/${encodeURIComponent(slug)}`, { cache: "no-store" });
    const data = (await res.json()) as { room: RoomDetail };
    setRoom(data.room);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function save() {
    if (!room) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/rooms/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tagsText: room.tagsText,
          toolsText: room.toolsText,
          lessonsText: room.lessonsText,
          relevance: assessments.map((a) => ({
            rubricKey: a.rubricKey,
            score: a.score,
            justification: a.justification,
            generatedBy: "admin",
          })),
        }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!room) {
    return <div className="text-sm text-zinc-500">Loading…</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{room.name ?? room.slug}</h2>
          <div className="mt-1 text-xs text-zinc-500">/{room.slug}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/rooms"
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm leading-9 text-zinc-200 hover:bg-zinc-900"
          >
            Back
          </Link>
          <button
            disabled={busy}
            onClick={save}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
          >
            Save overrides
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Tags (JSON array)</h3>
          <textarea
            value={JSON.stringify(room.tagsText, null, 2)}
            onChange={(e) => {
              try {
                const next = JSON.parse(e.target.value);
                if (Array.isArray(next)) setRoom({ ...room, tagsText: next.map(String) });
              } catch {
                // ignore parse errors while typing
              }
            }}
            className="mt-3 h-56 w-full rounded-lg border border-zinc-800 bg-black/30 p-3 font-mono text-xs text-zinc-200 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Tools (JSON array)</h3>
          <textarea
            value={JSON.stringify(room.toolsText, null, 2)}
            onChange={(e) => {
              try {
                const next = JSON.parse(e.target.value);
                if (Array.isArray(next)) setRoom({ ...room, toolsText: next.map(String) });
              } catch {
                // ignore
              }
            }}
            className="mt-3 h-56 w-full rounded-lg border border-zinc-800 bg-black/30 p-3 font-mono text-xs text-zinc-200 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Lessons (JSON array)</h3>
          <textarea
            value={JSON.stringify(room.lessonsText, null, 2)}
            onChange={(e) => {
              try {
                const next = JSON.parse(e.target.value);
                if (Array.isArray(next)) setRoom({ ...room, lessonsText: next.map(String) });
              } catch {
                // ignore
              }
            }}
            className="mt-3 h-56 w-full rounded-lg border border-zinc-800 bg-black/30 p-3 font-mono text-xs text-zinc-200 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Relevance overrides</h3>
          <div className="mt-3 space-y-3">
            {assessments.map((a, idx) => (
              <div key={a.rubricKey} className="rounded-lg border border-zinc-900 bg-black/20 p-4">
                <div className="text-sm font-medium text-zinc-200">{a.rubricKey}</div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={a.score ?? ""}
                    onChange={(e) => {
                      const v = e.target.value === "" ? null : Number(e.target.value);
                      const next = assessments.slice();
                      next[idx] = { ...next[idx], score: v };
                      setRoom({ ...room, relevanceAssessments: next as any });
                    }}
                    placeholder="0-100"
                    className="h-9 w-24 rounded-lg border border-zinc-800 bg-black/30 px-3 text-sm text-zinc-200"
                  />
                  <span className="text-xs text-zinc-600 leading-9">generatedBy: {a.generatedBy}</span>
                </div>
                <textarea
                  value={a.justification ?? ""}
                  onChange={(e) => {
                    const next = assessments.slice();
                    next[idx] = { ...next[idx], justification: e.target.value };
                    setRoom({ ...room, relevanceAssessments: next as any });
                  }}
                  placeholder="2-4 sentences; concrete justification"
                  className="mt-3 h-24 w-full rounded-lg border border-zinc-800 bg-black/30 p-3 text-sm text-zinc-200"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

