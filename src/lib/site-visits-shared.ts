/** Types et constantes de la courbe des visiteurs, partagés client / serveur (aucun import serveur) */

export type VisitorGranularity = "day" | "week" | "month";

/** Nombre de périodes proposées par granularité (la première est la valeur par défaut) */
export const VISITOR_RANGES: Record<VisitorGranularity, number[]> = {
  day: [30, 7, 90],
  week: [12, 26, 52],
  month: [12, 6, 24],
};

/**
 * `period` : AAAA-MM-JJ (jour, ou lundi de la semaine) ou AAAA-MM (mois), en UTC.
 * Un visiteur connecté au moins une fois sur la période compte « avec compte », sinon « sans compte ».
 */
export type VisitorPoint = { period: string; withAccount: number; withoutAccount: number; visitors: number };

export type VisitorSeries = {
  granularity: VisitorGranularity;
  points: VisitorPoint[];
  /** Visiteurs uniques sur toute la plage (un visiteur présent sur plusieurs périodes compte une fois) */
  rangeUnique: number;
  /** Dont visiteurs connectés au moins une fois sur la plage */
  rangeWithAccount: number;
  /** Visiteurs uniques sur la plage de même durée juste avant */
  prevRangeUnique: number;
};
