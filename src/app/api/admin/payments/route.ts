import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { formatCurrency, formatRevenueByCurrency } from "@/lib/utils";
import { buildRevenueByMonth } from "@/lib/admin-revenue";
import { effectiveSubscriptionStatus } from "@/lib/payments";

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 7;

export async function GET() {
  const session = await requireAdminSession("payments.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const nowDate = new Date();
  const activeSubs = subscriptions.filter((s) => effectiveSubscriptionStatus(s, nowDate) === "ACTIVE");
  const revenueActiveEur = activeSubs
    .filter((s) => s.currency === "EUR")
    .reduce((sum, s) => sum + s.amount, 0);
  const revenueActiveXof = activeSubs
    .filter((s) => s.currency === "XOF")
    .reduce((sum, s) => sum + s.amount, 0);
  const mobileMoneyCount = subscriptions.filter((s) => s.paymentMethod === "MOBILE_MONEY").length;
  const cardCount = subscriptions.filter((s) => s.paymentMethod === "CARD").length;
  const now = nowDate.getTime();
  const expiringSoon = activeSubs.filter(
    (s) => s.expiresAt.getTime() > now && s.expiresAt.getTime() - now <= EXPIRING_SOON_DAYS * DAY_MS,
  ).length;

  // Revenus encaissés : 30 derniers jours (tous statuts, comme avant sur le dashboard) et total (ACTIVE/EXPIRED)
  const sumByCurrency = (list: typeof subscriptions) => {
    const sums = new Map<(typeof subscriptions)[number]["currency"], number>();
    for (const s of list) sums.set(s.currency, (sums.get(s.currency) ?? 0) + s.amount);
    return [...sums].map(([currency, amount]) => ({ currency, _sum: { amount } }));
  };
  const thirtyDaysAgo = now - 30 * DAY_MS;
  const revenue30d = formatRevenueByCurrency(sumByCurrency(subscriptions.filter((s) => s.createdAt.getTime() >= thirtyDaysAgo)));
  const totalRevenue = formatRevenueByCurrency(
    sumByCurrency(subscriptions.filter((s) => s.status === "ACTIVE" || s.status === "EXPIRED")),
  );

  const payments = subscriptions.map((s) => ({
    id: s.id,
    user: s.user.name ?? "",
    email: s.user.email,
    amount: formatCurrency(s.amount, s.currency),
    method: s.paymentMethod,
    status: effectiveSubscriptionStatus(s, nowDate),
    date: s.createdAt.toISOString(),
    // Abonnement de 30 jours à compter du jour du paiement
    expiresAt: s.expiresAt.toISOString(),
    invoiceUrl: s.invoiceUrl,
  }));

  return NextResponse.json({
    kpis: {
      revenueActiveXof: formatCurrency(revenueActiveXof, "XOF"),
      revenueActiveEur: revenueActiveEur > 0 ? formatCurrency(revenueActiveEur, "EUR") : null,
      activeSubscriptions: activeSubs.length,
      mobileMoneyCount,
      cardCount,
      expiringSoon,
      totalPayments: subscriptions.length,
    },
    revenue: {
      last30d: revenue30d,
      total: totalRevenue,
      byMonth: buildRevenueByMonth(subscriptions),
    },
    payments,
  });
}
