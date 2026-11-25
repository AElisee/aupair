/** Pièces d'identité (inscription au pair et famille, profil au pair) — constantes utilisables côté client. */

/** Types acceptés → extension du fichier enregistré. */
export const ID_DOCUMENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

/** Vercel refuse les requêtes de plus de 4,5 Mo : un seul fichier par requête, 4 Mo maximum. */
export const ID_DOCUMENT_MAX_MB = 4;

export const ID_DOCUMENT_ACCEPT = Object.keys(ID_DOCUMENT_TYPES).join(",");

/** Message d'erreur (français, traduit côté client par `tError`) si le fichier est refusé, sinon `null`. */
export function validateIdDocument(file: { type: string; size: number }): string | null {
  if (!ID_DOCUMENT_TYPES[file.type]) return "Format invalide. Utilisez un JPG, PNG ou PDF.";
  if (file.size > ID_DOCUMENT_MAX_MB * 1024 * 1024) {
    return `Le fichier dépasse la taille maximale autorisée (${ID_DOCUMENT_MAX_MB} Mo).`;
  }
  return null;
}

/** Nombre maximum de pièces sur un profil au pair. */
export const MAX_ID_DOCUMENTS = 4;

export function tooManyIdDocumentsError(): string {
  return `Vous ne pouvez pas envoyer plus de ${MAX_ID_DOCUMENTS} documents au total.`;
}
