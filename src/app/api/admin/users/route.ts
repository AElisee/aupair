import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, setProfileStatus, restoreProfile, hardDeleteUser } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import {
  AU_PAIR_COMPLETION_FIELDS,
  FAMILY_COMPLETION_FIELDS,
  getProfileCompletion,
} from "@/lib/profile-completion";

export async function GET() {
  const session = await requireAdminSession();
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

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role, action } = body as {
    userId?: string;
    role?: "AU_PAIR" | "FAMILLE";
    action?: "validate" | "hide" | "unhide" | "suspend" | "delete" | "restore" | "purge";
  };

  if (!userId || !role || !action) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (action === "purge") {
    await hardDeleteUser(userId);
    return NextResponse.json({ success: true });
  }

  if (action === "restore") {
    const status = await restoreProfile(userId, role);
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

  return NextResponse.json({ success: true });
}
