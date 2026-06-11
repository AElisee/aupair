import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { calculateAge } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "FAMILLE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const targetIds = favorites.map((f) => f.targetId);

  const [profiles, flagMap] = await Promise.all([
    prisma.auPairProfile.findMany({
      where: { userId: { in: targetIds }, status: ProfileStatus.ACTIVE },
    }),
    getCountryFlagMap(),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const auPairs = targetIds
    .map((id) => profileMap.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      id: p.userId,
      firstName: p.firstName,
      profilePhotoUrl: p.profilePhotoUrl ?? "",
      age: calculateAge(p.dateOfBirth),
      country: p.countryOfOrigin,
      flag: flagMap[p.countryOfOrigin] ?? "",
      languages: p.languages,
      experience: p.childcareYears ?? 0,
      targetCountries: p.targetCountries,
      description: p.description ?? "",
      available: p.isAvailable,
    }));

  return NextResponse.json({ auPairs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "FAMILLE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { targetId } = (await req.json()) as { targetId?: string };
  if (!targetId) {
    return NextResponse.json({ error: "targetId manquant" }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: { userId_targetId: { userId: session.user.id, targetId } },
    update: {},
    create: { userId: session.user.id, targetId },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "FAMILLE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  if (!targetId) {
    return NextResponse.json({ error: "targetId manquant" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, targetId },
  });

  return NextResponse.json({ success: true });
}
