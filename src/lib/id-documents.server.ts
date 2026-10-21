import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import { ID_DOCUMENT_TYPES } from "./id-documents";

export const ID_DOCUMENT_BUCKET = "id-documents";

async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(ID_DOCUMENT_BUCKET);
  if (!data) {
    await supabaseAdmin.storage.createBucket(ID_DOCUMENT_BUCKET, { public: true });
  }
}

/** Envoie des pièces d'identité (déjà validées par `validateIdDocument`) ; renvoie leurs URL, ou `null` en cas d'échec. */
export async function uploadIdDocuments(userId: string, files: File[]): Promise<string[] | null> {
  await ensureBucket();

  const urls: string[] = [];
  for (const file of files) {
    const typeInfo = ID_DOCUMENT_TYPES[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${userId}/${randomUUID()}.${typeInfo.ext}`;

    const { error } = await supabaseAdmin.storage
      .from(ID_DOCUMENT_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (error) {
      console.error("[id-documents] Supabase upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(ID_DOCUMENT_BUCKET).getPublicUrl(path);
    urls.push(publicUrl);
  }
  return urls;
}
