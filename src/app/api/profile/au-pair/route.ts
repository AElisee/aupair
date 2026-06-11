import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCountriesByType, splitPhoneNumber } from "@/lib/countries";

function formatChildcareYears(years: number | null): string {
  if (years === null) return "";
  return years >= 5 ? "5+" : String(years);
}

function parseChildcareYears(value: string): number | null {
  if (!value) return null;
  if (value === "5+") return 5;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const countries = await getCountriesByType();
  const phone1 = splitPhoneNumber(profile.phoneWhatsapp1, profile.countryOfOrigin, countries);
  const phone2 = splitPhoneNumber(profile.phoneWhatsapp2, profile.countryOfOrigin, countries);

  return NextResponse.json({
    status: profile.status,
    isAvailable: profile.isAvailable,
    profilePhotoUrl: profile.profilePhotoUrl ?? "",
    idDocumentUrls: profile.idDocumentUrls,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth.toISOString().slice(0, 10),
    gender: profile.gender,
    nationality: profile.nationality,
    countryOfOrigin: profile.countryOfOrigin,
    cityOfOrigin: profile.cityOfOrigin ?? "",
    languages: profile.languages,
    educationLevel: profile.educationLevel ?? "",
    childcareExperience: profile.childcareExperience ?? "",
    childcareYears: formatChildcareYears(profile.childcareYears),
    firstAidCertified: profile.firstAidCertified,
    drivingLicense: profile.drivingLicense,
    targetCountries: profile.targetCountries,
    availableFrom: profile.availableFrom?.toISOString().slice(0, 10) ?? "",
    availableTo: profile.availableTo?.toISOString().slice(0, 10) ?? "",
    preferredDuration: profile.preferredDuration ?? "",
    isSmoker: profile.isSmoker,
    healthDeclaration: profile.healthDeclaration ?? "",
    hasCriminalRecord: profile.hasCriminalRecord,
    description: profile.description ?? "",
    motivation: profile.motivation ?? "",
    phoneCountryCode: phone1.phoneCountryCode,
    phoneNumber: phone1.phoneNumber,
    phoneCountryCode2: phone2.phoneCountryCode,
    phoneNumber2: phone2.phoneNumber,
  });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (body.gender !== "Femme" && body.gender !== "Homme") {
    return NextResponse.json({ error: "Le genre est obligatoire." }, { status: 400 });
  }

  const phoneCountryCode = body.phoneCountryCode ? String(body.phoneCountryCode) : "";
  const phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : "";
  const phoneWhatsapp1 = phoneNumber ? `${phoneCountryCode} ${phoneNumber}`.trim() : null;

  const phoneCountryCode2 = body.phoneCountryCode2 ? String(body.phoneCountryCode2) : "";
  const phoneNumber2 = body.phoneNumber2 ? String(body.phoneNumber2).trim() : "";
  const phoneWhatsapp2 = phoneNumber2 ? `${phoneCountryCode2} ${phoneNumber2}`.trim() : null;

  const toDateOrNull = (value: unknown): Date | null => {
    if (!value) return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  try {
    await prisma.auPairProfile.update({
      where: { userId: session.user.id },
      data: {
        firstName: String(body.firstName ?? ""),
        lastName: String(body.lastName ?? ""),
        dateOfBirth: new Date(String(body.dateOfBirth)),
        gender: String(body.gender ?? ""),
        nationality: String(body.nationality ?? ""),
        countryOfOrigin: String(body.countryOfOrigin ?? ""),
        cityOfOrigin: body.cityOfOrigin ? String(body.cityOfOrigin) : null,
        languages: Array.isArray(body.languages) ? body.languages.map(String) : [],
        educationLevel: body.educationLevel ? String(body.educationLevel) : null,
        childcareExperience: body.childcareExperience ? String(body.childcareExperience) : null,
        childcareYears: parseChildcareYears(String(body.childcareYears ?? "")),
        firstAidCertified: Boolean(body.firstAidCertified),
        drivingLicense: Boolean(body.drivingLicense),
        targetCountries: Array.isArray(body.targetCountries) ? body.targetCountries.map(String) : [],
        availableFrom: toDateOrNull(body.availableFrom),
        availableTo: toDateOrNull(body.availableTo),
        preferredDuration: body.preferredDuration ? String(body.preferredDuration) : null,
        isSmoker: Boolean(body.isSmoker),
        healthDeclaration: body.healthDeclaration ? String(body.healthDeclaration) : null,
        hasCriminalRecord: Boolean(body.hasCriminalRecord),
        description: body.description ? String(body.description) : null,
        motivation: body.motivation ? String(body.motivation) : null,
        phoneWhatsapp1,
        phoneWhatsapp2,
      },
    });
  } catch (err) {
    console.error("[profile/au-pair] Prisma error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du profil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
