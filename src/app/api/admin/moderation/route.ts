import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserLabel, logAdminActivity } from "@/lib/admin-activity";
import { requireAdminSession, restoreProfile, setProfileStatus } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { calculateAge } from "@/lib/utils";
import { sendModerationDecisionEmail } from "@/lib/moderation-emails";
import { REFUSED_PROFILE_WHERE } from "@/lib/profile-status";
import { cleanStatusReason, isValidStatusReason, STATUS_REASON_REQUIRED_ERROR } from "@/lib/status-reason";

function waitingDays(createdAt: Date): number {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/** Dernière décision (rejet / suppression) enregistrée au journal pour chaque profil */
async function getLatestDecisions(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { at: string; by: string | null; reason: string | null }>();
  const logs = await prisma.adminActivityLog.findMany({
    where: { action: { in: ["moderation.reject", "moderation.delete"] }, targetId: { in: userIds } },
    orderBy: { createdAt: "desc" },
    select: { targetId: true, createdAt: true, adminName: true, adminEmail: true, details: true },
  });
  const map = new Map<string, { at: string; by: string | null; reason: string | null }>();
  for (const log of logs) {
    if (!log.targetId || map.has(log.targetId)) continue;
    const details = (log.details ?? {}) as { reason?: unknown };
    map.set(log.targetId, {
      at: log.createdAt.toISOString(),
      by: log.adminName || log.adminEmail || null,
      reason: typeof details.reason === "string" ? details.reason : null,
    });
  }
  return map;
}

/**
 * GET                 → inscriptions en attente (`PENDING`), plus récentes d'abord
 * GET ?view=refused   → inscriptions rejetées ou supprimées avant validation
 */
export async function GET(req: Request) {
  const session = await requireAdminSession("moderation.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const refused = new URL(req.url).searchParams.get("view") === "refused";
  const where = refused ? REFUSED_PROFILE_WHERE : { status: ProfileStatus.PENDING };

  const [auPairs, families, flagMap] = await Promise.all([
    prisma.auPairProfile.findMany({ where, include: { user: { select: { name: true, email: true } } } }),
    prisma.familyProfile.findMany({ where, include: { user: { select: { name: true, email: true } } } }),
    getCountryFlagMap(),
  ]);

  const profiles = [
    ...auPairs.map((p) => ({
      userId: p.userId,
      role: "AU_PAIR" as const,
      name: `${p.firstName} ${p.lastName}`,
      email: p.user.email,
      status: p.status,
      country: p.countryOfOrigin,
      flag: flagMap[p.countryOfOrigin] ?? "",
      age: calculateAge(p.dateOfBirth),
      description: p.description ?? "",
      waitingDays: waitingDays(p.createdAt),
      createdAt: p.createdAt.getTime(),
      updatedAt: p.updatedAt.getTime(),
      hasPhoto: !!p.profilePhotoUrl,
      photoUrl: p.profilePhotoUrl ?? "",
      hasId: p.idDocumentUrls.length > 0,
      statusChangedAt: p.statusChangedAt?.toISOString() ?? null,
      statusChangedBy: p.statusChangedBy,
      statusReason: p.statusReason,
    })),
    ...families.map((p) => ({
      userId: p.userId,
      role: "FAMILLE" as const,
      name: p.user.name ?? "Famille",
      email: p.user.email,
      status: p.status,
      country: p.country,
      flag: flagMap[p.country] ?? "",
      age: 0,
      description: p.description ?? "",
      waitingDays: waitingDays(p.createdAt),
      createdAt: p.createdAt.getTime(),
      updatedAt: p.updatedAt.getTime(),
      hasPhoto: !!p.familyPhotoUrl,
      photoUrl: p.familyPhotoUrl ?? "",
      hasId: p.idDocumentUrls.length > 0,
      statusChangedAt: p.statusChangedAt?.toISOString() ?? null,
      statusChangedBy: p.statusChangedBy,
      statusReason: p.statusReason,
    })),
  ];

  if (!refused) {
    // Derniers inscrits en tête de liste
    profiles.sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ profiles });
  }

  // Décision lue sur le profil ; à défaut (décisions antérieures à ces colonnes) dans le journal
  const decisions = await getLatestDecisions(profiles.filter((p) => !p.statusChangedAt).map((p) => p.userId));
  const withDecision = profiles
    .map((p) => {
      if (p.statusChangedAt) {
        return { ...p, decidedAt: p.statusChangedAt, decidedBy: p.statusChangedBy, reason: p.statusReason };
      }
      const d = decisions.get(p.userId);
      return { ...p, decidedAt: d?.at ?? new Date(p.updatedAt).toISOString(), decidedBy: d?.by ?? null, reason: d?.reason ?? null };
    })
    // Décisions les plus récentes en tête
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  return NextResponse.json({ profiles: withDecision });
}

type ModerationAction = "validate" | "reject" | "delete" | "restore";

export async function PATCH(req: Request) {
  const session = await requireAdminSession("moderation.validate");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, role, action, reason } = body as {
    userId?: string;
    role?: "AU_PAIR" | "FAMILLE";
    action?: ModerationAction;
    reason?: string;
  };

  const statusMap = {
    validate: ProfileStatus.ACTIVE,
    reject: ProfileStatus.REJECTED,
    delete: ProfileStatus.DELETED,
  } as const;

  if (!userId || (role !== "AU_PAIR" && role !== "FAMILLE") || !action || !(action in statusMap || action === "restore")) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const log = async (details?: Record<string, unknown>) =>
    logAdminActivity(session, {
      action: `moderation.${action}`,
      targetType: role,
      targetId: userId,
      targetLabel: await getUserLabel(userId),
      details,
    }, req);

  // Remise en file d'attente : réactive la connexion, le profil (jamais validé) repasse en PENDING
  if (action === "restore") {
    await restoreProfile(userId, role);
    await log();
    return NextResponse.json({ success: true });
  }

  const cleanReason = cleanStatusReason(reason);
  // La suppression exige un motif (comme dans /admin/utilisateurs) ; il reste facultatif pour un rejet
  if (action === "delete" && !isValidStatusReason(cleanReason)) {
    return NextResponse.json({ error: STATUS_REASON_REQUIRED_ERROR }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  await setProfileStatus(userId, role, statusMap[action], session.user as { id: string }, baseUrl, cleanReason);

  if (action === "validate") {
    // setProfileStatus() réactive la connexion et envoie l'email de validation
    await log();
    return NextResponse.json({ success: true, emailSent: true });
  }

  const emailSent = await sendModerationDecisionEmail({ userId, role, decision: action, reason: cleanReason });
  await log({ status: statusMap[action], emailSent, ...(cleanReason ? { reason: cleanReason } : {}) });

  return NextResponse.json({ success: true, emailSent });
}
