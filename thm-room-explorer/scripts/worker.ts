import { Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { scrapeRoom } from "@/lib/scraper/thm";
import { persistRoomScrape } from "@/lib/scraper/persist";

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

type JobData = { runId: string; roomId: string; slug: string };

async function main() {
  logger.info(
    { redis: env.REDIS_URL, concurrency: env.SCRAPE_CONCURRENCY },
    "Starting scrape worker",
  );

  const worker = new Worker<JobData>(
    "scrape",
    async (job) => {
      const { runId, roomId, slug } = job.data;
      const start = Date.now();
      await prisma.scrapeJob.updateMany({
        where: { runId, roomId, status: { in: ["QUEUED", "RETRY"] } },
        data: { status: "RUNNING", startedAt: new Date(), attempts: { increment: 1 } },
      });

      try {
        const scrape = await scrapeRoom(slug);
        await persistRoomScrape({
          roomId,
          scrape: {
            name: scrape.name,
            url: scrape.url,
            category: scrape.category,
            description: scrape.description,
            tags: scrape.tags,
            tools: scrape.tools,
            lessons: scrape.lessons,
            timeText: scrape.timeText,
            difficulty: scrape.difficulty,
            rawSourceHash: scrape.rawSourceHash,
          },
        });

        await prisma.scrapeJob.updateMany({
          where: { runId, roomId },
          data: { status: "DONE", finishedAt: new Date(), lastError: null },
        });

        logger.info({ slug, ms: Date.now() - start }, "Scrape ok");
        return { ok: true };
      } catch (err: any) {
        await prisma.room.update({
          where: { id: roomId },
          data: { scrapeStatus: "FAILED", scrapeError: String(err?.message ?? err) },
        });
        await prisma.scrapeJob.updateMany({
          where: { runId, roomId },
          data: { status: "FAILED", finishedAt: new Date(), lastError: String(err?.message ?? err) },
        });
        logger.error({ slug, err }, "Scrape failed");
        throw err;
      }
    },
    { connection, concurrency: env.SCRAPE_CONCURRENCY },
  );

  worker.on("failed", (job, err) => {
    logger.warn({ id: job?.id, slug: job?.data?.slug, err }, "Job failed");
  });

  worker.on("completed", async (job) => {
    const { runId } = job.data;
    const remaining = await prisma.scrapeJob.count({ where: { runId, status: { in: ["QUEUED", "RUNNING", "RETRY"] } } });
    if (remaining === 0) {
      const stats = {
        done: await prisma.scrapeJob.count({ where: { runId, status: "DONE" } }),
        failed: await prisma.scrapeJob.count({ where: { runId, status: "FAILED" } }),
      };
      await prisma.scrapeRun.update({
        where: { id: runId },
        data: { finishedAt: new Date(), status: "FINISHED", stats },
      });
      logger.info({ runId, stats }, "Scrape run finished");
    }
  });
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});

