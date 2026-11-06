import { prisma } from "./prisma";
import { AU_PAIRS_BASE_COUNT, FAMILIES_BASE_COUNT } from "./constants";

export type PublicStats = { auPairs: number; families: number };

/** Compteurs publics : base + profils inscrits (les comptes supprimés ou rejetés ne comptent pas). */
export async function getPublicStats(): Promise<PublicStats> {
  const [auPairs, families] = await Promise.all([
    prisma.auPairProfile.count({ where: { status: { notIn: ["DELETED", "REJECTED"] } } }),
    prisma.familyProfile.count({ where: { status: { notIn: ["DELETED", "REJECTED"] } } }),
  ]);
  return {
    auPairs: AU_PAIRS_BASE_COUNT + auPairs,
    families: FAMILIES_BASE_COUNT + families,
  };
}
