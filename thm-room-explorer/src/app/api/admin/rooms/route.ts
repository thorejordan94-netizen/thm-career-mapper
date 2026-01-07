import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const take = Math.min(200, Math.max(10, Number(searchParams.get("take") ?? 50)));

  const rooms = await prisma.room.findMany({
    where: q
      ? {
          OR: [
            { slug: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      slug: true,
      name: true,
      difficulty: true,
      category: true,
      scrapeStatus: true,
      lastScrapedAt: true,
    },
  });

  return NextResponse.json({ rooms });
}

