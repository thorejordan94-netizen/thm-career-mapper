import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1).default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).default("adminadmin"),
  SCRAPE_CONCURRENCY: z.coerce.number().int().min(1).max(5).default(2),
  SCRAPE_DELAY_MS: z.coerce.number().int().min(0).max(60000).default(800),
  SCRAPE_JITTER_MS: z.coerce.number().int().min(0).max(60000).default(500),
  SCRAPE_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(2),
  SCRAPE_STORE_HTML: z.coerce.boolean().default(false),
  SCRAPE_AUTH_COOKIE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

