import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import { updateAppSettings } from "@/lib/settings";

const BUCKET = "site-assets";
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format invalide. Utilisez une image JPG, PNG ou WEBP." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Le fichier dépasse 5 Mo." }, { status: 400 });
  }

  await ensureBucket();

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `hero-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[admin/hero-image] Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Échec de l'envoi de l'image." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  const url = `${publicUrl}?v=${Date.now()}`;

  await updateAppSettings({ heroImageUrl: url });

  return NextResponse.json({ url });
}
