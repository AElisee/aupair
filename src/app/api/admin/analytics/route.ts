import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { getCountryFlagMap } from "@/lib/countries";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_RANGE = 6;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function lastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { key: monthKey(d), label: MONTH_LABELS[d.getMonth()] };
  });
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const since = new Date();
  since.setMonth(since.getMonth() - (MONTHS_RANGE - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [
    users,
    subscriptions,
    auPairStatusGroups,
    familyStatusGroups,
    topOriginCountries,
    flagMap,
  ] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, role: true } }),
    prisma.subscription.findMany({
      where: { createdAt: { gte: since }, currency: "EUR", status: { in: ["ACTIVE", "EXPIRED"] } },
      select: { createdAt: true, amount: true },
    }),
    prisma.auPairProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.familyProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.auPairProfile.groupBy({
      by: ["countryOfOrigin"],
      _count: { _all: true },
      orderBy: { _count: { countryOfOrigin: "desc" } },
      take: 5,
    }),
    getCountryFlagMap(),
  ]);

  const months = lastMonths(MONTHS_RANGE);

  const signupsByMonth = months.map(({ key, label }) => ({
    month: label,
    count: users.filter((u) => monthKey(u.createdAt) === key).length,
  }));

  const revenueByMonth = months.map(({ key, label }) => ({
    month: label,
    amount: subscriptions
      .filter((s) => monthKey(s.createdAt) === key)
      .reduce((sum, s) => sum + s.amount, 0),
  }));

  const profileStatusCounts = (groups: { status: string; _count: { _all: number } }[]) => {
    const result: Record<string, number> = { PENDING: 0, ACTIVE: 0, HIDDEN: 0, SUSPENDED: 0, DELETED: 0 };
    for (const g of groups) result[g.status] = g._count._all;
    return result;
  };

  const topCountries = topOriginCountries.map((c) => ({
    country: c.countryOfOrigin,
    flag: flagMap[c.countryOfOrigin] ?? "",
    count: c._count._all,
  }));

  return NextResponse.json({
    signupsByMonth,
    revenueByMonth,
    auPairStatus: profileStatusCounts(auPairStatusGroups),
    familyStatus: profileStatusCounts(familyStatusGroups),
    topCountries,
  });
}
