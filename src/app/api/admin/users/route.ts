import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, setProfileStatus } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [auPairs, families, activeSubscriptions] = await Promise.all([
    prisma.auPairProfile.findMany({
      include: { user: { select: { name: true, email: true, createdAt: true } } },
    }),
    prisma.familyProfile.findMany({
      include: { user: { select: { name: true, email: true, createdAt: true } } },
    }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
      select: { userId: true },
    }),
  ]);

  const subscribedUserIds = new Set(activeSubscriptions.map((s) => s.userId));

  const users = [
    ...auPairs.map((p) => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      email: p.user.email,
      role: "AU_PAIR" as const,
      country: p.countryOfOrigin,
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
      status: p.status,
      subscribed: false,
      createdAt: p.user.createdAt,
      photoUrl: p.familyPhotoUrl ?? "",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((u) => ({ ...u, createdAt: formatDate(u.createdAt) }));

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
    action?: "validate" | "hide" | "unhide" | "suspend" | "delete";
  };

  if (!userId || !role || !action) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const statusMap = {
    validate: ProfileStatus.ACTIVE,
    hide: ProfileStatus.HIDDEN,
    unhide: ProfileStatus.ACTIVE,
    suspend: ProfileStatus.SUSPENDED,
    delete: ProfileStatus.DELETED,
  } as const;

  await setProfileStatus(userId, role, statusMap[action], session.user.id as string);

  return NextResponse.json({ success: true });
}
