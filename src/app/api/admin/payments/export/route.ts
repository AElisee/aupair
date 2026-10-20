import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { effectiveSubscriptionStatus } from "@/lib/payments";
import type { Prisma } from "@/generated/prisma/client";

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

const STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED", "REFUNDED"] as const;
const METHODS = ["MOBILE_MONEY", "CARD", "FEDAPAY", "GENIUSPAY"] as const;

/** Mêmes filtres que le tableau de /admin/paiements (?q=&status=&method=&from=&to=) */
function buildWhere(params: URLSearchParams, now: Date): Prisma.SubscriptionWhereInput {
  const where: Prisma.SubscriptionWhereInput = {};
  const status = params.get("status");
  const method = params.get("method");
  const q = params.get("q")?.trim();
  // Période (jour/semaine/mois) calculée côté client, dans son fuseau horaire ; fin exclue
  const parseDate = (value: string | null) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
  };
  const from = parseDate(params.get("from"));
  const to = parseDate(params.get("to"));
  if (from || to) {
    where.createdAt = { gte: from, lt: to };
  }
  // "Actif" / "Expiré" suivent la date d'échéance, le statut en base restant ACTIVE après expiration
  if (status === "ACTIVE") {
    where.status = "ACTIVE";
    where.expiresAt = { gt: now };
  } else if (status === "EXPIRED") {
    where.OR = [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }];
  } else if (status && (STATUSES as readonly string[]).includes(status)) {
    where.status = status as (typeof STATUSES)[number];
  }
  if (method && (METHODS as readonly string[]).includes(method)) {
    where.paymentMethod = method as (typeof METHODS)[number];
  }
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }
  return where;
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const now = new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: buildWhere(req.nextUrl.searchParams, now),
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
    STATUS_LABELS[effectiveSubscriptionStatus(s, now)] ?? s.status,
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
