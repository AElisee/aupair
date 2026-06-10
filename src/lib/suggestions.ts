/**
 * Tri générique des suggestions (au pairs ↔ familles) :
 * - si assez de profils correspondent aux critères éliminatoires (pays/âge/genre),
 *   on priorise ceux dont le score "favoris + langues" est au moins égal à la moyenne ;
 * - sinon (pas assez de données), on relâche ces critères et on classe par score global,
 *   puis on complète par les profils les plus récents.
 */
interface ScoredCandidate {
  score: number;
  softScore: number;
  eligible: boolean;
  createdAt: Date;
}

export function rankSuggestions<T extends ScoredCandidate>(scored: T[]): T[] {
  const eligible = scored.filter((s) => s.eligible);

  if (eligible.length >= 3) {
    const average = eligible.reduce((sum, s) => sum + s.softScore, 0) / eligible.length;
    const sorted = [...eligible].sort(
      (a, b) => b.softScore - a.softScore || b.createdAt.getTime() - a.createdAt.getTime()
    );
    return [...sorted.filter((s) => s.softScore >= average), ...sorted.filter((s) => s.softScore < average)];
  }

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());
  const matchedSet = new Set(matches);
  const fallback = scored
    .filter((s) => !matchedSet.has(s))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return [...matches, ...fallback];
}
