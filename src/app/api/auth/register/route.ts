import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";
import { MAX_NUMBER_OF_KIDS } from "@/lib/constants";
import { sendSignupEmails } from "@/lib/signup-emails";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateIdDocument } from "@/lib/id-documents";
import { uploadIdDocuments } from "@/lib/id-documents.server";

const REGISTER_MAX_PER_IP = 10;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

type RegisterBody = {
  role?: "au-pair" | "famille";
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  // Au pair
  country?: string;
  gender?: string;
  dateOfBirth?: string;
  languages?: string[];
  educationLevel?: string;
  experience?: string;
  // Famille
  city?: string;
  numberOfKids?: string;
  hostCountry?: string;
};

/** Convertit "5+" / "3" en entier, 0 par défaut. */
/** Nombre d'enfants : entier de 0 à MAX_NUMBER_OF_KIDS, sinon `null`. */
function parseKids(value?: string): number | null {
  const v = value?.trim() ?? "";
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n <= MAX_NUMBER_OF_KIDS ? n : null;
}

/**
 * Le formulaire envoie un multipart/form-data (champs texte, `languages` en JSON, et la pièce
 * d'identité `idDocument` obligatoire pour une famille). Le JSON reste accepté pour les au pairs.
 */
async function readBody(request: Request): Promise<{ body: RegisterBody; idDocument: File | null }> {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return { body: await request.json(), idDocument: null };
  }
  const formData = await request.formData();
  const body: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") body[key] = value;
  }
  if (typeof body.languages === "string") {
    const languages = JSON.parse(body.languages);
    body.languages = Array.isArray(languages) ? languages.filter((l) => typeof l === "string") : [];
  }
  const file = formData.get("idDocument");
  return { body: body as RegisterBody, idDocument: file instanceof File && file.size > 0 ? file : null };
}

export async function POST(request: Request) {
  let body: RegisterBody;
  let idDocument: File | null;
  try {
    ({ body, idDocument } = await readBody(request));
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { role, firstName, lastName, email, password } = body;

  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`register:ip:${ip}`, REGISTER_MAX_PER_IP, REGISTER_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives d'inscription. Merci de réessayer plus tard." },
      { status: 429 }
    );
  }

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
  if (role === "famille" && !body.hostCountry) {
    return NextResponse.json(
      { error: "Le pays d'accueil est obligatoire." },
      { status: 400 }
    );
  }

  if (role === "famille") {
    if (!idDocument) {
      return NextResponse.json(
        { error: "Une pièce d'identité est obligatoire." },
        { status: 400 }
      );
    }
    const fileError = validateIdDocument(idDocument);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
  }

  const numberOfKids = role === "famille" ? parseKids(body.numberOfKids) : 0;
  if (numberOfKids === null) {
    return NextResponse.json(
      { error: "Nombre d'enfants invalide." },
      { status: 400 }
    );
  }

  let dateOfBirth: Date | null = null;
  if (role === "au-pair") {
    if (!body.dateOfBirth) {
      return NextResponse.json(
        { error: "La date de naissance est obligatoire." },
        { status: 400 }
      );
    }
    dateOfBirth = new Date(body.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        { error: "Date de naissance invalide." },
        { status: 400 }
      );
    }
    if (calculateAge(dateOfBirth) < 18) {
      return NextResponse.json(
        { error: "Vous devez avoir au moins 18 ans pour vous inscrire en tant qu'au pair." },
        { status: 400 }
      );
    }
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
  let userId: string;
  try {
    ({ id: userId } = await prisma.user.create({
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
                  dateOfBirth: dateOfBirth!,
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
                  country: body.hostCountry ?? "",
                  city: body.city ?? "",
                  maritalStatus: "MARRIED",
                  numberOfKids,
                  parentsAges: [],
                  kidsAges: [],
                  preferredLanguages: [],
                },
              },
            }),
      },
      select: { id: true },
    }));
  } catch (err) {
    console.error("[register] Prisma error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte." },
      { status: 500 }
    );
  }

  // Pièce d'identité de la famille : envoyée une fois le compte créé (dossier = id utilisateur).
  // En cas d'échec, le compte est supprimé pour que la famille puisse recommencer l'inscription.
  if (role === "famille" && idDocument) {
    const urls = await uploadIdDocuments(userId, [idDocument]).catch((err) => {
      console.error("[register] ID document upload error:", err);
      return null;
    });
    const saved =
      urls &&
      (await prisma.familyProfile
        .update({ where: { userId }, data: { idDocumentUrls: urls } })
        .then(() => true)
        .catch((err) => {
          console.error("[register] Prisma error:", err);
          return false;
        }));
    if (!saved) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      return NextResponse.json({ error: "Échec de l'envoi du document." }, { status: 500 });
    }
  }

  // Emails envoyés après la réponse : un échec d'envoi ne doit pas faire échouer l'inscription.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  after(() =>
    sendSignupEmails({
      userId,
      email: normalizedEmail,
      firstName,
      fullName: `${firstName} ${lastName}`.trim(),
      role: userRole,
      country: role === "au-pair" ? body.country : body.hostCountry,
      baseUrl,
    })
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
