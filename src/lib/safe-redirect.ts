/**
 * safe-redirect.ts
 * Utilitaire OWASP-compliant pour valider les redirections après connexion.
 *
 * Attaques bloquées :
 *   - Open Redirect externe    : callbackUrl=https://evil.com
 *   - Protocol-relative URL    : callbackUrl=//evil.com
 *   - Schémas dangereux        : callbackUrl=javascript:alert(1)
 *   - Chemins avec double-slash : callbackUrl=///evil.com
 *   - Encodage URL malveillant : callbackUrl=%2F%2Fevil.com
 */

/** Routes internes accessibles après connexion selon le rôle */
const ROLE_DEFAULTS: Record<string, string> = {
  ADMIN: "/admin",
  AU_PAIR: "/dashboard/au-pair",
  FAMILLE: "/dashboard/famille",
};

const FALLBACK_URL = "/";

/**
 * Valide et assainit une URL de redirection post-login.
 * Retourne l'URL si elle est sûre, sinon retourne `fallback`.
 *
 * @param rawUrl     - Valeur brute du paramètre callbackUrl
 * @param fallback   - URL de repli si rawUrl est invalide
 */
export function getSafeCallbackUrl(
  rawUrl: string | null | undefined,
  fallback = FALLBACK_URL
): string {
  if (!rawUrl) return fallback;

  try {
    // Décode les éventuels encodages URL (%2F, etc.)
    const decoded = decodeURIComponent(rawUrl);

    // Règle 1 : doit commencer par "/" (chemin relatif strictement)
    if (!decoded.startsWith("/")) return fallback;

    // Règle 2 : interdit les doubles-slash initiaux (//evil.com)
    if (decoded.startsWith("//")) return fallback;

    // Règle 3 : interdit les schémas dangereux après décodage
    const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:", "file:"];
    const lower = decoded.toLowerCase().trim();
    if (DANGEROUS_SCHEMES.some((s) => lower.startsWith(s))) return fallback;

    // Règle 4 : vérifie qu'on ne sort pas du domaine avec URL()
    // On préfixe avec une origine fictive pour parser correctement
    const parsed = new URL(decoded, "https://aupair-aeu.com");
    if (parsed.origin !== "https://aupair-aeu.com") return fallback;

    // Règle 5 : longueur raisonnable (évite les attaques par buffer)
    if (decoded.length > 500) return fallback;

    return decoded;
  } catch {
    // Si URL() lève une erreur, on refuse
    return fallback;
  }
}

/**
 * Retourne l'URL de redirection par défaut selon le rôle utilisateur.
 * Utilisé quand aucun callbackUrl n'est fourni ou qu'il est invalide.
 */
export function getDefaultRedirectForRole(role?: string | null): string {
  if (!role) return FALLBACK_URL;
  return ROLE_DEFAULTS[role] ?? FALLBACK_URL;
}

/**
 * Résout la redirection finale après connexion réussie.
 * Priorité : callbackUrl validé > route par défaut du rôle
 */
export function resolvePostLoginRedirect(
  rawCallbackUrl: string | null | undefined,
  userRole?: string | null
): string {
  const safe = getSafeCallbackUrl(rawCallbackUrl);
  if (safe !== FALLBACK_URL) return safe;
  return getDefaultRedirectForRole(userRole);
}
