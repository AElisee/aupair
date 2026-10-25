/** Modèles HTML des emails transactionnels envoyés via Resend. */

import { escapeHtml } from "./utils";

const BRAND_COLOR = "#E87722";
const DARK_COLOR = "#1A1A2E";
const PUBLIC_SITE_URL = "https://www.aupairaeu.com";

/**
 * Le logo est chargé par la messagerie du destinataire (Gmail, Outlook…), qui ne peut pas
 * atteindre localhost ni une IP privée : dans ce cas on pointe vers le site en production.
 */
function publicAssetBaseUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (!appUrl) return PUBLIC_SITE_URL;
  try {
    const { protocol, hostname } = new URL(appUrl);
    const isPrivate =
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$)/.test(hostname);
    return protocol === "https:" && !isPrivate ? appUrl : PUBLIC_SITE_URL;
  } catch {
    return PUBLIC_SITE_URL;
  }
}

const LOGO_URL = `${publicAssetBaseUrl()}/logo-email.png`;

function layout(content: string) {
  return `
    <div style="background-color:#F5F5F5;padding:32px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
        <div style="background:${DARK_COLOR};padding:20px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="AuPair A.EU" width="38" height="32" style="width:38px;height:32px;display:inline-block;border:0;" />
        </div>
        <div style="padding:32px 24px;color:#333333;font-size:14px;line-height:1.6;">
          ${content}
        </div>
        <div style="padding:16px 24px;background:#FAFAFA;color:#999999;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} AuPair A.EU — Tous droits réservés.
        </div>
      </div>
    </div>
  `;
}

/** Email envoyé lors d'une demande de réinitialisation de mot de passe. */
export function passwordResetEmailHtml(params: {
  name?: string | null;
  resetUrl: string;
  expiresAt: Date;
}) {
  const { name, resetUrl, expiresAt } = params;
  const expiryLabel = expiresAt.toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return layout(`
    <p>Bonjour ${name?.trim() || ""},</p>
    <p>Vous avez demandé la réinitialisation du mot de passe de votre compte AuPair A.EU.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;display:inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color:#888888;font-size:13px;">
      Ce lien expire le <strong>${expiryLabel}</strong>.
    </p>
    <p style="color:#888888;font-size:13px;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br />
      <a href="${resetUrl}" style="color:${BRAND_COLOR};word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="color:#888888;font-size:13px;">
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email — votre mot de passe restera inchangé.
    </p>
    <p>— L'équipe AuPair A.EU</p>
  `);
}

/** Email envoyé à l'utilisateur juste après son inscription (compte en attente de validation). */
export function accountCreatedEmailHtml(params: {
  name?: string | null;
  role: "AU_PAIR" | "FAMILLE";
}) {
  const { name, role } = params;
  const roleLabel = role === "AU_PAIR" ? "au pair" : "famille d'accueil";

  return layout(`
    <p>Bonjour ${escapeHtml(name?.trim() || "")},</p>
    <p>Bienvenue sur AuPair A.EU ! Votre compte ${roleLabel} a bien été créé.</p>
    <p>Notre équipe va maintenant vérifier votre profil. Cette validation intervient généralement <strong>sous 24h à 48h</strong>, et vous recevrez un email dès que votre compte sera actif.</p>
    <p>— L'équipe AuPair A.EU</p>
    <p style="color:#888888;font-size:12px;">
      Cet email est envoyé automatiquement, merci de ne pas y répondre.
    </p>
  `);
}

/** Notification interne envoyée à l'équipe à chaque nouvelle inscription. */
export function newSignupAdminEmailHtml(params: {
  name: string;
  email: string;
  role: "AU_PAIR" | "FAMILLE";
  country?: string | null;
  profileUrl: string;
}) {
  const { name, email, role, country, profileUrl } = params;
  const roleLabel = role === "AU_PAIR" ? "Au pair" : "Famille d'accueil";
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#888888;white-space:nowrap;">${label}</td>
      <td style="padding:6px 0;">${escapeHtml(value)}</td>
    </tr>`;

  return layout(`
    <p>Une nouvelle inscription vient d'être enregistrée sur la plateforme.</p>
    <table style="border-collapse:collapse;font-size:14px;margin:16px 0;">
      ${row("Type", roleLabel)}
      ${row("Nom", name)}
      ${row("Email", email)}
      ${country ? row(role === "AU_PAIR" ? "Pays d'origine" : "Pays d'accueil", country) : ""}
      ${row("Date", new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }))}
    </table>
    <p>Le profil est en attente de validation.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${profileUrl}" style="background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;display:inline-block;">
        Voir le profil
      </a>
    </div>
  `);
}

/** Email envoyé lorsqu'un administrateur valide le profil d'un utilisateur. */
export function accountValidatedEmailHtml(params: {
  name?: string | null;
  role: "AU_PAIR" | "FAMILLE";
  dashboardUrl: string;
}) {
  const { name, role, dashboardUrl } = params;
  const roleLabel = role === "AU_PAIR" ? "au pair" : "famille d'accueil";

  return layout(`
    <p>Bonjour ${name?.trim() || ""},</p>
    <p>Bonne nouvelle ! Votre profil ${roleLabel} a été vérifié et validé par notre équipe. Votre compte est maintenant actif et visible sur AuPair A.EU.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${dashboardUrl}" style="background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;display:inline-block;">
        Accéder à mon tableau de bord
      </a>
    </div>
    <p>— L'équipe AuPair A.EU</p>
    <p style="color:#888888;font-size:12px;">
      Cet email est envoyé automatiquement, merci de ne pas y répondre.
    </p>
  `);
}

/** Email libre rédigé par un administrateur depuis /admin/utilisateurs. */
export function adminMessageEmailHtml(params: { message: string }) {
  const body = escapeHtml(params.message.trim()).replace(/\r?\n/g, "<br />");

  return layout(`
    <p>${body}</p>
    <p>— L'équipe AuPair A.EU</p>
  `);
}
