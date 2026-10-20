import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { sendMail } from "@/lib/mail";
import { adminMessageEmailHtml } from "@/lib/email-templates";

const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

/** Historique des emails envoyés à un utilisateur (?userId=). */
export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const emails = await prisma.adminEmail.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subject: true,
      message: true,
      status: true,
      recipientEmail: true,
      sentByName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    emails: emails.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  });
}

/** Envoie un email libre à un utilisateur depuis /admin/utilisateurs et en garde une trace. */
export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { userId, subject, message } = (body ?? {}) as {
    userId?: string;
    subject?: string;
    message?: string;
  };

  if (!userId || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
  }
  if (subject.length > MAX_SUBJECT || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // L'adresse vient de la base, jamais du client.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const result = await sendMail({
    to: user.email,
    subject: subject.trim(),
    html: adminMessageEmailHtml({ message }),
  });

  // Trace conservée même en cas d'échec, pour savoir ce qui n'est pas parti.
  await prisma.adminEmail.create({
    data: {
      userId,
      recipientEmail: user.email,
      recipientName: user.name,
      subject: subject.trim(),
      message: message.trim(),
      status: result.ok ? "SENT" : "FAILED",
      error: result.ok ? null : result.reason,
      resendId: result.ok ? (result.id ?? null) : null,
      sentById: session.user.id as string,
      sentByName: session.user.name ?? session.user.email ?? null,
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "NOT_CONFIGURED"
            ? "L'envoi d'emails n'est pas configuré (Paramètres > Email)."
            : "Échec de l'envoi de l'email.",
      },
      { status: result.reason === "NOT_CONFIGURED" ? 503 : 502 },
    );
  }

  return NextResponse.json({ success: true });
}
