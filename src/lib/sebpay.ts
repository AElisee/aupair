import { createHmac, timingSafeEqual } from "crypto";

export const SEBPAY_BASE_URL = "https://newapi.sebpay.bj/api/v1";

export function sebpayHeaders(publicKey: string, secretKey: string) {
  return {
    "Content-Type": "application/json",
    "X-Public-Key": publicKey,
    "X-Secret-Key": secretKey,
  };
}

export type SebpayTransactionStatus = "pending" | "approved" | "rejected";

export interface SebpayCollectionResponse {
  transaction_id: string;
  status: SebpayTransactionStatus;
  external_reference: string;
  amount: number;
  currency: string;
  provider_link?: string;
  message?: string;
}

export interface SebpayOperator {
  slug: string;
  name: string;
  country_code: string;
  otp_required: boolean;
  ussd_code?: string;
}

export interface SebpayCountry {
  id: string;
  country_name: string;
  country_code: string;
  prefix: string;
  currency: { code: string; [key: string]: unknown };
}

const REFERENCE_PREFIX = "AUPAIR";

/** Encode l'ID utilisateur dans la référence externe — le webhook SebPay n'inclut pas d'email pour retrouver l'utilisateur. */
export function buildExternalReference(userId: string) {
  return `${REFERENCE_PREFIX}-${userId}-${Date.now()}`;
}

/** Extrait l'ID utilisateur d'une référence externe générée par buildExternalReference (l'ID cuid ne contient jamais de tiret). */
export function parseUserIdFromReference(reference: string): string | null {
  const parts = reference.split("-");
  if (parts.length !== 3 || parts[0] !== REFERENCE_PREFIX) return null;
  return parts[1];
}

/** Vérifie la signature HMAC-SHA256 du webhook (header X-SebPay-Signature) sur le corps brut de la requête. */
export function verifySebpaySignature(rawBody: string, signatureHeader: string | null, secretKey: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secretKey).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
