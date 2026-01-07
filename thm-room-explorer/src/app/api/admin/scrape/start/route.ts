import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scrapeQueue } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { mode?: "full" | "incremental" };
  const mode = body.mode ?? "incremental";

  const run = await prisma.scrapeRun.create({ data: { mode, status: "RUNNING" } });

  const now = new Date();
  const rooms = await prisma.room.findMany({
    where:
      mode === "full"
        ? {}
        : {
            OR: [
              { lastScrapedAt: null },
              { scrapeStatus: "FAILED" },
              { lastScrapedAt: { lt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7) } },
            ],
          },
    select: { id: true, slug: true },
  });

  await prisma.scrapeJob.createMany({
    data: rooms.map((r) => ({ runId: run.id, roomId: r.id, status: "QUEUED" })),
  });

  const jobs = rooms.map((r) => ({
    name: r.slug,
    data: { runId: run.id, roomId: r.id, slug: r.slug },
  }));
  await scrapeQueue.addBulk(jobs);

  return NextResponse.json({ runId: run.id, queued: rooms.length, mode });
}

