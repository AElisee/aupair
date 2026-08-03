import { createHmac, timingSafeEqual } from "crypto";

export type FedapayEnvironment = "sandbox" | "live";

export function fedapayBaseUrl(environment: FedapayEnvironment | string | null | undefined) {
  return environment === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
}

export function fedapayHeaders(secretKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secretKey}`,
  };
}

export type FedapayTransactionStatus =
  | "pending"
  | "approved"
  | "declined"
  | "canceled"
  | "refunded"
  | "transferred"
  | "expired";

export interface FedapayTransaction {
  id: number;
  reference: string;
  amount: number;
  description: string;
  status: FedapayTransactionStatus;
  merchant_reference?: string;
  /** Canal réel utilisé par le client une fois la transaction traitée (ex: "mtn_open", "moov", "card"). Absent tant que la transaction n'est pas complétée. */
  mode?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Déduit MOBILE_MONEY vs CARD à partir du `mode` FedaPay. Si le mode est absent ou inconnu,
 * on retombe sur "FEDAPAY" (générique) plutôt que de deviner — mieux vaut une catégorie
 * générique correcte qu'une catégorie précise mais fausse.
 */
export function resolvePaymentMethodFromMode(mode: string | null | undefined): "MOBILE_MONEY" | "CARD" | "FEDAPAY" {
  if (!mode) return "FEDAPAY";
  if (mode.includes("card")) return "CARD";
  if (mode.includes("mtn") || mode.includes("moov") || mode.includes("celtiis") || mode.includes("airtel") || mode.includes("mixx")) {
    return "MOBILE_MONEY";
  }
  return "FEDAPAY";
}

export interface FedapayTokenResponse {
  token: string;
  url: string;
}

/**
 * Les réponses REST FedaPay pour une transaction enveloppent parfois la ressource sous une clé
 * versionnée (ex: `{ "v1/transaction": {...} }`) et parfois la renvoient à plat — non confirmé de
 * façon fiable par la doc publique. On essaie les formes connues avant de retomber sur l'objet brut.
 */
export function unwrapFedapayTransaction(json: unknown): FedapayTransaction {
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (obj["v1/transaction"]) return obj["v1/transaction"] as FedapayTransaction;
    if (obj.transaction) return obj.transaction as FedapayTransaction;
  }
  return json as FedapayTransaction;
}

const REFERENCE_PREFIX = "AUPAIR";

/** Encode l'ID utilisateur dans la référence marchande — le webhook FedaPay ne fournit que l'id de transaction. */
export function buildMerchantReference(userId: string) {
  return `${REFERENCE_PREFIX}-${userId}-${Date.now()}`;
}

/** Extrait l'ID utilisateur d'une référence marchande générée par buildMerchantReference (l'ID cuid ne contient jamais de tiret). */
export function parseUserIdFromMerchantReference(reference: string | null | undefined): string | null {
  if (!reference) return null;
  const parts = reference.split("-");
  if (parts.length !== 3 || parts[0] !== REFERENCE_PREFIX) return null;
  return parts[1];
}

/**
 * Vérifie la signature du webhook FedaPay (header X-FEDAPAY-SIGNATURE, format "t=<timestamp>,s=<hex>",
 * HMAC-SHA256 de "{timestamp}.{rawBody}" avec la clé secrète de webhook). Confirmé depuis le code source
 * du SDK officiel fedapay-node (WebhookSignature.verifyHeader).
 */
export function verifyFedapaySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("="))
  ) as { t?: string; s?: string };

  if (!parts.t || !parts.s) return false;

  const timestamp = parseInt(parts.t, 10);
  if (!Number.isFinite(timestamp)) return false;

  const age = Math.floor(Date.now() / 1000) - timestamp;
  if (toleranceSeconds > 0 && age > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(parts.s, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export interface FedapayWebhookEvent {
  id?: number;
  name: string;
  /** Type de ressource concernée (ex: "transaction", "customer") — un simple string, pas un objet. */
  entity?: string;
  object_id?: number;
}

/**
 * Extrait l'id de transaction depuis un événement webhook, uniquement si l'événement concerne bien
 * une transaction (`entity === "transaction"` ou `name` préfixé par "transaction."). Sans cette
 * vérification, un event `customer.*` dont l'`object_id` (id client) coïncide par hasard avec l'id
 * d'une transaction appartenant à un autre utilisateur ferait activer un abonnement à tort.
 */
export function extractTransactionId(event: FedapayWebhookEvent): number | null {
  const isTransactionEvent = event.entity === "transaction" || event.name?.startsWith("transaction.");
  if (!isTransactionEvent) return null;
  return typeof event.object_id === "number" ? event.object_id : null;
}
