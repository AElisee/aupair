import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getUserLabel, logAdminActivity } from "@/lib/admin-activity";
import { getConversationUsers } from "@/lib/messages";

/** Liste des signalements (ouverts d'abord, puis du plus récent au plus ancien). */
export async function GET(req: Request) {
  const session = await requireAdminSession("reports.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const resolved = new URL(req.url).searchParams.get("resolved");

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
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      reporter: usersMap.get(r.reporterId) ?? null,
      reported: usersMap.get(r.reportedId) ?? null,
    })),
  });
}

/** Marque un signalement comme traité, ou le rouvre. */
export async function PATCH(req: Request) {
  const session = await requireAdminSession("reports.resolve");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { reportId, action } = (await req.json().catch(() => ({}))) as {
    reportId?: string;
    action?: "resolve" | "reopen";
  };

  if (!reportId || (action !== "resolve" && action !== "reopen")) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { reportedId: true, reason: true } });
  if (!report) {
    return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
  }

  await prisma.report.update({
    where: { id: reportId },
    data:
      action === "resolve"
        ? { isResolved: true, resolvedAt: new Date(), resolvedBy: session.user.id as string }
        : { isResolved: false, resolvedAt: null, resolvedBy: null },
  });
  await logAdminActivity(session, {
    action: action === "resolve" ? "reports.resolve" : "reports.reopen",
    targetType: "REPORT",
    targetId: reportId,
    targetLabel: await getUserLabel(report.reportedId),
    details: { reason: report.reason },
  }, req);

  return NextResponse.json({ success: true });
}
