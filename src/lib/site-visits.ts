import { prisma } from "./prisma";
import type { VisitorGranularity, VisitorSeries } from "./site-visits-shared";

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

// ─── Courbe des visiteurs (/admin/visiteurs) ─────────────────────────────────

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Lundi (UTC) de la semaine contenant `d` */
function weekStart(d: Date) {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day;
}

/**
 * Clés des `count` périodes à afficher (plus ancienne d'abord) et bornes de la plage :
 * jour = AAAA-MM-JJ, semaine = AAAA-MM-JJ du lundi, mois = AAAA-MM (dates UTC, comme `day`).
 */
function periodKeys(granularity: VisitorGranularity, count: number, now = new Date()) {
  const keys: string[] = [];
  let start: Date;
  let prevStart: Date;
  if (granularity === "day") {
    for (let i = count - 1; i >= 0; i--) keys.push(visitDayKey(i, now));
    start = new Date(`${keys[0]}T00:00:00Z`);
    prevStart = new Date(start.getTime() - count * DAY_MS);
  } else if (granularity === "week") {
    const monday = weekStart(now);
    for (let i = count - 1; i >= 0; i--) keys.push(ymd(new Date(monday.getTime() - i * 7 * DAY_MS)));
    start = new Date(`${keys[0]}T00:00:00Z`);
    prevStart = new Date(start.getTime() - count * 7 * DAY_MS);
  } else {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    for (let i = count - 1; i >= 0; i--) keys.push(ymd(new Date(Date.UTC(y, m - i, 1))).slice(0, 7));
    start = new Date(Date.UTC(y, m - (count - 1), 1));
    prevStart = new Date(Date.UTC(y, m - (2 * count - 1), 1));
  }
  return { keys, start: ymd(start), prevStart: ymd(prevStart) };
}

/** Visiteurs uniques par jour, semaine (lundi → dimanche) ou mois, périodes sans visite à 0 */
export async function getVisitorSeries(granularity: VisitorGranularity, count: number): Promise<VisitorSeries> {
  const { keys, start, prevStart } = periodKeys(granularity, count);

  // Expression de regroupement fixe par granularité (aucune donnée utilisateur dans le SQL).
  // Sous-requête : un visiteur par période, « avec compte » s'il s'est connecté au moins une fois.
  type Row = { period: string; withAccount: number; withoutAccount: number };
  const rows =
    granularity === "day"
      ? await prisma.$queryRaw<Row[]>`
          SELECT "period",
                 COUNT(*) FILTER (WHERE "member")::int AS "withAccount",
                 COUNT(*) FILTER (WHERE NOT "member")::int AS "withoutAccount"
          FROM (
            SELECT "day" AS "period", "visitorId", bool_or("withAccount") AS "member"
            FROM "site_visits" WHERE "day" >= ${start} GROUP BY 1, 2
          ) v GROUP BY 1`
      : granularity === "week"
        ? await prisma.$queryRaw<Row[]>`
            SELECT "period",
                   COUNT(*) FILTER (WHERE "member")::int AS "withAccount",
                   COUNT(*) FILTER (WHERE NOT "member")::int AS "withoutAccount"
            FROM (
              SELECT to_char(date_trunc('week', "day"::date), 'YYYY-MM-DD') AS "period", "visitorId",
                     bool_or("withAccount") AS "member"
              FROM "site_visits" WHERE "day" >= ${start} GROUP BY 1, 2
            ) v GROUP BY 1`
        : await prisma.$queryRaw<Row[]>`
            SELECT "period",
                   COUNT(*) FILTER (WHERE "member")::int AS "withAccount",
                   COUNT(*) FILTER (WHERE NOT "member")::int AS "withoutAccount"
            FROM (
              SELECT substring("day", 1, 7) AS "period", "visitorId", bool_or("withAccount") AS "member"
              FROM "site_visits" WHERE "day" >= ${start} GROUP BY 1, 2
            ) v GROUP BY 1`;

  // Inscriptions (comptes au pair / famille créés) par période, mêmes clés UTC que les visites
  type SignupRow = { period: string; signups: number };
  const signupRows =
    granularity === "day"
      ? await prisma.$queryRaw<SignupRow[]>`
          SELECT to_char("createdAt", 'YYYY-MM-DD') AS "period", COUNT(*)::int AS "signups"
          FROM "users"
          WHERE "createdAt" >= ${start}::timestamp AND "role"::text IN ('AU_PAIR', 'FAMILLE')
          GROUP BY 1`
      : granularity === "week"
        ? await prisma.$queryRaw<SignupRow[]>`
            SELECT to_char(date_trunc('week', "createdAt"), 'YYYY-MM-DD') AS "period", COUNT(*)::int AS "signups"
            FROM "users"
            WHERE "createdAt" >= ${start}::timestamp AND "role"::text IN ('AU_PAIR', 'FAMILLE')
            GROUP BY 1`
        : await prisma.$queryRaw<SignupRow[]>`
            SELECT to_char("createdAt", 'YYYY-MM') AS "period", COUNT(*)::int AS "signups"
            FROM "users"
            WHERE "createdAt" >= ${start}::timestamp AND "role"::text IN ('AU_PAIR', 'FAMILLE')
            GROUP BY 1`;

  const [totals] = await prisma.$queryRaw<{ current: number; currentWithAccount: number; previous: number }[]>`
    SELECT
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${start})::int AS "current",
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${start} AND "withAccount")::int AS "currentWithAccount",
      COUNT(DISTINCT "visitorId") FILTER (WHERE "day" >= ${prevStart} AND "day" < ${start})::int AS "previous"
    FROM "site_visits" WHERE "day" >= ${prevStart}
  `;

  const byPeriod = new Map(rows.map((r) => [r.period, r]));
  const signupsByPeriod = new Map(signupRows.map((r) => [r.period, r.signups]));
  return {
    granularity,
    points: keys.map((period) => {
      const row = byPeriod.get(period);
      const withAccount = row?.withAccount ?? 0;
      const withoutAccount = row?.withoutAccount ?? 0;
      return {
        period,
        withAccount,
        withoutAccount,
        visitors: withAccount + withoutAccount,
        signups: signupsByPeriod.get(period) ?? 0,
      };
    }),
    rangeUnique: totals?.current ?? 0,
    rangeWithAccount: totals?.currentWithAccount ?? 0,
    prevRangeUnique: totals?.previous ?? 0,
  };
}
