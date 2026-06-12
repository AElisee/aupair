import { prisma } from "./prisma";
import { getAppSettings } from "./settings";
import { createNotification } from "./notifications";

/** Retourne la clé année-semaine ISO 8601 d'une date, ex: "2026-W24". */
export function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // lundi = 0 ... dimanche = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // jeudi de la semaine courante
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  const weekNum = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

async function getDisplayName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { auPairProfile: true, familyProfile: true },
  });

  if (user?.auPairProfile) {
    return `${user.auPairProfile.firstName} ${user.auPairProfile.lastName}`;
  }
  return user?.name ?? "Un utilisateur";
}

interface RegisterProfileViewInput {
  viewerId: string;
  profileUserId: string;
  profileRole: "AU_PAIR" | "FAMILLE";
}

/**
 * Enregistre la consultation d'un profil par un visiteur.
 * N'incrémente `profileViews` et ne notifie le propriétaire qu'une fois par
 * visiteur unique et par semaine ISO (les revisites dans la même semaine sont ignorées).
 */
export async function registerProfileView({ viewerId, profileUserId, profileRole }: RegisterProfileViewInput) {
  if (viewerId === profileUserId) return;

  const weekKey = getISOWeekKey(new Date());

  const existing = await prisma.profileView.findUnique({
    where: { viewerId_profileUserId: { viewerId, profileUserId } },
  });

  let shouldCount = false;

  if (!existing) {
    try {
      await prisma.profileView.create({
        data: { viewerId, profileUserId, weekKey },
      });
      shouldCount = true;
    } catch {
      // Course concurrente : un autre appel a déjà créé l'enregistrement, on l'ignore.
    }
  } else if (existing.weekKey !== weekKey) {
    const updated = await prisma.profileView.updateMany({
      where: { viewerId, profileUserId, weekKey: existing.weekKey },
      data: { weekKey, lastViewedAt: new Date() },
    });
    shouldCount = updated.count > 0;
  } else {
    await prisma.profileView.update({
      where: { viewerId_profileUserId: { viewerId, profileUserId } },
      data: { lastViewedAt: new Date() },
    });
  }

  if (!shouldCount) return;

  if (profileRole === "AU_PAIR") {
    await prisma.auPairProfile.update({
      where: { userId: profileUserId },
      data: { profileViews: { increment: 1 } },
    });
  } else {
    await prisma.familyProfile.update({
      where: { userId: profileUserId },
      data: { profileViews: { increment: 1 } },
    });
  }

  const settings = await getAppSettings();
  if (settings.notifyProfileViewEnabled) {
    const viewerName = await getDisplayName(viewerId);
    const link =
      profileRole === "AU_PAIR"
        ? `/dashboard/au-pair/famille/${viewerId}`
        : `/dashboard/famille/au-pair/${viewerId}`;

    await createNotification({
      userId: profileUserId,
      type: "PROFILE_VIEW",
      title: "Nouvelle vue de profil",
      content: `${viewerName} a consulté votre profil.`,
      link,
    });
  }
}
