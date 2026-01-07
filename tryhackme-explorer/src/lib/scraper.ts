import { chromium, Page, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import axios from 'axios';
import crypto from 'crypto';
import { prisma } from './prisma';
import { processTag } from './tag-classifier';
import { ScrapeStatus } from '@prisma/client';

const USER_AGENT =
  process.env.SCRAPER_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const DELAY_MS = parseInt(process.env.SCRAPER_DELAY_MS || '2000', 10);

export interface ScrapedRoomData {
  name?: string;
  category?: string;
  description?: string;
  tags: string[];
  tools: string[];
  lessons: string[];
  timeText?: string;
  difficulty?: string;
}

/**
 * Scrape a single room with Playwright (fallback to axios if needed)
 */
export async function scrapeRoom(
  slug: string,
  browser?: Browser
): Promise<ScrapedRoomData> {
  const url = `https://tryhackme.com/room/${slug}`;

  try {
    // Try Playwright first
    if (browser) {
      return await scrapeWithPlaywright(url, slug, browser);
    }

    // Fallback to axios + cheerio
    return await scrapeWithAxios(url);
  } catch (error) {
    console.error(`Error scraping ${slug}:`, error);
    throw error;
  }
}

/**
 * Scrape using Playwright (handles JavaScript-rendered content)
 */
async function scrapeWithPlaywright(
  url: string,
  slug: string,
  browser: Browser
): Promise<ScrapedRoomData> {
  let page: Page | null = null;

  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    // Navigate with timeout
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for content to load
    await page.waitForSelector('body', { timeout: 10000 });

    // Extract data using page.evaluate
    const data = await page.evaluate(() => {
      const result: ScrapedRoomData = {
        tags: [],
        tools: [],
        lessons: [],
      };

      // Extract title/name
      const titleEl = document.querySelector('h1, .room-title, [class*="title"]');
      if (titleEl) result.name = titleEl.textContent?.trim();

      // Extract description
      const descEl = document.querySelector('.room-desc, [class*="description"], meta[property="og:description"]');
      if (descEl) {
        if (descEl.tagName === 'META') {
          result.description = descEl.getAttribute('content') || undefined;
        } else {
          result.description = descEl.textContent?.trim();
        }
      }

      // Extract difficulty
      const difficultyEl = document.querySelector('[class*="difficulty"], .badge');
      if (difficultyEl) result.difficulty = difficultyEl.textContent?.trim();

      // Extract time estimate
      const timeEl = document.querySelector('[class*="time"], [class*="duration"]');
      if (timeEl) result.timeText = timeEl.textContent?.trim();

      // Extract tags (look for badge/chip elements)
      const tagElements = document.querySelectorAll('[class*="tag"], [class*="badge"], [class*="chip"]');
      tagElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 50) {
          result.tags.push(text);
        }
      });

      // Extract category if available
      const categoryEl = document.querySelector('[class*="category"]');
      if (categoryEl) result.category = categoryEl.textContent?.trim();

      return result;
    });

    await delay(DELAY_MS);
    return data;
  } finally {
    if (page) await page.close();
  }
}

/**
 * Fallback: Scrape using axios + cheerio
 */
async function scrapeWithAxios(url: string): Promise<ScrapedRoomData> {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const data: ScrapedRoomData = {
    tags: [],
    tools: [],
    lessons: [],
  };

  // Extract basic metadata
  data.name = $('h1').first().text().trim() || $('title').text().trim();
  data.description = $('meta[property="og:description"]').attr('content') || $('p').first().text().trim();

  // Extract tags
  $('[class*="tag"], [class*="badge"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 50) data.tags.push(text);
  });

  await delay(DELAY_MS);
  return data;
}

/**
 * Save scraped data to database
 */
export async function saveScrapedRoom(slug: string, data: ScrapedRoomData) {
  // Generate hash of raw data for change detection
  const rawHash = crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');

  // Update room
  const room = await prisma.room.update({
    where: { slug },
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      timeText: data.timeText,
      difficulty: data.difficulty,
      lastScrapedAt: new Date(),
      scrapeStatus: 'OK' as ScrapeStatus,
      scrapeError: null,
      rawSourceHash: rawHash,
    },
  });

  // Process and save tags
  for (const rawTag of data.tags) {
    try {
      const tagData = processTag(rawTag);

      // Upsert tag
      const tag = await prisma.tag.upsert({
        where: { nameCanonical: tagData.nameCanonical },
        update: {},
        create: tagData,
      });

      // Link to room
      await prisma.roomTag.upsert({
        where: {
          roomId_tagId: {
            roomId: room.id,
            tagId: tag.id,
          },
        },
        update: { originalText: rawTag },
        create: {
          roomId: room.id,
          tagId: tag.id,
          originalText: rawTag,
        },
      });
    } catch (tagError) {
      console.error(`Error processing tag "${rawTag}":`, tagError);
    }
  }

  // Process and save tools
  for (const toolName of data.tools) {
    try {
      const canonical = toolName.toLowerCase().replace(/\s+/g, '_');

      const tool = await prisma.tool.upsert({
        where: { name: canonical },
        update: {},
        create: {
          name: canonical,
          displayName: toolName,
        },
      });

      await prisma.roomTool.upsert({
        where: {
          roomId_toolId: {
            roomId: room.id,
            toolId: tool.id,
          },
        },
        update: {},
        create: {
          roomId: room.id,
          toolId: tool.id,
        },
      });
    } catch (toolError) {
      console.error(`Error processing tool "${toolName}":`, toolError);
    }
  }

  return room;
}

/**
 * Update room with error status
 */
export async function markRoomAsFailed(slug: string, error: string) {
  await prisma.room.update({
    where: { slug },
    data: {
      scrapeStatus: 'FAILED' as ScrapeStatus,
      scrapeError: error,
      lastScrapedAt: new Date(),
    },
  });
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Full scrape job: scrape all pending rooms
 */
export async function runFullScrape(runId: string) {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });

    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { scrapeStatus: 'PENDING' },
          { scrapeStatus: 'FAILED' },
        ],
      },
      select: { slug: true },
    });

    let succeeded = 0;
    let failed = 0;

    for (const room of rooms) {
      try {
        console.log(`Scraping ${room.slug}...`);
        const data = await scrapeRoom(room.slug, browser);
        await saveScrapedRoom(room.slug, data);
        succeeded++;
        console.log(`✓ ${room.slug} scraped successfully`);
      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        await markRoomAsFailed(room.slug, errorMsg);
        console.error(`✗ ${room.slug} failed: ${errorMsg}`);
      }

      // Update run stats
      await prisma.scrapeRun.update({
        where: { id: runId },
        data: { succeeded, failed },
      });
    }

    // Mark run as completed
    await prisma.scrapeRun.update({
      where: { id: runId },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        succeeded,
        failed,
      },
    });

    return { succeeded, failed, total: rooms.length };
  } catch (error) {
    console.error('Full scrape failed:', error);

    await prisma.scrapeRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        logs: error instanceof Error ? error.message : String(error),
      },
    });

    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
