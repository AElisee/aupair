import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { formatDate } from "@/lib/utils";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte bancaire",
  PAYPAL: "PayPal",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

function escapeCsvField(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = ["Utilisateur", "Email", "Montant", "Devise", "Méthode", "Statut", "Date de création", "Date d'expiration"];
  const rows = subscriptions.map((s) => [
    s.user.name ?? "Utilisateur",
    s.user.email,
    s.amount.toString(),
    s.currency,
    PAYMENT_METHOD_LABELS[s.paymentMethod] ?? s.paymentMethod,
    STATUS_LABELS[s.status] ?? s.status,
    formatDate(s.createdAt),
    formatDate(s.expiresAt),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((field) => escapeCsvField(field)).join(";"))
    .join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="paiements-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
