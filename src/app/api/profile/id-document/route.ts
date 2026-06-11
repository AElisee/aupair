import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "id-documents";
const MAX_DOCUMENTS = 4;

const ALLOWED_TYPES: Record<string, { ext: string; maxSize: number }> = {
  "image/jpeg": { ext: "jpg", maxSize: 5 * 1024 * 1024 },
  "image/png": { ext: "png", maxSize: 5 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", maxSize: 10 * 1024 * 1024 },
};

async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (session.user.role !== "AU_PAIR") {
    return NextResponse.json({ error: "Accès réservé aux au pairs." }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
    select: { idDocumentUrls: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  if (profile.idDocumentUrls.length + files.length > MAX_DOCUMENTS) {
    return NextResponse.json(
      { error: `Vous ne pouvez pas envoyer plus de ${MAX_DOCUMENTS} documents au total.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    const typeInfo = ALLOWED_TYPES[file.type];
    if (!typeInfo) {
      return NextResponse.json({ error: "Format invalide. Utilisez un JPG, PNG ou PDF." }, { status: 400 });
    }
    if (file.size > typeInfo.maxSize) {
      return NextResponse.json({ error: `Le fichier dépasse la taille maximale autorisée (${Math.round(typeInfo.maxSize / 1024 / 1024)} Mo).` }, { status: 400 });
    }
  }

  await ensureBucket();

  const newUrls: string[] = [];
  for (const file of files) {
    const typeInfo = ALLOWED_TYPES[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${session.user.id}/${randomUUID()}.${typeInfo.ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[profile/id-document] Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Échec de l'envoi du document." }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    newUrls.push(publicUrl);
  }

  const idDocumentUrls = [...profile.idDocumentUrls, ...newUrls];

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { idDocumentUrls },
  });

  return NextResponse.json({ idDocumentUrls });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (session.user.role !== "AU_PAIR") {
    return NextResponse.json({ error: "Accès réservé aux au pairs." }, { status: 403 });
  }

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "Le champ url est requis." }, { status: 400 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
    select: { idDocumentUrls: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const idDocumentUrls = profile.idDocumentUrls.filter((url) => url !== body.url);

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { idDocumentUrls },
  });

  const path = body.url.split(`${BUCKET}/`)[1];
  if (path) {
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
  }

  return NextResponse.json({ idDocumentUrls });
}
