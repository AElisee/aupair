import { createHmac, timingSafeEqual } from "crypto";

/** Une seule URL pour sandbox et live : GeniusPay route selon le préfixe des clés (pk_sandbox_ / pk_live_). */
export const GENIUSPAY_BASE_URL = "https://geniuspay.ci/api/v1/merchant";

export function geniuspayHeaders(publicKey: string, secretKey: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-Key": publicKey,
    "X-API-Secret": secretKey,
  };
}

/** Environnement déduit du préfixe de la clé publique — affichage uniquement, l'API n'en a pas besoin. */
export function geniuspayEnvironmentFromKey(publicKey: string | null | undefined): "sandbox" | "live" | null {
  if (!publicKey) return null;
  if (publicKey.startsWith("pk_live_")) return "live";
  if (publicKey.startsWith("pk_sandbox_")) return "sandbox";
  return null;
}

export type GeniuspayPaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "expired";

export const GENIUSPAY_SUCCESS_STATUSES = new Set<string>(["completed"]);
export const GENIUSPAY_FAILED_STATUSES = new Set<string>(["failed", "cancelled", "expired", "refunded"]);

export interface GeniuspayPayment {
  id: number | string;
  /** Référence GeniusPay (format MTX-XXXXXXXXXX) — identifiant utilisé par GET /payments/{reference}. */
  reference: string;
  amount: number;
  currency?: string;
  status: GeniuspayPaymentStatus;
  /** Méthode effectivement choisie par le client (wave, orange_money, mtn_money, card, paystack…). Absente tant que non payé. */
  payment_method?: string | null;
  payment_provider?: string | null;
  environment?: string;
  checkout_url?: string;
  payment_url?: string;
  metadata?: Record<string, unknown> | null;
}

/** Les réponses GeniusPay sont enveloppées dans `{ success, data }` ; on tolère aussi un objet à plat. */
export function unwrapGeniuspayPayment(json: unknown): GeniuspayPayment | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  if (obj.success === false) return null;
  const data = (obj.data && typeof obj.data === "object" ? obj.data : obj) as GeniuspayPayment;
  return data.reference ? data : null;
}

/** Message d'erreur GeniusPay (`{ success: false, error: { code, message } }`), pour les logs serveur. */
export function geniuspayErrorMessage(json: unknown): string {
  const err = (json as { error?: { code?: string; message?: string } } | null)?.error;
  return err ? `${err.code ?? "ERROR"}: ${err.message ?? ""}` : "réponse invalide";
}

/** Récupère le statut canonique d'un paiement auprès de GeniusPay (jamais celui fourni par le client ou le webhook). */
export async function fetchGeniuspayPayment(reference: string, publicKey: string, secretKey: string) {
  const res = await fetch(`${GENIUSPAY_BASE_URL}/payments/${encodeURIComponent(reference)}`, {
    headers: geniuspayHeaders(publicKey, secretKey),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return null;
  return unwrapGeniuspayPayment(json);
}

/** L'ID utilisateur est posé côté serveur dans `metadata.user_id` à la création (signée par notre clé secrète). */
export function extractUserIdFromGeniuspayPayment(payment: GeniuspayPayment): string | null {
  const userId = payment.metadata?.user_id;
  return typeof userId === "string" && userId ? userId : null;
}

/**
 * Déduit MOBILE_MONEY vs CARD à partir de `payment_method`. Le Mobile Money passe par ses propres
 * canaux (wave, orange_money…) : `paystack` est le canal carte bancaire de la page de paiement GeniusPay.
 * Une valeur absente/inconnue reste générique ("GENIUSPAY") plutôt que devinée.
 */
export function resolvePaymentMethodFromGeniuspay(method: string | null | undefined): "MOBILE_MONEY" | "CARD" | "GENIUSPAY" {
  if (!method) return "GENIUSPAY";
  const m = method.toLowerCase();
  if (m === "card" || m === "paystack") return "CARD";
  if (["wave", "orange_money", "mtn_money", "mtn_momo", "moov_money", "pawapay"].includes(m)) return "MOBILE_MONEY";
  return "GENIUSPAY";
}

function safeEqualHex(expected: string, actual: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(actual, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Vérifie un webhook GeniusPay : `X-Webhook-Signature` = HMAC-SHA256(`${timestamp}.${payload}`, secret),
 * `X-Webhook-Timestamp` = timestamp Unix, rejet au-delà de 5 minutes (anti-rejeu).
 *
 * La doc (exemple PHP) signe `json_encode($payload)` : on vérifie d'abord le corps brut, puis, en repli,
 * sa ré-sérialisation JSON (avec et sans l'échappement `\/` de PHP), car les octets exacts signés ne sont
 * pas garantis identiques au corps reçu. Le statut est de toute façon re-vérifié auprès de l'API ensuite.
 */
export function verifyGeniuspaySignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader || !timestampHeader) return false;

  const timestamp = parseInt(timestampHeader, 10);
  if (!Number.isFinite(timestamp)) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (toleranceSeconds > 0 && age > toleranceSeconds) return false;

  const signature = signatureHeader.trim().replace(/^sha256=/i, "").toLowerCase();

  const candidates = [rawBody];
  try {
    const reencoded = JSON.stringify(JSON.parse(rawBody));
    candidates.push(reencoded, reencoded.replace(/\//g, "\\/"));
  } catch {
    return false;
  }

  return candidates.some((payload) =>
    safeEqualHex(createHmac("sha256", secret).update(`${timestampHeader}.${payload}`, "utf8").digest("hex"), signature)
  );
}

export interface GeniuspayWebhookEvent {
  id?: string | number;
  event: string;
  environment?: string;
  data?: {
    object?: string;
    reference?: string;
    status?: string;
    metadata?: Record<string, unknown> | null;
  };
}
