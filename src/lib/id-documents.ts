/** Pièces d'identité (au pairs : profil, familles : inscription) — constantes utilisables côté client. */

export const ID_DOCUMENT_TYPES: Record<string, { ext: string; maxSize: number }> = {
  "image/jpeg": { ext: "jpg", maxSize: 5 * 1024 * 1024 },
  "image/png": { ext: "png", maxSize: 5 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", maxSize: 10 * 1024 * 1024 },
};

export const ID_DOCUMENT_ACCEPT = Object.keys(ID_DOCUMENT_TYPES).join(",");

/** Message d'erreur (français, traduit côté client par `tError`) si le fichier est refusé, sinon `null`. */
export function validateIdDocument(file: { type: string; size: number }): string | null {
  const typeInfo = ID_DOCUMENT_TYPES[file.type];
  if (!typeInfo) return "Format invalide. Utilisez un JPG, PNG ou PDF.";
  if (file.size > typeInfo.maxSize) {
    return `Le fichier dépasse la taille maximale autorisée (${Math.round(typeInfo.maxSize / 1024 / 1024)} Mo).`;
  }
  return null;
}
