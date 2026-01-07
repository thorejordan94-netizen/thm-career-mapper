"use client";

import { useEffect, useMemo, useState } from "react";

type StatusResponse = {
  run?: {
    id: string;
    mode: string;
    startedAt: string;
    finishedAt: string | null;
    status: string;
  } | null;
  counts?: { queued: number; running: number; done: number; failed: number };
  failures?: Array<{ slug: string; lastError: string | null }>;
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

export default function AdminScraperPage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse>({});
  const [busy, setBusy] = useState(false);

  async function refresh(nextRunId?: string | null) {
    const id = nextRunId ?? runId;
    const url = id ? `/api/admin/scrape/status?runId=${encodeURIComponent(id)}` : "/api/admin/scrape/status";
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as StatusResponse;
    setStatus(data);
    const latest = data.run?.id ?? null;
    if (!runId && latest) setRunId(latest);
  }

  async function start(mode: "full" | "incremental") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/scrape/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await res.json()) as { runId: string };
      setRunId(data.runId);
      await refresh(data.runId);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(() => refresh(), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const counts = status.counts;
  const progress = useMemo(() => {
    if (!counts) return 0;
    const total = counts.queued + counts.running + counts.done + counts.failed;
    if (total === 0) return 0;
    return Math.round(((counts.done + counts.failed) / total) * 100);
  }, [counts]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Scraper</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Start a run, monitor queue progress, and review failures.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => start("incremental")}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
          >
            Run incremental
          </button>
          <button
            disabled={busy}
            onClick={() => start("full")}
            className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-50"
          >
            Run full
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Progress" value={`${progress}%`} />
        <Stat label="Queued" value={counts?.queued ?? "—"} />
        <Stat label="Running" value={counts?.running ?? "—"} />
        <Stat label="Done" value={counts?.done ?? "—"} />
        <Stat label="Failed" value={counts?.failed ?? "—"} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Run</h3>
          <div className="mt-3 text-sm text-zinc-400">
            <div>Run ID: {status.run?.id ?? "—"}</div>
            <div>Mode: {status.run?.mode ?? "—"}</div>
            <div>Status: {status.run?.status ?? "—"}</div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Failures (latest 50)</h3>
          <div className="mt-3 space-y-2">
            {(status.failures ?? []).length === 0 ? (
              <div className="text-sm text-zinc-500">No failures in this run.</div>
            ) : (
              (status.failures ?? []).map((f) => (
                <div key={f.slug} className="rounded-lg border border-zinc-900 bg-black/20 p-3">
                  <div className="text-sm font-medium text-zinc-200">{f.slug}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{f.lastError ?? "—"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

