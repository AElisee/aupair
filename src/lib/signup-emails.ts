import { SUPPORT_EMAIL } from "./constants";
import { sendMail } from "./mail";
import { accountCreatedEmailHtml, newSignupAdminEmailHtml } from "./email-templates";

/**
 * Emails envoyés à chaque inscription (formulaire, ou finalisation d'un compte Google/Facebook) :
 * confirmation à l'utilisateur (compte en attente de validation sous 24-48h) et notification à
 * l'équipe support. `completedExisting` : un compte déjà existant vient de compléter ses champs
 * obligatoires (son statut ne change pas) — seul le support est prévenu, pour relecture.
 * Ne lève jamais : un échec d'envoi ne doit pas faire échouer l'inscription.
 */
export async function sendSignupEmails(params: {
  userId: string;
  email: string;
  firstName: string;
  fullName: string;
  role: "AU_PAIR" | "FAMILLE";
  country?: string | null;
  baseUrl: string;
  completedExisting?: boolean;
}) {
  const { userId, email, firstName, fullName, role, country, baseUrl, completedExisting = false } = params;

  const [userMail, adminMail] = await Promise.all([
    completedExisting
      ? Promise.resolve({ ok: true as const })
      : sendMail({
          to: email,
          subject: "Votre compte AuPair A.EU a bien été créé",
          noReply: true,
          html: accountCreatedEmailHtml({ name: firstName, role }),
        }),
    sendMail({
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[${completedExisting ? "Profil complété" : "Inscription"}] ${role === "AU_PAIR" ? "Au pair" : "Famille"} — ${fullName}`,
      html: newSignupAdminEmailHtml({
        name: fullName,
        email,
        role,
        country,
        profileUrl: `${baseUrl}/admin/profil/${userId}?role=${role}`,
      }),
    }),
  ]);

  if (!userMail.ok) {
    console.error(`[signup] Email de bienvenue non envoyé à "${email}" (raison: ${userMail.reason}).`);
  }
  if (!adminMail.ok) {
    console.error(`[signup] Notification d'inscription non envoyée à "${SUPPORT_EMAIL}" (raison: ${adminMail.reason}).`);
  }
}
