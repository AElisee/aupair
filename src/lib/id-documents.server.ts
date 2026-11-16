import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import { ID_DOCUMENT_TYPES, validateIdDocument } from "./id-documents";

export const ID_DOCUMENT_BUCKET = "id-documents";

/** Signature binaire attendue en tête de fichier pour chaque type MIME accepté. */
const FILE_SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
};

/**
 * Validation serveur d'une pièce d'identité : type et taille (`validateIdDocument`), puis contenu.
 * Le type MIME est déclaré par le navigateur, donc falsifiable : on vérifie aussi que les premiers
 * octets correspondent bien à un JPG / PNG / PDF.
 */
export async function validateIdDocumentServer(file: File): Promise<string | null> {
  const error = validateIdDocument(file);
  if (error) return error;
  const signature = FILE_SIGNATURES[file.type];
  const head = new Uint8Array(await file.slice(0, signature.length).arrayBuffer());
  return signature.every((byte, i) => head[i] === byte) ? null : "Format invalide. Utilisez un JPG, PNG ou PDF.";
}

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
