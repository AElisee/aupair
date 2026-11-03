import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { ADMIN_LOG_PAGE_SIZE, isAdminLogModule, type AdminLogDTO } from "@/lib/admin-activity-shared";
import type { Prisma } from "@/generated/prisma/client";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * GET — journal d'activité paginé.
 * Filtres : `page`, `module`, `adminId`, `q` (cible, nom ou email de l'admin), `from` / `to` (YYYY-MM-DD, UTC, inclus).
 */
export async function GET(req: Request) {
  const session = await requireAdminSession("logs.view");
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const params = new URL(req.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const moduleKey = params.get("module");
  const adminId = params.get("adminId");
  const q = params.get("q")?.trim();
  const from = params.get("from");
  const to = params.get("to");

  const createdAt: Prisma.DateTimeFilter = {};
  if (from && DATE_RE.test(from)) createdAt.gte = new Date(`${from}T00:00:00.000Z`);
  if (to && DATE_RE.test(to)) createdAt.lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + DAY_MS);

  const where: Prisma.AdminActivityLogWhereInput = {
    ...(isAdminLogModule(moduleKey) && { module: moduleKey }),
    ...(adminId && { adminId }),
    ...(Object.keys(createdAt).length > 0 && { createdAt }),
    ...(q && {
      OR: [
        { targetLabel: { contains: q, mode: "insensitive" } },
        { adminName: { contains: q, mode: "insensitive" } },
        { adminEmail: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const now = Date.now();
  const startOfToday = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const sevenDaysAgo = new Date(now - 7 * DAY_MS);

  const [rows, total, today, last7d, activeAdmins, admins] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_LOG_PAGE_SIZE,
      take: ADMIN_LOG_PAGE_SIZE,
    }),
    prisma.adminActivityLog.count({ where }),
    prisma.adminActivityLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.adminActivityLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.adminActivityLog.groupBy({ by: ["adminId"], where: { createdAt: { gte: sevenDaysAgo }, adminId: { not: null } } }),
    // Auteurs présents dans le journal (filtre « administrateur »), y compris ceux supprimés depuis
    prisma.adminActivityLog.findMany({
      where: { adminId: { not: null } },
      distinct: ["adminId"],
      orderBy: { adminId: "asc" },
      select: { adminId: true, adminName: true, adminEmail: true },
    }),
  ]);

  const items: AdminLogDTO[] = rows.map((r) => ({
    id: r.id,
    adminId: r.adminId,
    adminName: r.adminName,
    adminEmail: r.adminEmail,
    action: r.action,
    module: r.module,
    targetType: r.targetType,
    targetId: r.targetId,
    targetLabel: r.targetLabel,
    details: (r.details as Record<string, unknown> | null) ?? null,
    ip: r.ip,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: ADMIN_LOG_PAGE_SIZE,
    stats: { today, last7d, activeAdmins7d: activeAdmins.length },
    admins: admins.map((a) => ({ id: a.adminId as string, name: a.adminName || a.adminEmail || "—" })),
  });
}
