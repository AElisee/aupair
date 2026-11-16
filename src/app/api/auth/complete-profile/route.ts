import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSignupEmails } from "@/lib/signup-emails";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadIdDocuments, validateIdDocumentServer } from "@/lib/id-documents.server";
import { needsOnboarding, ONBOARDING_USER_SELECT } from "@/lib/onboarding";
import {
  auPairProfileData,
  familyProfileData,
  validateNames,
  validateProfileFields,
} from "@/lib/signup-validation.server";

/**
 * Finalisation de l'inscription d'un compte créé via Google/Facebook (ou d'un profil auquel
 * manquent des champs obligatoires) : mêmes champs et mêmes règles que le formulaire
 * `/inscription`, sauf l'email et le mot de passe (fournis par Google/Facebook).
 *
 * - GET : état de la finalisation + valeurs déjà connues pour pré-remplir la page.
 * - POST (multipart) : enregistre le profil. Sans profil (ou changement de rôle), il est créé
 *   en `PENDING` et passe en modération comme une inscription normale ; un profil existant du
 *   même rôle est complété sans changer de statut (le support est prévenu pour relecture).
 *
 * Aucun compte n'est jamais supprimé ici.
 */

const COMPLETE_MAX_PER_USER = 10;
const COMPLETE_WINDOW_MS = 60 * 60 * 1000;

const USER_SELECT = {
  ...ONBOARDING_USER_SELECT,
  id: true,
  email: true,
  name: true,
  isActive: true,
  auPairProfile: {
    select: {
      ...ONBOARDING_USER_SELECT.auPairProfile.select,
      firstName: true,
      lastName: true,
      status: true,
    },
  },
  familyProfile: {
    select: {
      ...ONBOARDING_USER_SELECT.familyProfile.select,
      numberOfKids: true,
      idDocumentUrls: true,
      status: true,
    },
  },
} as const;

async function loadUser() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "ADMIN") return null;
  return prisma.user.findUnique({ where: { id: session.user.id }, select: USER_SELECT });
}

/** "Prénom Nom de famille" (nom Google/Facebook) → prénom + nom. */
function splitName(name: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export async function GET() {
  const user = await loadUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!needsOnboarding(user)) return NextResponse.json({ needsOnboarding: false });

  const au = user.auPairProfile;
  const fam = user.familyProfile;
  const names = au ? { firstName: au.firstName, lastName: au.lastName } : splitName(user.name);

  return NextResponse.json({
    needsOnboarding: true,
    email: user.email,
    role: au ? "au-pair" : fam ? "famille" : null,
    ...names,
    // Champs déjà renseignés (anciens comptes). La date de naissance n'est jamais
    // pré-remplie : les anciens comptes Google portaient une date fictive (01/01/2000).
    country: au?.countryOfOrigin ?? "",
    gender: au?.gender ?? "",
    languages: au?.languages ?? [],
    hostCountry: fam?.country ?? "",
    city: fam?.city ?? "",
    numberOfKids: fam ? String(fam.numberOfKids) : "",
    hasIdDocument: (fam?.idDocumentUrls.length ?? 0) > 0,
  });
}

export async function POST(request: Request) {
  const user = await loadUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (!user.isActive) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  if (!needsOnboarding(user)) {
    return NextResponse.json({ error: "Votre inscription est déjà complète." }, { status: 409 });
  }

  const { allowed } = await checkRateLimit(`complete-profile:${user.id}`, COMPLETE_MAX_PER_USER, COMPLETE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Merci de réessayer plus tard." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const names = validateNames(form);
  if (!names.ok) return NextResponse.json({ error: names.error }, { status: 400 });
  const result = await validateProfileFields(form).catch((err) => {
    console.error("[complete-profile] Validation error:", err);
    return null;
  });
  if (!result) return NextResponse.json({ error: "Impossible de contacter la base de données." }, { status: 503 });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const fields = result.data;

  const role = fields.role === "au-pair" ? "AU_PAIR" : "FAMILLE";
  const existing = role === "AU_PAIR" ? user.auPairProfile : user.familyProfile;
  // Pièce d'identité obligatoire pour une famille, sauf si elle en a déjà déposé une.
  let idDocument: File | null = null;
  if (role === "FAMILLE" && !(user.familyProfile?.idDocumentUrls.length ?? 0)) {
    const file = form.get("idDocument");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Une pièce d'identité est obligatoire." }, { status: 400 });
    }
    const fileError = await validateIdDocumentServer(file);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
    idDocument = file;
  }

  const fullName = `${names.data.firstName} ${names.data.lastName}`;
  const userId = user.id;

  // Sans profil existant du rôle choisi (compte Google/Facebook, ou changement de rôle : un ancien
  // compte Google créé d'office en au pair alors qu'il s'agit d'une famille), le profil est créé en
  // PENDING et l'ancien profil incomplet de l'autre rôle est retiré ; le compte, lui, est conservé.
  // Avec un profil existant du même rôle, il est complété et son statut ne change pas.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { role, name: fullName } });
      if (fields.role === "au-pair") {
        const data = auPairProfileData(names.data, fields);
        if (existing) {
          await tx.auPairProfile.update({ where: { userId }, data });
        } else {
          await tx.familyProfile.deleteMany({ where: { userId } });
          await tx.auPairProfile.create({ data: { userId, status: "PENDING", targetCountries: [], ...data } });
        }
      } else {
        const data = familyProfileData(fields);
        if (existing) {
          await tx.familyProfile.update({ where: { userId }, data });
        } else {
          await tx.auPairProfile.deleteMany({ where: { userId } });
          await tx.familyProfile.create({
            data: {
              userId,
              status: "PENDING",
              ...data,
              maritalStatus: "MARRIED",
              parentsAges: [],
              kidsAges: [],
              preferredLanguages: [],
            },
          });
        }
      }
    });
  } catch (err) {
    console.error("[complete-profile] Prisma error:", err);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde du profil." }, { status: 500 });
  }

  if (idDocument) {
    const urls = await uploadIdDocuments(userId, [idDocument]).catch((err) => {
      console.error("[complete-profile] ID document upload error:", err);
      return null;
    });
    const saved =
      urls &&
      (await prisma.familyProfile
        .update({ where: { userId: userId }, data: { idDocumentUrls: urls } })
        .then(() => true)
        .catch((err) => {
          console.error("[complete-profile] Prisma error:", err);
          return false;
        }));
    if (!saved) {
      // Sans pièce d'identité, la famille reste à finaliser : on retire le profil créé
      // (jamais le compte) pour qu'elle puisse renvoyer le formulaire.
      if (!existing) await prisma.familyProfile.deleteMany({ where: { userId: userId } }).catch(() => {});
      return NextResponse.json({ error: "Échec de l'envoi du document." }, { status: 500 });
    }
  }

  await sendSignupEmails({
    userId: userId,
    email: user.email,
    firstName: names.data.firstName,
    fullName,
    role,
    country: fields.role === "au-pair" ? fields.country : fields.hostCountry,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin,
    completedExisting: !!existing,
  });

  const status = existing?.status ?? "PENDING";
  return NextResponse.json({ ok: true, role, status });
}
