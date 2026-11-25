import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import { ID_DOCUMENT_TYPES, validateIdDocument } from "./id-documents";

const ID_DOCUMENT_BUCKET = "id-documents";
/** Durée de validité d'un lien temporaire, créé à chaque ouverture du document. */
const SIGNED_URL_SECONDS = 60;
/** `<userId>/<uuid>.<ext>`, ou `<userId>.<ext>` pour les tout premiers envois. */
const DOCUMENT_PATH_REGEX = /^[\w-]+(\/[\w-]+)?\.(jpg|jpeg|png|pdf)$/i;

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

let bucketReady: Promise<void> | null = null;

/** Crée le bucket privé, ou repasse en privé celui créé en public par l'ancien code (une fois par instance). */
function ensurePrivateBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const { data } = await supabaseAdmin.storage.getBucket(ID_DOCUMENT_BUCKET);
    if (data && !data.public) return;
    const { error } = data
      ? await supabaseAdmin.storage.updateBucket(ID_DOCUMENT_BUCKET, { public: false })
      : await supabaseAdmin.storage.createBucket(ID_DOCUMENT_BUCKET, { public: false });
    if (error) throw error;
  })().catch((err) => {
    bucketReady = null; // nouvel essai à la prochaine requête
    throw err;
  });
  return bucketReady;
}

/** Chemin dans le bucket d'une valeur de `idDocumentUrls` (chemin, ou URL publique pour les anciens envois). */
function toPath(stored: string): string {
  return (stored.split(`/${ID_DOCUMENT_BUCKET}/`)[1] ?? stored).split("?")[0];
}

export function isIdDocumentPath(path: string): boolean {
  return DOCUMENT_PATH_REGEX.test(path);
}

/** Utilisateur propriétaire du fichier (premier segment du chemin). */
export function idDocumentOwnerId(path: string): string {
  return path.split("/")[0].split(".")[0];
}

/** Liens à donner au client : `GET /api/id-documents/<chemin>`, qui vérifie les droits à chaque ouverture. */
export function idDocumentLinks(stored: string[]): string[] {
  return stored.map((value) => `/api/id-documents/${toPath(value)}`);
}

export async function createIdDocumentSignedUrl(path: string): Promise<string | null> {
  await ensurePrivateBucket();
  const { data, error } = await supabaseAdmin.storage
    .from(ID_DOCUMENT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) console.error("[id-documents] Supabase signed URL error:", error);
  return data?.signedUrl ?? null;
}

/** Supprime le fichier d'une valeur de `idDocumentUrls`. */
export async function removeIdDocument(stored: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(ID_DOCUMENT_BUCKET).remove([toPath(stored)]);
  if (error) console.error("[id-documents] Supabase remove error:", error);
}

/** Envoie des pièces d'identité (déjà validées par `validateIdDocument`) ; renvoie leurs chemins dans le bucket, ou `null` en cas d'échec. */
export async function uploadIdDocuments(userId: string, files: File[]): Promise<string[] | null> {
  await ensurePrivateBucket();

  const paths: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${userId}/${randomUUID()}.${ID_DOCUMENT_TYPES[file.type]}`;

    const { error } = await supabaseAdmin.storage
      .from(ID_DOCUMENT_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (error) {
      console.error("[id-documents] Supabase upload error:", error);
      return null;
    }

    paths.push(path);
  }
  return paths;
}
