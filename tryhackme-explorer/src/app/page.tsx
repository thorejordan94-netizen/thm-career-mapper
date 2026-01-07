import Link from 'next/link';
import { Search, TrendingUp, Target, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  // Fetch KPIs
  const totalRooms = await prisma.room.count();
  const scrapedRooms = await prisma.room.count({
    where: { scrapeStatus: 'OK' },
  });
  const pendingRooms = await prisma.room.count({
    where: { scrapeStatus: 'PENDING' },
  });
  const failedRooms = await prisma.room.count({
    where: { scrapeStatus: 'FAILED' },
  });

  // Fetch recent rooms
  const recentRooms = await prisma.room.findMany({
    where: { scrapeStatus: 'OK' },
    orderBy: { lastScrapedAt: 'desc' },
    take: 6,
    include: {
      tags: {
        include: { tag: true },
        take: 3,
      },
    },
  });

  const kpis = [
    {
      title: 'Total Rooms',
      value: totalRooms.toLocaleString(),
      icon: Target,
      color: 'text-blue-400',
    },
    {
      title: 'Scraped',
      value: scrapedRooms.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      title: 'Pending',
      value: pendingRooms.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-400',
    },
    {
      title: 'Failed',
      value: failedRooms.toLocaleString(),
      icon: Target,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                TryHackMe Room Explorer
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Discover and analyze 960+ CTF rooms
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/rooms"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Search className="inline-block w-4 h-4 mr-2" />
                Browse Rooms
              </Link>
              <Link
                href="/admin"
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{kpi.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {kpi.value}
                  </p>
                </div>
                <kpi.icon className={`w-10 h-10 ${kpi.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Recently Scraped Rooms */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recently Scraped Rooms</h2>
            <Link
              href="/rooms"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="group rounded-lg border border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700 hover:bg-slate-900/80 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
                    {room.name || room.slug}
                  </h3>
                  {room.difficulty && (
                    <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                      {room.difficulty}
                    </span>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {room.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {room.tags.slice(0, 3).map((roomTag) => (
                    <span
                      key={roomTag.id}
                      className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300"
                    >
                      {roomTag.tag.displayName}
                    </span>
                  ))}
                  {room.tags.length > 3 && (
                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400">
                      +{room.tags.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-12 rounded-lg border border-slate-800 bg-slate-900/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Advanced Search
              </h3>
              <p className="text-sm text-slate-400">
                Filter by difficulty, domain, platform, tactics, and tools. Full-text search across all metadata.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Semantic Tags
              </h3>
              <p className="text-sm text-slate-400">
                Automatic tag classification with domain-specific colors and icons following security taxonomies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                Smart Scraper
              </h3>
              <p className="text-sm text-slate-400">
                Automated metadata extraction with Playwright, respecting rate limits and retry logic.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-900/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400">
            Built for educational purposes. Data sourced from TryHackMe.
          </p>
        </div>
      </footer>
    </div>
  );
}
