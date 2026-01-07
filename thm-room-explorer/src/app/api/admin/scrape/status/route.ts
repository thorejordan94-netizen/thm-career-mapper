import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    const latest = await prisma.scrapeRun.findFirst({ orderBy: { startedAt: "desc" } });
    return NextResponse.json({ run: latest ?? null });
  }

  const run = await prisma.scrapeRun.findUnique({ where: { id: runId } });
  if (!run) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [queued, running, done, failed] = await Promise.all([
    prisma.scrapeJob.count({ where: { runId, status: { in: ["QUEUED", "RETRY"] } } }),
    prisma.scrapeJob.count({ where: { runId, status: "RUNNING" } }),
    prisma.scrapeJob.count({ where: { runId, status: "DONE" } }),
    prisma.scrapeJob.count({ where: { runId, status: "FAILED" } }),
  ]);

  const failures = await prisma.scrapeJob.findMany({
    where: { runId, status: "FAILED" },
    include: { room: { select: { slug: true } } },
    orderBy: { finishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    run,
    counts: { queued, running, done, failed },
    failures: failures.map((f) => ({ roomId: f.roomId, slug: f.room.slug, lastError: f.lastError })),
  });
}

