/**
 * Motif d'une suspension / suppression / d'un rejet de compte. Obligatoire pour suspendre
 * ou supprimer un compte (API et formulaires). Client-safe.
 */

export const STATUS_REASON_MIN_LENGTH = 3;
export const STATUS_REASON_MAX_LENGTH = 1000;

/** Motif nettoyé (espaces retirés, longueur bornée) ; chaîne vide si absent */
export function cleanStatusReason(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, STATUS_REASON_MAX_LENGTH) : "";
}

export function isValidStatusReason(reason: string) {
  return reason.trim().length >= STATUS_REASON_MIN_LENGTH;
}

/** Message d'erreur de l'API (traduit côté client par `tError`) */
export const STATUS_REASON_REQUIRED_ERROR = "Le motif est obligatoire.";
