import { ProfileStatus } from "@/generated/prisma/client";

/**
 * Répartition des profils entre /admin/utilisateurs et /admin/moderation.
 *
 * `validatedAt` marque un profil validé au moins une fois (cf. `restoreProfile`).
 * - Modération « En attente » : `PENDING`.
 * - Modération « Rejetées / supprimées » : `REJECTED`, ou un profil jamais validé qui a été
 *   suspendu ou supprimé (rejets faits avant l'existence du statut `REJECTED`).
 * - Utilisateurs : tout le reste, c.-à-d. les comptes validés (corbeille comprise).
 */

const NEVER_VALIDATED_REFUSED = {
  validatedAt: null,
  status: { in: [ProfileStatus.SUSPENDED, ProfileStatus.DELETED] },
};

export const REFUSED_PROFILE_WHERE = {
  OR: [{ status: ProfileStatus.REJECTED }, NEVER_VALIDATED_REFUSED],
};

export const VALIDATED_PROFILE_WHERE = {
  status: { notIn: [ProfileStatus.PENDING, ProfileStatus.REJECTED] },
  NOT: NEVER_VALIDATED_REFUSED,
};
