import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { formatDate, formatCurrency } from "@/lib/utils";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const revenueActiveEur = activeSubs
    .filter((s) => s.currency === "EUR")
    .reduce((sum, s) => sum + s.amount, 0);
  const revenueActiveXof = activeSubs
    .filter((s) => s.currency === "XOF")
    .reduce((sum, s) => sum + s.amount, 0);
  const mobileMoneyCount = subscriptions.filter((s) => s.paymentMethod === "MOBILE_MONEY").length;

  const payments = subscriptions.map((s) => ({
    id: s.id,
    user: s.user.name ?? "Utilisateur",
    email: s.user.email,
    amount: formatCurrency(s.amount, s.currency),
    method: s.paymentMethod,
    status: s.status,
    date: formatDate(s.createdAt),
    invoiceUrl: s.invoiceUrl,
  }));

  return NextResponse.json({
    kpis: {
      revenueActiveEur: formatCurrency(revenueActiveEur, "EUR"),
      revenueActiveXof: revenueActiveXof > 0 ? formatCurrency(revenueActiveXof, "XOF") : null,
      activeSubscriptions: activeSubs.length,
      mobileMoneyCount,
    },
    payments,
  });
}
