import { prisma } from "@/lib/db";

function KpiCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-100">{value}</div>
      {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
    </div>
  );
}

export async function DashboardKpis() {
  const [total, ok, failed, pending, avgRelevance] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { scrapeStatus: "OK" } }),
    prisma.room.count({ where: { scrapeStatus: "FAILED" } }),
    prisma.room.count({ where: { scrapeStatus: "PENDING" } }),
    prisma.relevanceAssessment
      .aggregate({ _avg: { score: true } })
      .then((r) => r._avg.score ?? null),
  ]);

  const avgText = avgRelevance === null ? "—" : `${Math.round(avgRelevance)}`;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard title="Total Rooms" value={`${total}`} sub="Seeded slugs" />
      <KpiCard title="Scraped" value={`${ok}`} sub="OK" />
      <KpiCard title="Pending" value={`${pending}`} sub="Not scraped yet" />
      <KpiCard title="Failures" value={`${failed}`} sub="Retry from Admin" />
      <KpiCard title="Avg Relevance" value={avgText} sub="0–100" />
    </section>
  );
}

