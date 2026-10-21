import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { validateIdDocument } from "@/lib/id-documents";
import { ID_DOCUMENT_BUCKET as BUCKET, uploadIdDocuments } from "@/lib/id-documents.server";

const MAX_DOCUMENTS = 4;

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
    const fileError = validateIdDocument(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
  }

  const newUrls = await uploadIdDocuments(session.user.id, files);
  if (!newUrls) {
    return NextResponse.json({ error: "Échec de l'envoi du document." }, { status: 500 });
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

  if (!profile.idDocumentUrls.includes(body.url)) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
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
