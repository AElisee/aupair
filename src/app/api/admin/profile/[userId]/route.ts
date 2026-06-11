import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { calculateAge } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { userId } = await params;
  const role = new URL(req.url).searchParams.get("role");

  if (role === "AU_PAIR") {
    const profile = await prisma.auPairProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true, createdAt: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      role: "AU_PAIR",
      email: profile.user.email,
      memberSince: profile.user.createdAt,
      status: profile.status,
      firstName: profile.firstName,
      lastName: profile.lastName,
      age: calculateAge(profile.dateOfBirth),
      dateOfBirth: profile.dateOfBirth,
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
      healthDeclaration: profile.healthDeclaration,
      hasCriminalRecord: profile.hasCriminalRecord,
      description: profile.description,
      motivation: profile.motivation,
      phoneWhatsapp1: profile.phoneWhatsapp1,
      phoneWhatsapp2: profile.phoneWhatsapp2,
      profilePhotoUrl: profile.profilePhotoUrl,
      idDocumentUrls: profile.idDocumentUrls,
      isAvailable: profile.isAvailable,
    });
  }

  if (role === "FAMILLE") {
    const profile = await prisma.familyProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, createdAt: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      role: "FAMILLE",
      name: profile.user.name,
      email: profile.user.email,
      memberSince: profile.user.createdAt,
      status: profile.status,
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
      familyPhotoUrl: profile.familyPhotoUrl,
      phoneWhatsapp: profile.phoneWhatsapp,
      preferredGender: profile.preferredGender,
      preferredAgeMin: profile.preferredAgeMin,
      preferredAgeMax: profile.preferredAgeMax,
      preferredLanguages: profile.preferredLanguages,
    });
  }

  return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
}
