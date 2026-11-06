import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { accountDeletedEmailHtml, accountRejectedEmailHtml } from "@/lib/email-templates";

/**
 * Informe l'utilisateur du rejet ou de la suppression de son inscription
 * (décision prise depuis /admin/moderation). Ne lève jamais d'erreur : renvoie
 * `false` si l'email n'a pas pu partir.
 */
export async function sendModerationDecisionEmail(params: {
  userId: string;
  role: "AU_PAIR" | "FAMILLE";
  decision: "reject" | "delete";
  reason?: string | null;
}): Promise<boolean> {
  const { userId, role, decision, reason } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, auPairProfile: { select: { firstName: true } } },
    });
    if (!user?.email) return false;

    const name = user.auPairProfile?.firstName || user.name || "";
    const result = await sendMail({
      to: user.email,
      noReply: true,
      ...(decision === "reject"
        ? {
            subject: "Votre inscription sur AuPair A.EU n'a pas été validée",
            html: accountRejectedEmailHtml({ name, role, reason, supportEmail: SUPPORT_EMAIL }),
          }
        : {
            subject: "Votre compte AuPair A.EU a été supprimé",
            html: accountDeletedEmailHtml({ name, reason, supportEmail: SUPPORT_EMAIL }),
          }),
    });
    if (!result.ok) {
      console.error(`[moderation] Email de ${decision} non envoyé à "${user.email}" (raison: ${result.reason}).`);
    }
    return result.ok;
  } catch (err) {
    console.error(`[moderation] Échec de l'email de ${decision} pour l'utilisateur ${userId}:`, err);
    return false;
  }
}
