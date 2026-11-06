import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;

  const { reportedId, reason, description } = (await req.json().catch(() => ({}))) as {
    reportedId?: string;
    reason?: string;
    description?: string;
  };

  if (!reportedId || !reason?.trim()) {
    return NextResponse.json({ error: "reportedId et reason sont requis" }, { status: 400 });
  }
  if (reportedId === myId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous signaler vous-même" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: reportedId }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: myId,
      reportedId,
      reason: reason.trim(),
      description: description?.trim() || null,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
