import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { formatCurrency, formatRevenueByCurrency } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalAuPairs,
    totalFamilies,
    signups30d,
    signupsPrev30d,
    revenueByCurrency30d,
    totalRevenueByCurrency,
    activeSubscriptions,
    pendingAuPairs,
    pendingFamilies,
    openReports,
    recentAuPairs,
    recentFamilies,
    recentSubscriptions,
    flagMap,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.auPairProfile.count(),
    prisma.familyProfile.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.subscription.groupBy({
      by: ["currency"],
      _sum: { amount: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.subscription.groupBy({
      by: ["currency"],
      _sum: { amount: true },
      where: { status: { in: ["ACTIVE", "EXPIRED"] } },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.auPairProfile.count({ where: { status: ProfileStatus.PENDING } }),
    prisma.familyProfile.count({ where: { status: ProfileStatus.PENDING } }),
    prisma.report.count({ where: { isResolved: false } }),
    prisma.auPairProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { userId: true, firstName: true, lastName: true, countryOfOrigin: true, status: true, createdAt: true, profilePhotoUrl: true },
    }),
    prisma.familyProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { userId: true, country: true, status: true, createdAt: true, familyPhotoUrl: true, user: { select: { name: true } } },
    }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, amount: true, currency: true, paymentMethod: true, status: true, createdAt: true,
        user: { select: { name: true } },
      },
    }),
    getCountryFlagMap(),
  ]);

  const pendingProfiles = pendingAuPairs + pendingFamilies;

  // Variation en % des inscriptions vs les 30 jours précédents (formatée côté client selon la langue)
  const signupsChangePct =
    signupsPrev30d === 0
      ? signups30d > 0 ? 100 : 0
      : Math.round(((signups30d - signupsPrev30d) / signupsPrev30d) * 100);

  const recentUsers = [
    ...recentAuPairs.map((p) => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      role: "AU_PAIR" as const,
      country: `${flagMap[p.countryOfOrigin] ?? ""} ${p.countryOfOrigin}`.trim(),
      status: p.status,
      date: p.createdAt.toISOString(),
      createdAt: p.createdAt,
      photoUrl: p.profilePhotoUrl ?? "",
    })),
    ...recentFamilies.map((p) => ({
      id: p.userId,
      name: p.user.name ?? "",
      role: "FAMILLE" as const,
      country: `${flagMap[p.country] ?? ""} ${p.country}`.trim(),
      status: p.status,
      date: p.createdAt.toISOString(),
      createdAt: p.createdAt,
      photoUrl: p.familyPhotoUrl ?? "",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(({ id, name, role, country, status, date, photoUrl }) => ({ id, name, role, country, status, date, photoUrl }));

  const recentPayments = recentSubscriptions.map((s) => ({
    id: s.id,
    user: s.user.name ?? "",
    amount: formatCurrency(s.amount, s.currency),
    method: s.paymentMethod,
    status: s.status,
    date: s.createdAt.toISOString(),
  }));

  return NextResponse.json({
    kpis: {
      totalUsers,
      totalAuPairs,
      totalFamilies,
      signups30d,
      signupsChangePct,
      revenue30d: formatRevenueByCurrency(revenueByCurrency30d),
      totalRevenue: formatRevenueByCurrency(totalRevenueByCurrency),
      activeSubscriptions,
      pendingProfiles,
      openReports,
    },
    recentUsers,
    recentPayments,
  });
}
