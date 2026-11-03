export const REVENUE_MONTHS_RANGE = 6;

export type RevenueMonth = { month: string; amount: number; mobileMoney: number; card: number };

type RevenueSubscription = {
  createdAt: Date;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
};

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

/**
 * Revenus XOF encaissés (abonnements ACTIVE/EXPIRED) des `count` derniers mois.
 * Total du mois + détail Mobile Money / carte (les méthodes génériques FEDAPAY/GENIUSPAY
 * ne comptent que dans le total). `month` au format AAAA-MM, mis en forme côté client.
 */
export function buildRevenueByMonth(subscriptions: RevenueSubscription[], count = REVENUE_MONTHS_RANGE): RevenueMonth[] {
  const now = new Date();
  const paid = subscriptions.filter((s) => s.currency === "XOF" && (s.status === "ACTIVE" || s.status === "EXPIRED"));

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    const key = monthKey(d);
    const ofMonth = paid.filter((s) => monthKey(s.createdAt) === key);
    const sumOf = (list: typeof ofMonth) => list.reduce((sum, s) => sum + s.amount, 0);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      amount: sumOf(ofMonth),
      mobileMoney: sumOf(ofMonth.filter((s) => s.paymentMethod === "MOBILE_MONEY")),
      card: sumOf(ofMonth.filter((s) => s.paymentMethod === "CARD")),
    };
  });
}
