import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idDocumentLinks, removeIdDocument, uploadIdDocuments, validateIdDocumentServer } from "@/lib/id-documents.server";
import { MAX_ID_DOCUMENTS, tooManyIdDocumentsError } from "@/lib/id-documents";

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

  if (profile.idDocumentUrls.length + files.length > MAX_ID_DOCUMENTS) {
    return NextResponse.json({ error: tooManyIdDocumentsError() }, { status: 400 });
  }

  for (const file of files) {
    const fileError = await validateIdDocumentServer(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }
  }

  const newPaths = await uploadIdDocuments(session.user.id, files).catch((err) => {
    console.error("[id-documents] Upload error:", err);
    return null;
  });
  if (!newPaths) {
    return NextResponse.json({ error: "Échec de l'envoi du document." }, { status: 500 });
  }

  const idDocumentUrls = [...profile.idDocumentUrls, ...newPaths];

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { idDocumentUrls },
  });

  return NextResponse.json({ idDocumentUrls: idDocumentLinks(idDocumentUrls) });
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

  // `url` est le lien donné au client (`idDocumentLinks`)
  const index = idDocumentLinks(profile.idDocumentUrls).indexOf(body.url);
  if (index === -1) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const idDocumentUrls = profile.idDocumentUrls.filter((_, i) => i !== index);

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { idDocumentUrls },
  });

  await removeIdDocument(profile.idDocumentUrls[index]);

  return NextResponse.json({ idDocumentUrls: idDocumentLinks(idDocumentUrls) });
}
