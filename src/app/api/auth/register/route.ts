import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendSignupEmails } from "@/lib/signup-emails";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { uploadIdDocuments, validateIdDocumentServer } from "@/lib/id-documents.server";
import { auPairProfileData, familyProfileData, validateSignup } from "@/lib/signup-validation.server";

const REGISTER_MAX_PER_IP = 10;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

/**
 * Inscription par le formulaire `/inscription` (multipart/form-data : champs texte, `languages`
 * en JSON, pièce d'identité `idDocument` obligatoire pour une famille). C'est le **seul** moyen
 * de créer un compte au pair ou famille : la connexion Google/Facebook n'en crée plus (cf. auth.ts).
 */
export async function POST(request: Request) {
  // Limite vérifiée avant toute lecture du corps (évite de parser des envois massifs).
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`register:ip:${ip}`, REGISTER_MAX_PER_IP, REGISTER_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives d'inscription. Merci de réessayer plus tard." },
      { status: 429 }
    );
  }

  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return badRequest("Requête invalide.");
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Requête invalide.");
  }

  const result = await validateSignup(form).catch((err) => {
    console.error("[register] Validation error:", err);
    return null;
  });
  if (!result) {
    return NextResponse.json({ error: "Impossible de contacter la base de données." }, { status: 503 });
  }
  if (!result.ok) return badRequest(result.error);
  const data = result.data;

  // Pièce d'identité de la famille : vérifiée (type, taille, contenu) avant de créer le compte.
  let idDocument: File | null = null;
  if (data.role === "famille") {
    const file = form.get("idDocument");
    if (!(file instanceof File) || file.size === 0) return badRequest("Une pièce d'identité est obligatoire.");
    const fileError = await validateIdDocumentServer(file);
    if (fileError) return badRequest(fileError);
    idDocument = file;
  }

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
  } catch (err) {
    console.error("[register] DB connection error:", err);
    return NextResponse.json({ error: "Impossible de contacter la base de données." }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const fullName = `${data.firstName} ${data.lastName}`;
  const userRole = data.role === "au-pair" ? "AU_PAIR" : "FAMILLE";

  // ── Création User + profil associé (écriture imbriquée = transaction) ──────────
  let userId: string;
  try {
    ({ id: userId } = await prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        name: fullName,
        role: userRole,
        ...(data.role === "au-pair"
          ? {
              auPairProfile: {
                create: { status: "PENDING", ...auPairProfileData(data, data), targetCountries: [] },
              },
            }
          : {
              familyProfile: {
                create: {
                  status: "PENDING",
                  ...familyProfileData(data),
                  maritalStatus: "MARRIED",
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
    // P2002 : même email inscrit en parallèle entre la vérification et la création.
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }
    console.error("[register] Prisma error:", err);
    return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
  }

  // Pièce d'identité envoyée une fois le compte créé (dossier = id utilisateur).
  // En cas d'échec, le compte est supprimé pour que la famille puisse recommencer l'inscription.
  if (idDocument) {
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

  // Attendu avant la réponse : avec after(), la fonction Vercel s'arrêtait avant l'envoi.
  // sendSignupEmails ne lève jamais, un échec d'envoi ne fait donc pas échouer l'inscription.
  await sendSignupEmails({
    userId,
    email: data.email,
    firstName: data.firstName,
    fullName,
    role: userRole,
    country: data.role === "au-pair" ? data.country : data.hostCountry,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
