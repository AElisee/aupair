import { Resend } from "resend";
import { getAppSettings } from "./settings";

export type SendMailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "NOT_CONFIGURED" | "SEND_ERROR" | "EXCEPTION"; error?: unknown };

function maskApiKey(key: string) {
  if (key.length <= 8) return "***";
  return `${key.slice(0, 6)}...${key.slice(-4)} (longueur: ${key.length})`;
}

/**
 * Remplace la partie locale de l'adresse d'expédition par "no-reply", en gardant
 * le nom affiché et le domaine (déjà vérifié chez Resend) :
 * "AuPair A.EU <contact@domaine.com>" -> "AuPair A.EU <no-reply@domaine.com>".
 */
function toNoReplyAddress(from: string) {
  return from.replace(/[^\s<@]+@([^\s>]+)/, "no-reply@$1");
}

/**
 * Envoie un email via l'API officielle Resend (`resend.emails.send`), en utilisant
 * la clé API et l'adresse d'expédition configurées par l'admin (Paramètres > Email),
 * jamais via des variables d'environnement.
 *
 * Ne lève jamais : une erreur d'envoi ne doit pas bloquer la transaction principale.
 * Le résultat permet à l'appelant de journaliser/réagir si besoin.
 */
export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  /** Envoie depuis no-reply@<domaine> pour que le destinataire ne puisse pas répondre. */
  noReply?: boolean;
}): Promise<SendMailResult> {
  const { to, subject, html, noReply } = params;

  const settings = await getAppSettings();
  const apiKey = settings.resendApiKey?.trim();
  const configuredFrom = settings.emailFrom?.trim();
  const from = configuredFrom && noReply ? toNoReplyAddress(configuredFrom) : configuredFrom;

  console.log(
    `[mail] Préparation de l'envoi — to="${to}", from="${from ?? "MANQUANT"}", ` +
      `subject="${subject}", RESEND_API_KEY=${apiKey ? maskApiKey(apiKey) : "MANQUANTE"}`
  );

  if (!apiKey || !from) {
    console.error(
      `[mail] Envoi annulé — configuration Resend incomplète (Paramètres admin > Email). ` +
        `Clé API: ${apiKey ? "définie" : "MANQUANTE"}, expéditeur: ${from ? "défini" : "MANQUANT"}.`
    );
    return { ok: false, reason: "NOT_CONFIGURED" };
  }

  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    console.log(`[mail] Réponse complète de Resend pour "${to}":`, JSON.stringify(response, null, 2));

    const { data, error } = response;

    if (error) {
      console.error(`[mail] Resend a refusé l'envoi à "${to}":`, error);
      return { ok: false, reason: "SEND_ERROR", error };
    }

    console.log(`[mail] Email envoyé avec succès à "${to}" — id Resend: ${data?.id ?? "?"}`);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error(`[mail] Exception lors de l'envoi de l'email à "${to}" via Resend:`, err);
    return { ok: false, reason: "EXCEPTION", error: err };
  }
}
