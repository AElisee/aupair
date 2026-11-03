import { prisma } from "./prisma";
import { getClientIp } from "./rate-limit";
import type { AdminLogAction } from "./admin-activity-shared";

type Actor = { user: { id?: string | null; name?: string | null; email?: string | null } };

/**
 * Enregistre une action d'administrateur dans le journal. Attendu (pas d'`after()`, qui ne
 * s'exécute pas sur Vercel) mais ne lève jamais : un échec du journal ne bloque pas l'action.
 */
export async function logAdminActivity(
  actor: Actor,
  entry: {
    action: AdminLogAction;
    targetType?: string;
    targetId?: string | null;
    targetLabel?: string | null;
    details?: Record<string, unknown>;
  },
  req?: Request
) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId: actor.user.id ?? null,
        adminName: actor.user.name ?? null,
        adminEmail: actor.user.email ?? null,
        action: entry.action,
        module: entry.action.split(".")[0],
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        targetLabel: entry.targetLabel?.slice(0, 200) ?? null,
        details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
        ip: req ? getClientIp(req) : null,
      },
    });
  } catch (err) {
    console.error(`[admin-activity] Échec d'écriture du journal (${entry.action}) :`, err);
  }
}

/** Libellé lisible d'un utilisateur (nom, sinon email) pour le journal — à lire avant une suppression */
export async function getUserLabel(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      auPairProfile: { select: { firstName: true, lastName: true } },
    },
  });
  if (!user) return null;
  const auPair = user.auPairProfile ? `${user.auPairProfile.firstName} ${user.auPairProfile.lastName}`.trim() : "";
  return auPair || user.name || user.email;
}

/** Durée de conservation du journal d'activité */
export const ADMIN_LOG_RETENTION_MONTHS = 12;

/** Supprime les lignes du journal plus vieilles que la durée de conservation. Renvoie le nombre supprimé. */
export async function purgeOldAdminActivity(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - ADMIN_LOG_RETENTION_MONTHS);
  const { count } = await prisma.adminActivityLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return { count, cutoff };
}
