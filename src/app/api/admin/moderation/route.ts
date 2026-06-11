import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, setProfileStatus } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { calculateAge } from "@/lib/utils";

function waitingDays(createdAt: Date): number {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [auPairs, families, flagMap] = await Promise.all([
    prisma.auPairProfile.findMany({
      where: { status: ProfileStatus.PENDING },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.familyProfile.findMany({
      where: { status: ProfileStatus.PENDING },
      include: { user: { select: { name: true, email: true } } },
    }),
    getCountryFlagMap(),
  ]);

  const profiles = [
    ...auPairs.map((p) => ({
      userId: p.userId,
      role: "AU_PAIR" as const,
      name: `${p.firstName} ${p.lastName}`,
      country: p.countryOfOrigin,
      flag: flagMap[p.countryOfOrigin] ?? "",
      age: calculateAge(p.dateOfBirth),
      description: p.description ?? "",
      waitingDays: waitingDays(p.createdAt),
      hasPhoto: !!p.profilePhotoUrl,
      photoUrl: p.profilePhotoUrl ?? "",
      hasId: p.idDocumentUrls.length > 0,
    })),
    ...families.map((p) => ({
      userId: p.userId,
      role: "FAMILLE" as const,
      name: p.user.name ?? "Famille",
      country: p.country,
      flag: flagMap[p.country] ?? "",
      age: 0,
      description: p.description ?? "",
      waitingDays: waitingDays(p.createdAt),
      hasPhoto: !!p.familyPhotoUrl,
      photoUrl: p.familyPhotoUrl ?? "",
      hasId: true,
    })),
  ].sort((a, b) => b.waitingDays - a.waitingDays);

  return NextResponse.json({ profiles });
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
    action?: "validate" | "hide" | "suspend" | "delete";
  };

  const statusMap = {
    validate: ProfileStatus.ACTIVE,
    hide: ProfileStatus.HIDDEN,
    suspend: ProfileStatus.SUSPENDED,
    delete: ProfileStatus.DELETED,
  } as const;

  if (!userId || !role || !action || !(action in statusMap)) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  await setProfileStatus(userId, role, statusMap[action], session.user.id as string);

  return NextResponse.json({ success: true });
}
