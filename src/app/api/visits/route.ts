import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { visitDayKey } from "@/lib/site-visits";
import { auth } from "@/lib/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Plusieurs navigateurs peuvent partager une IP (box, entreprise) : plafond large
const MAX_PER_IP = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Enregistre la visite du jour d'un navigateur (idempotent sur visiteur + jour).
 * « Avec compte » est déduit de la session côté serveur, jamais du client ; une visite
 * anonyme est requalifiée si le même navigateur se connecte plus tard dans la journée.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
  if (!UUID_RE.test(visitorId)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { allowed } = await checkRateLimit(`visit:ip:${getClientIp(request)}`, MAX_PER_IP, WINDOW_MS);
  if (!allowed) return new NextResponse(null, { status: 204 });

  const session = await auth();
  const withAccount = !!session?.user?.id;
  const key = { visitorId: visitorId.toLowerCase(), day: visitDayKey() };

  if (withAccount) {
    await prisma.siteVisit.upsert({
      where: { visitorId_day: key },
      create: { ...key, withAccount: true },
      update: { withAccount: true },
    });
  } else {
    await prisma.siteVisit.createMany({ data: [key], skipDuplicates: true });
  }
  return new NextResponse(null, { status: 204 });
}
