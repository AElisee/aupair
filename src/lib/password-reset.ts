import crypto from "crypto";

/** Durée de validité d'un lien de réinitialisation de mot de passe. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

/** Génère un token de réinitialisation (valeur brute envoyée par email + empreinte stockée en base). */
export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

/** Empreinte SHA-256 du token — seule cette valeur est stockée en base. */
export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
