import { prisma } from "./prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date UTC au format AAAA-MM-JJ, `offset` jours avant aujourd'hui */
export const visitDayKey = (offset = 0, now = new Date()) =>
  new Date(now.getTime() - offset * DAY_MS).toISOString().slice(0, 10);

export type VisitorStats = {
  today: number;
  last7d: number;
  last30d: number;
  prev30d: number;
  total: number;
};

/** Visiteurs uniques (un même navigateur compte une fois par période) */
export async function getVisitorStats(): Promise<VisitorStats> {
  const today = visitDayKey(0);
  const d7 = visitDayKey(6);
  const d30 = visitDayKey(29);
  const d60 = visitDayKey(59);

  const [row] = await prisma.$queryRaw<VisitorStats[]>`
    SELECT
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" = ${today})::int AS "today",
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${d7})::int AS "last7d",
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${d30})::int AS "last30d",
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${d60} AND "day" < ${d30})::int AS "prev30d",
      COUNT(DISTINCT "visitorId")::int AS "total"
    FROM "site_visits"
  `;
  return row ?? { today: 0, last7d: 0, last30d: 0, prev30d: 0, total: 0 };
}
