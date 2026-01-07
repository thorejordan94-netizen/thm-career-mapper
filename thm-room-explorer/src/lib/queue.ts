import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue("scrape", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: env.SCRAPE_MAX_RETRIES + 1,
    backoff: { type: "exponential", delay: 1_500 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 2000 },
  },
});

