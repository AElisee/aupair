import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getConversationUsers } from "@/lib/messages";

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

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const resolved = searchParams.get("resolved");

  const reports = await prisma.report.findMany({
    where: resolved === null ? undefined : { isResolved: resolved === "true" },
    orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
  });

  const userIds = [...new Set(reports.flatMap((r) => [r.reporterId, r.reportedId]))];
  const usersMap = await getConversationUsers(userIds);

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      isResolved: r.isResolved,
      createdAt: r.createdAt.toISOString(),
      reporter: usersMap.get(r.reporterId) ?? null,
      reported: usersMap.get(r.reportedId) ?? null,
    })),
  });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { reportId, action } = (await req.json().catch(() => ({}))) as {
    reportId?: string;
    action?: "resolve" | "reopen";
  };

  if (!reportId || !action) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  await prisma.report.update({
    where: { id: reportId },
    data:
      action === "resolve"
        ? { isResolved: true, resolvedAt: new Date(), resolvedBy: session.user.id as string }
        : { isResolved: false, resolvedAt: null, resolvedBy: null },
  });

  return NextResponse.json({ success: true });
}
