import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "avatars";
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format invalide. Utilisez un JPG ou PNG." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Le fichier dépasse 5 Mo." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${session.user.id}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[profile/photo] Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Échec de l'envoi de la photo." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  const url = `${publicUrl}?v=${Date.now()}`;

  if (session.user.role === "FAMILLE") {
    await prisma.familyProfile.update({
      where: { userId: session.user.id },
      data: { familyPhotoUrl: url },
    });
  } else {
    await prisma.auPairProfile.update({
      where: { userId: session.user.id },
      data: { profilePhotoUrl: url },
    });
  }

  return NextResponse.json({ url });
}
