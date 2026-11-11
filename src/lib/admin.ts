import { auth } from "./auth";
import { prisma } from "./prisma";
import { sendMail } from "./mail";
import { accountValidatedEmailHtml } from "./email-templates";
import { ProfileStatus } from "@/generated/prisma/client";
import type { AdminPermission } from "./admin-permissions";

/**
 * Retourne la session si l'utilisateur connecté est ADMIN et détient au moins une des
 * permissions demandées (aucune = tout admin), sinon `null` (→ 403).
 */
export async function requireAdminSession(anyOf?: AdminPermission | AdminPermission[]) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const required = anyOf === undefined ? [] : Array.isArray(anyOf) ? anyOf : [anyOf];
  if (required.length > 0 && !required.some((p) => session.user.permissions?.includes(p))) return null;
  return session;
}

/** Statuts qui retirent le compte de la plateforme : date, admin et motif sont conservés sur le profil */
const SANCTION_STATUSES: ProfileStatus[] = [ProfileStatus.SUSPENDED, ProfileStatus.DELETED, ProfileStatus.REJECTED];

/** Efface la trace de la dernière suspension / suppression (profil réactivé ou remis en attente) */
const CLEARED_STATUS_CHANGE = { statusChangedAt: null, statusChangedById: null, statusChangedBy: null, statusReason: null };

type StatusActor = { id: string; name?: string | null; email?: string | null };

/**
 * Met à jour le statut du profil au pair ou famille d'un utilisateur.
 * Lors d'une première validation (PENDING -> ACTIVE), envoie un email
 * informant l'utilisateur que son compte a été validé.
 * Une suspension, suppression ou un rejet enregistre la date et l'heure, l'admin (nom copié)
 * et le motif sur le profil ; une réactivation les efface (l'historique reste au journal).
 */
export async function setProfileStatus(
  userId: string,
  role: "AU_PAIR" | "FAMILLE",
  status: ProfileStatus,
  admin: StatusActor,
  baseUrl?: string,
  reason?: string
) {
  const data =
    status === ProfileStatus.ACTIVE
      ? { status, validatedAt: new Date(), validatedBy: admin.id, ...CLEARED_STATUS_CHANGE }
      : SANCTION_STATUSES.includes(status)
        ? {
            status,
            statusChangedAt: new Date(),
            statusChangedById: admin.id,
            statusChangedBy: admin.name || admin.email || null,
            statusReason: reason?.trim() || null,
          }
        : { status };

  // Première validation : profil en attente, rejeté, ou jamais validé puis suspendu/supprimé
  // (cf. src/lib/profile-status.ts). L'email « compte validé » n'est envoyé que dans ce cas.
  let wasPending = false;
  const isAwaitingValidation = (b: { status: ProfileStatus; validatedAt: Date | null }) =>
    b.status === ProfileStatus.PENDING ||
    b.status === ProfileStatus.REJECTED ||
    (!b.validatedAt && (b.status === ProfileStatus.SUSPENDED || b.status === ProfileStatus.DELETED));
  let recipient: { email: string; name: string } | null = null;

  if (role === "AU_PAIR") {
    const before = await prisma.auPairProfile.findUnique({
      where: { userId },
      select: { status: true, validatedAt: true, firstName: true, user: { select: { email: true } } },
    });
    wasPending = !!before && isAwaitingValidation(before);
    if (before) recipient = { email: before.user.email, name: before.firstName };
    await prisma.auPairProfile.update({ where: { userId }, data });
  } else {
    const before = await prisma.familyProfile.findUnique({
      where: { userId },
      select: { status: true, validatedAt: true, user: { select: { email: true, name: true } } },
    });
    wasPending = !!before && isAwaitingValidation(before);
    if (before) recipient = { email: before.user.email, name: before.user.name ?? "" };
    await prisma.familyProfile.update({ where: { userId }, data });
  }

  // Une inscription supprimée avant validation puis validée doit pouvoir se reconnecter
  if (status === ProfileStatus.ACTIVE && wasPending) {
    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  }

  if (status === ProfileStatus.ACTIVE && wasPending && recipient) {
    const dashboardPath = role === "AU_PAIR" ? "/dashboard/au-pair" : "/dashboard/famille";
    const result = await sendMail({
      to: recipient.email,
      subject: "Votre compte AuPair A.EU a été validé !",
      noReply: true,
      html: accountValidatedEmailHtml({
        name: recipient.name,
        role,
        dashboardUrl: `${baseUrl ?? ""}${dashboardPath}`,
      }),
    });
    if (!result.ok) {
      console.error(
        `[admin] L'email de validation de compte n'a pas pu être envoyé à "${recipient.email}" (raison: ${result.reason}).`
      );
    }
  }

  // La suppression est un "soft delete" (corbeille) : on bloque la connexion
  // mais on conserve les données pour permettre une restauration.
  if (status === ProfileStatus.DELETED) {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }
}

/**
 * Restaure un compte précédemment placé dans la corbeille : réactive la
 * connexion et remet le profil au statut ACTIVE (s'il avait déjà été validé)
 * ou PENDING (s'il attendait encore une première validation).
 */
export async function restoreProfile(userId: string, role: "AU_PAIR" | "FAMILLE") {
  let status: ProfileStatus;

  if (role === "AU_PAIR") {
    const profile = await prisma.auPairProfile.findUnique({ where: { userId }, select: { validatedAt: true } });
    status = profile?.validatedAt ? ProfileStatus.ACTIVE : ProfileStatus.PENDING;
    await prisma.auPairProfile.update({ where: { userId }, data: { status, ...CLEARED_STATUS_CHANGE } });
  } else {
    const profile = await prisma.familyProfile.findUnique({ where: { userId }, select: { validatedAt: true } });
    status = profile?.validatedAt ? ProfileStatus.ACTIVE : ProfileStatus.PENDING;
    await prisma.familyProfile.update({ where: { userId }, data: { status, ...CLEARED_STATUS_CHANGE } });
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

  return status;
}

/** Supprime définitivement un utilisateur et toutes ses données associées (suppression en cascade). */
export async function hardDeleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
