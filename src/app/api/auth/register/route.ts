import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
  role?: "au-pair" | "famille";
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  // Au pair
  country?: string;
  gender?: string;
  languages?: string[];
  educationLevel?: string;
  experience?: string;
  // Famille
  city?: string;
  numberOfKids?: string;
};

/** Convertit "5+" / "3" en entier, 0 par défaut. */
function parseKids(value?: string): number {
  if (!value) return 0;
  const n = parseInt(value.replace("+", ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { role, firstName, lastName, email, password } = body;

  // ── Validation minimale ────────────────────────────────────────────────────
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants." },
      { status: 400 }
    );
  }
  if (role !== "au-pair" && role !== "famille") {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }
  if (role === "au-pair" && body.gender !== "Femme" && body.gender !== "Homme") {
    return NextResponse.json(
      { error: "Le genre est obligatoire." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  let existing;
  try {
    existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  } catch (err) {
    console.error("[register] DB connection error:", err);
    return NextResponse.json(
      { error: "Impossible de contacter la base de données." },
      { status: 503 }
    );
  }

  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role === "au-pair" ? "AU_PAIR" : "FAMILLE";

  // ── Création User + profil associé (transaction) ────────────────────────────
  try {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        role: userRole,
        ...(role === "au-pair"
          ? {
              auPairProfile: {
                create: {
                  status: "PENDING",
                  firstName,
                  lastName,
                  dateOfBirth: new Date("2000-01-01"),
                  gender: body.gender ?? "",
                  nationality: body.country ?? "",
                  countryOfOrigin: body.country ?? "",
                  languages: body.languages ?? [],
                  targetCountries: [],
                  educationLevel: body.educationLevel || null,
                  childcareExperience: body.experience || null,
                },
              },
            }
          : {
              familyProfile: {
                create: {
                  status: "PENDING",
                  country: "",
                  city: body.city ?? "",
                  maritalStatus: "MARRIED",
                  numberOfKids: parseKids(body.numberOfKids),
                  parentsAges: [],
                  kidsAges: [],
                  preferredLanguages: [],
                },
              },
            }),
      },
    });
  } catch (err) {
    console.error("[register] Prisma error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
