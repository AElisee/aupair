import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCountriesByType, splitPhoneNumber } from "@/lib/countries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.familyProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user || !profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const [firstName, ...rest] = (user.name ?? "").split(" ");
  const countries = await getCountriesByType();

  return NextResponse.json({
    status: profile.status,
    familyPhotoUrl: profile.familyPhotoUrl ?? "",
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    country: profile.country,
    city: profile.city,
    address: profile.address ?? "",
    maritalStatus: profile.maritalStatus,
    parentsAges: profile.parentsAges.join(", "),
    numberOfKids: profile.numberOfKids,
    kidsAges: profile.kidsAges.join(", "),
    auPairTasks: profile.auPairTasks ?? "",
    hoursPerWeek: profile.hoursPerWeek?.toString() ?? "",
    pocketMoney: profile.pocketMoney?.toString() ?? "",
    accommodation: profile.accommodation ?? "",
    mealsProvided: profile.mealsProvided,
    description: profile.description ?? "",
    preferredGender: profile.preferredGender ?? "",
    preferredAgeMin: profile.preferredAgeMin?.toString() ?? "",
    preferredAgeMax: profile.preferredAgeMax?.toString() ?? "",
    preferredLanguages: profile.preferredLanguages,
    ...splitPhoneNumber(profile.phoneWhatsapp, profile.country, countries),
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

  const phoneCountryCode = body.phoneCountryCode ? String(body.phoneCountryCode) : "";
  const phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : "";
  const phoneWhatsapp = phoneNumber ? `${phoneCountryCode} ${phoneNumber}`.trim() : null;

  const kidsAges = String(body.kidsAges ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));

  const parentsAges = String(body.parentsAges ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));

  const toIntOrNull = (value: unknown): number | null => {
    if (value === "" || value === null || value === undefined) return null;
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) ? n : null;
  };

  const toFloatOrNull = (value: unknown): number | null => {
    if (value === "" || value === null || value === undefined) return null;
    const n = parseFloat(String(value));
    return Number.isFinite(n) ? n : null;
  };

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name: `${String(body.firstName ?? "")} ${String(body.lastName ?? "")}`.trim() },
      }),
      prisma.familyProfile.update({
        where: { userId: session.user.id },
        data: {
          country: String(body.country ?? ""),
          city: String(body.city ?? ""),
          address: body.address ? String(body.address) : null,
          maritalStatus: String(body.maritalStatus ?? "MARRIED") as "MARRIED" | "SINGLE" | "DIVORCED" | "OTHER",
          parentsAges,
          numberOfKids: toIntOrNull(body.numberOfKids) ?? 0,
          kidsAges,
          auPairTasks: body.auPairTasks ? String(body.auPairTasks) : null,
          hoursPerWeek: toIntOrNull(body.hoursPerWeek),
          pocketMoney: toFloatOrNull(body.pocketMoney),
          accommodation: body.accommodation ? String(body.accommodation) : null,
          mealsProvided: Boolean(body.mealsProvided),
          description: body.description ? String(body.description) : null,
          preferredGender: body.preferredGender ? String(body.preferredGender) : null,
          preferredAgeMin: toIntOrNull(body.preferredAgeMin),
          preferredAgeMax: toIntOrNull(body.preferredAgeMax),
          preferredLanguages: Array.isArray(body.preferredLanguages) ? body.preferredLanguages.map(String) : [],
          phoneWhatsapp,
        },
      }),
    ]);
  } catch (err) {
    console.error("[profile/famille] Prisma error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du profil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
