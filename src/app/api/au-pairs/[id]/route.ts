import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";
import { calculateAge } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "FAMILLE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const [profile, favorite] = await Promise.all([
    prisma.auPairProfile.findFirst({
      where: { userId: id, status: ProfileStatus.ACTIVE },
    }),
    prisma.favorite.findUnique({
      where: { userId_targetId: { userId: session.user.id, targetId: id } },
    }),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  if (profile.userId !== session.user.id) {
    await prisma.auPairProfile.update({
      where: { id: profile.id },
      data: { profileViews: { increment: 1 } },
    });
  }

  return NextResponse.json({
    available: profile.isAvailable,
    isFavorite: !!favorite,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profilePhotoUrl: profile.profilePhotoUrl ?? "",
    age: calculateAge(profile.dateOfBirth),
    gender: profile.gender,
    nationality: profile.nationality,
    countryOfOrigin: profile.countryOfOrigin,
    cityOfOrigin: profile.cityOfOrigin,
    languages: profile.languages,
    educationLevel: profile.educationLevel,
    childcareExperience: profile.childcareExperience,
    childcareYears: profile.childcareYears,
    firstAidCertified: profile.firstAidCertified,
    drivingLicense: profile.drivingLicense,
    targetCountries: profile.targetCountries,
    availableFrom: profile.availableFrom,
    availableTo: profile.availableTo,
    preferredDuration: profile.preferredDuration,
    isSmoker: profile.isSmoker,
    description: profile.description,
    motivation: profile.motivation,
    phoneWhatsapp1: profile.phoneWhatsapp1,
    phoneWhatsapp2: profile.phoneWhatsapp2,
  });
}
