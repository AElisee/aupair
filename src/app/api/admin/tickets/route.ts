import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { sendMail } from "@/lib/mail";
import { TicketPriority, TicketStatus } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ticket });
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ tickets });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as {
    id?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    reply?: string;
  };
  const { id, status, priority, reply } = body;

  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { user: true } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  if (status !== undefined && !Object.values(TicketStatus).includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  if (priority !== undefined && !Object.values(TicketPriority).includes(priority)) {
    return NextResponse.json({ error: "Priorité invalide" }, { status: 400 });
  }

  if (reply?.trim()) {
    await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        authorId: session.user.id,
        content: reply.trim(),
        isAdmin: true,
      },
    });

    const recipient = ticket.user?.email ?? ticket.guestEmail;
    if (recipient) {
      await sendMail({
        to: recipient,
        subject: `Réponse à votre demande : ${ticket.subject}`,
        html: `
          <p>Bonjour ${ticket.user?.name ?? ticket.guestName ?? ""},</p>
          <p>Notre équipe a répondu à votre demande &laquo; ${ticket.subject} &raquo; :</p>
          <blockquote style="border-left:3px solid #E87722;padding-left:12px;color:#333;">${reply.trim()}</blockquote>
          <p>— L'équipe AuPair A.EU</p>
        `,
      });
    }
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
      ...(reply?.trim() && ticket.status === TicketStatus.OPEN && status === undefined && {
        status: TicketStatus.IN_PROGRESS,
      }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ ticket: updated });
}
