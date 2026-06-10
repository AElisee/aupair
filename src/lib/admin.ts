import { auth } from "./auth";
import { prisma } from "./prisma";
import { ProfileStatus } from "@/generated/prisma/client";

/** Retourne la session si l'utilisateur connecté est ADMIN, sinon `null`. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

/** Met à jour le statut du profil au pair ou famille d'un utilisateur. */
export async function setProfileStatus(
  userId: string,
  role: "AU_PAIR" | "FAMILLE",
  status: ProfileStatus,
  adminId: string
) {
  const data =
    status === ProfileStatus.ACTIVE
      ? { status, validatedAt: new Date(), validatedBy: adminId }
      : { status };

  if (role === "AU_PAIR") {
    await prisma.auPairProfile.update({ where: { userId }, data });
  } else {
    await prisma.familyProfile.update({ where: { userId }, data });
  }
}
