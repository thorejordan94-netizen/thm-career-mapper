import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const roomCount = await prisma.room.count().catch(() => null);
  return NextResponse.json({ ok: true, roomCount });
}

