/** Modèles HTML des emails transactionnels envoyés via Resend. */

const BRAND_COLOR = "#E87722";
const DARK_COLOR = "#1A1A2E";

function layout(content: string) {
  return `
    <div style="background-color:#F5F5F5;padding:32px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
        <div style="background:${DARK_COLOR};padding:20px 24px;">
          <span style="color:#ffffff;font-size:18px;font-weight:800;">AuPair <span style="color:${BRAND_COLOR};">A.EU</span></span>
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
  `);
}
