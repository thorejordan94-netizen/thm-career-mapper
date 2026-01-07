import crypto from "node:crypto";
import { chromium } from "playwright";
import { load } from "cheerio";
import { env } from "@/lib/env";

export type ScrapedRoom = {
  name?: string;
  url: string;
  category?: string;
  description?: string;
  tags: string[];
  tools: string[];
  lessons: string[];
  timeText?: string;
  difficulty?: string;
  rawHtml?: string;
  rawSourceHash: string;
};

function sha256(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function uniqueClean(items: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const t = item.trim();
    if (!t) continue;
    if (seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

export async function scrapeRoom(slug: string): Promise<ScrapedRoom> {
  const url = `https://tryhackme.com/room/${slug}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36 THMExplorer/1.0",
  });

  if (env.SCRAPE_AUTH_COOKIE) {
    // Optional authenticated mode: user supplies a cookie string.
    // No guidance to obtain it.
    await context.addCookies([
      {
        name: env.SCRAPE_AUTH_COOKIE.split("=")[0] ?? "session",
        value: env.SCRAPE_AUTH_COOKIE.split("=").slice(1).join("=") ?? "",
        domain: "tryhackme.com",
        path: "/",
      },
    ]);
  }

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(env.SCRAPE_DELAY_MS + Math.floor(Math.random() * env.SCRAPE_JITTER_MS));

  const html = await page.content();
  await page.close();
  await context.close();
  await browser.close();

  const $ = load(html);

  const title = $("h1").first().text().trim() || $("title").text().trim();
  const description =
    $("meta[name='description']").attr("content")?.trim() ||
    $("[data-testid='room-description']").text().trim() ||
    $(".room-description").text().trim();

  const category =
    $("[data-testid='room-category']").text().trim() ||
    $("a[href*='/hubs/']").first().text().trim();

  // Heuristic extraction: THM changes markup; keep robust fallbacks.
  const tags = uniqueClean([
    ...$("a[href*='/tags/']")
      .map((_, el) => $(el).text())
      .get(),
    ...$("[data-testid='tag']")
      .map((_, el) => $(el).text())
      .get(),
  ]);

  const difficulty =
    $("[data-testid='difficulty']").text().trim() ||
    $(":contains('Difficulty')")
      .filter((_, el) => $(el).text().trim() === "Difficulty")
      .next()
      .text()
      .trim();

  const timeText =
    $("[data-testid='time-to-complete']").text().trim() ||
    $(":contains('Time')")
      .filter((_, el) => $(el).text().trim() === "Time")
      .next()
      .text()
      .trim();

  const tools = uniqueClean(
    $("[data-testid='tools'] li")
      .map((_, el) => $(el).text())
      .get(),
  );

  const lessons = uniqueClean(
    $("[data-testid='lessons'] li")
      .map((_, el) => $(el).text())
      .get(),
  );

  return {
    name: title || undefined,
    url,
    category: category || undefined,
    description: description || undefined,
    tags,
    tools,
    lessons,
    timeText: timeText || undefined,
    difficulty: difficulty || undefined,
    rawHtml: env.SCRAPE_STORE_HTML ? html : undefined,
    rawSourceHash: sha256(html),
  };
}

