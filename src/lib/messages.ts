import { prisma } from "@/lib/prisma";

export interface ConversationUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

/** Récupère nom affiché + avatar pour une liste d'utilisateurs (interlocuteurs de messagerie). */
export async function getConversationUsers(userIds: string[]): Promise<Map<string, ConversationUser>> {
  if (userIds.length === 0) return new Map();

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      auPairProfile: { select: { firstName: true, lastName: true, profilePhotoUrl: true } },
      familyProfile: { select: { familyPhotoUrl: true } },
    },
  });

  const map = new Map<string, ConversationUser>();
  for (const u of users) {
    const name = u.auPairProfile
      ? `${u.auPairProfile.firstName} ${u.auPairProfile.lastName}`.trim()
      : (u.name ?? "Utilisateur");
    const avatar = u.auPairProfile?.profilePhotoUrl || u.familyProfile?.familyPhotoUrl || u.image || null;
    map.set(u.id, { id: u.id, name, avatar, role: u.role });
  }
  return map;
}

/** Vérifie si l'un des deux utilisateurs a bloqué l'autre. */
export async function isBlockedEitherWay(userIdA: string, userIdB: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userIdA, blockedId: userIdB },
        { blockerId: userIdB, blockedId: userIdA },
      ],
    },
  });
  return !!block;
}
