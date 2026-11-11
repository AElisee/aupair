import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";
import { getVisitorSeries, getVisitorStats } from "@/lib/site-visits";
import { VISITOR_RANGES, type VisitorGranularity } from "@/lib/site-visits-shared";

/**
 * GET ?granularity=day|week|month&count=N → courbe des visiteurs uniques + KPI globaux.
 * `count` doit être une des plages de `VISITOR_RANGES` (sinon la plage par défaut).
 */
export async function GET(req: Request) {
  const session = await requireAdminSession("dashboard.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const params = new URL(req.url).searchParams;
  const raw = params.get("granularity");
  const granularity: VisitorGranularity = raw === "week" || raw === "month" ? raw : "day";
  const allowed = VISITOR_RANGES[granularity];
  const requested = Number(params.get("count"));
  const count = allowed.includes(requested) ? requested : allowed[0];

  const [series, stats] = await Promise.all([getVisitorSeries(granularity, count), getVisitorStats()]);
  return NextResponse.json({ ...series, count, stats });
}
