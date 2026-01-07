import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug } = await params;
  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      roomTags: { include: { tag: true } },
      relevanceAssessments: true,
    },
  });
  if (!room) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ room });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = (await req.json()) as {
    tagsText?: string[];
    toolsText?: string[];
    lessonsText?: string[];
    relevance?: Array<{ rubricKey: string; score?: number | null; justification?: string | null; generatedBy?: "admin" }>;
  };

  const updated = await prisma.room.update({
    where: { slug },
    data: {
      ...(body.tagsText ? { tagsText: body.tagsText } : {}),
      ...(body.toolsText ? { toolsText: body.toolsText } : {}),
      ...(body.lessonsText ? { lessonsText: body.lessonsText } : {}),
    },
  });

  if (body.relevance?.length) {
    for (const r of body.relevance) {
      await prisma.relevanceAssessment.upsert({
        where: { roomId_rubricKey: { roomId: updated.id, rubricKey: r.rubricKey } },
        update: {
          score: r.score ?? null,
          justification: r.justification ?? null,
          generatedBy: "admin",
        },
        create: {
          roomId: updated.id,
          rubricKey: r.rubricKey,
          score: r.score ?? null,
          justification: r.justification ?? null,
          generatedBy: "admin",
        },
      });
    }
  }

  return NextResponse.json({ room: updated });
}

