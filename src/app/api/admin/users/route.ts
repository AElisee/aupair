import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, setProfileStatus, restoreProfile, hardDeleteUser } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import type { AdminPermission } from "@/lib/admin-permissions";
import { getUserLabel, logAdminActivity } from "@/lib/admin-activity";
import {
  AU_PAIR_COMPLETION_FIELDS,
  FAMILY_COMPLETION_FIELDS,
  getProfileCompletion,
} from "@/lib/profile-completion";

export async function GET() {
  const session = await requireAdminSession("users.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [auPairs, families, activeSubscriptions, flagMap] = await Promise.all([
    // Les comptes en attente de validation sont gérés dans /admin/moderation
    prisma.auPairProfile.findMany({
      where: { status: { not: ProfileStatus.PENDING } },
      include: { user: { select: { name: true, email: true, createdAt: true } } },
    }),
    prisma.familyProfile.findMany({
      where: { status: { not: ProfileStatus.PENDING } },
      include: { user: { select: { name: true, email: true, createdAt: true } } },
    }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
      select: { userId: true },
    }),
    getCountryFlagMap(),
  ]);

  const subscribedUserIds = new Set(activeSubscriptions.map((s) => s.userId));

  const users = [
    ...auPairs.map((p) => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      email: p.user.email,
      role: "AU_PAIR" as const,
      country: p.countryOfOrigin,
      flag: flagMap[p.countryOfOrigin] ?? "",
      completion: getProfileCompletion(p, AU_PAIR_COMPLETION_FIELDS).completion,
      status: p.status,
      subscribed: subscribedUserIds.has(p.userId),
      createdAt: p.user.createdAt,
      photoUrl: p.profilePhotoUrl ?? "",
    })),
    ...families.map((p) => ({
      id: p.userId,
      name: p.user.name ?? "Famille",
      email: p.user.email,
      role: "FAMILLE" as const,
      country: p.country,
      flag: flagMap[p.country] ?? "",
      completion: getProfileCompletion(p, FAMILY_COMPLETION_FIELDS).completion,
      status: p.status,
      subscribed: false,
      createdAt: p.user.createdAt,
      photoUrl: p.familyPhotoUrl ?? "",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));

  return NextResponse.json({ users });
}

/** Permission requise par action (validation = module Modération ; masquage et corbeille = module Utilisateurs) */
const ACTION_PERMISSIONS: Record<string, AdminPermission> = {
  validate: "moderation.validate",
  hide: "users.suspend",
  unhide: "users.suspend",
  suspend: "users.suspend",
  delete: "users.delete",
  restore: "users.delete",
  purge: "users.delete",
};

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const permission = ACTION_PERMISSIONS[(body as { action?: string })?.action ?? ""];
  const session = permission ? await requireAdminSession(permission) : null;
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { userId, role, action } = body as {
    userId?: string;
    role?: "AU_PAIR" | "FAMILLE";
    action?: "validate" | "hide" | "unhide" | "suspend" | "delete" | "restore" | "purge";
  };

  if (!userId || !role || !action) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Libellé lu avant l'action (la purge supprime l'utilisateur)
  const targetLabel = await getUserLabel(userId);
  const log = () =>
    logAdminActivity(session, { action: `users.${action}`, targetType: role, targetId: userId, targetLabel }, req);

  if (action === "purge") {
    await hardDeleteUser(userId);
    await log();
    return NextResponse.json({ success: true });
  }

  if (action === "restore") {
    const status = await restoreProfile(userId, role);
    await log();
    return NextResponse.json({ success: true, status });
  }

  const statusMap = {
    validate: ProfileStatus.ACTIVE,
    hide: ProfileStatus.HIDDEN,
    unhide: ProfileStatus.ACTIVE,
    suspend: ProfileStatus.SUSPENDED,
    delete: ProfileStatus.DELETED,
  } as const;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  await setProfileStatus(userId, role, statusMap[action], session.user.id as string, baseUrl);
  await log();

  return NextResponse.json({ success: true });
}
