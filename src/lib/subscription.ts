import { prisma } from "./prisma";

/** Retourne l'abonnement actif et non expiré d'un utilisateur, s'il existe. */
export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(userId);
  return !!subscription;
}
