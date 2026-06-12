import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { registerProfileView } from "@/lib/profile-views";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "AU_PAIR") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const profile = await prisma.familyProfile.findFirst({
    where: { userId: id, status: ProfileStatus.ACTIVE },
    include: { user: { select: { name: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  await registerProfileView({
    viewerId: session.user.id,
    profileUserId: profile.userId,
    profileRole: "FAMILLE",
  });

  return NextResponse.json({
    name: profile.user.name ?? "Famille",
    familyPhotoUrl: profile.familyPhotoUrl ?? "",
    country: profile.country,
    city: profile.city,
    address: profile.address,
    maritalStatus: profile.maritalStatus,
    parentsAges: profile.parentsAges,
    numberOfKids: profile.numberOfKids,
    kidsAges: profile.kidsAges,
    auPairTasks: profile.auPairTasks,
    hoursPerWeek: profile.hoursPerWeek,
    pocketMoney: profile.pocketMoney,
    accommodation: profile.accommodation,
    mealsProvided: profile.mealsProvided,
    description: profile.description,
    phoneWhatsapp: profile.phoneWhatsapp,
    preferredGender: profile.preferredGender,
    preferredAgeMin: profile.preferredAgeMin,
    preferredAgeMax: profile.preferredAgeMax,
    preferredLanguages: profile.preferredLanguages,
  });
}
