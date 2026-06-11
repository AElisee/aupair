import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "id-documents";

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
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const typeInfo = ALLOWED_TYPES[file.type];
  if (!typeInfo) {
    return NextResponse.json({ error: "Format invalide. Utilisez un JPG, PNG ou PDF." }, { status: 400 });
  }

  if (file.size > typeInfo.maxSize) {
    return NextResponse.json({ error: `Le fichier dépasse la taille maximale autorisée (${Math.round(typeInfo.maxSize / 1024 / 1024)} Mo).` }, { status: 400 });
  }

  await ensureBucket();

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${session.user.id}.${typeInfo.ext}`;

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
  const url = `${publicUrl}?v=${Date.now()}`;

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { idDocumentUrl: url },
  });

  return NextResponse.json({ url });
}
