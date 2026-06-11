import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";
import { getCountryFlagMap } from "@/lib/countries";
import { formatRelativeDate, formatCurrency } from "@/lib/utils";

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
    signups30d,
    signupsPrev30d,
    revenueAgg,
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
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: thirtyDaysAgo }, currency: "EUR" },
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

  const signupsChange =
    signupsPrev30d === 0
      ? signups30d > 0 ? "+100% vs mois dernier" : "Stable vs mois dernier"
      : `${signups30d >= signupsPrev30d ? "+" : ""}${Math.round(((signups30d - signupsPrev30d) / signupsPrev30d) * 100)}% vs mois dernier`;

  const recentUsers = [
    ...recentAuPairs.map((p) => ({
      id: p.userId,
      name: `${p.firstName} ${p.lastName}`,
      role: "AU_PAIR" as const,
      country: `${flagMap[p.countryOfOrigin] ?? ""} ${p.countryOfOrigin}`.trim(),
      status: p.status,
      date: formatRelativeDate(p.createdAt),
      createdAt: p.createdAt,
      photoUrl: p.profilePhotoUrl ?? "",
    })),
    ...recentFamilies.map((p) => ({
      id: p.userId,
      name: p.user.name ?? "Famille",
      role: "FAMILLE" as const,
      country: `${flagMap[p.country] ?? ""} ${p.country}`.trim(),
      status: p.status,
      date: formatRelativeDate(p.createdAt),
      createdAt: p.createdAt,
      photoUrl: p.familyPhotoUrl ?? "",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(({ id, name, role, country, status, date, photoUrl }) => ({ id, name, role, country, status, date, photoUrl }));

  const recentPayments = recentSubscriptions.map((s) => ({
    id: s.id,
    user: s.user.name ?? "Utilisateur",
    amount: formatCurrency(s.amount, s.currency as "EUR" | "XOF"),
    method: s.paymentMethod,
    status: s.status,
    date: formatRelativeDate(s.createdAt),
  }));

  return NextResponse.json({
    kpis: {
      totalUsers,
      signups30d,
      signupsChange,
      revenue30d: formatCurrency(revenueAgg._sum.amount ?? 0, "EUR"),
      activeSubscriptions,
      pendingProfiles,
      openReports,
    },
    recentUsers,
    recentPayments,
  });
}
