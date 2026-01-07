"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function SearchBar({
  initial,
}: {
  initial?: { q?: string; difficulty?: string; status?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(initial?.q ?? sp.get("q") ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? sp.get("difficulty") ?? "");
  const [status, setStatus] = useState(initial?.status ?? sp.get("status") ?? "");

  const canClear = useMemo(() => q || difficulty || status, [q, difficulty, status]);

  function apply() {
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (difficulty.trim()) next.set("difficulty", difficulty.trim());
    if (status.trim()) next.set("status", status.trim());
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
        placeholder="Search rooms"
        className="h-9 w-56 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700"
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
      >
        <option value="">Any difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="insane">Insane</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 focus:outline-none"
      >
        <option value="">Any status</option>
        <option value="OK">OK</option>
        <option value="PENDING">Pending</option>
        <option value="FAILED">Failed</option>
      </select>

      <button
        onClick={apply}
        className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 hover:bg-zinc-800"
      >
        Apply
      </button>

      <button
        disabled={!canClear}
        onClick={() => {
          setQ("");
          setDifficulty("");
          setStatus("");
          router.push(pathname);
        }}
        className="h-9 rounded-lg border border-zinc-900 bg-transparent px-3 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
      >
        Clear
      </button>
    </div>
  );
}

