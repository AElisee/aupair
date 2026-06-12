import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { CONTACT_SUBJECTS } from "@/lib/constants";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (!Object.keys(CONTACT_SUBJECTS).includes(subject)) {
    return NextResponse.json({ error: "Sujet invalide." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Le message doit contenir au moins 10 caractères." }, { status: 400 });
  }

  const session = await auth();
  const subjectLabel = CONTACT_SUBJECTS[subject];

  const ticket = await prisma.ticket.create({
    data: {
      userId: session?.user?.id ?? null,
      guestName: name,
      guestEmail: email,
      subject: subjectLabel,
      description: message,
    },
  });

  await sendMail({
    to: email,
    subject: "Nous avons reçu votre message — AuPair A.EU",
    html: `
      <p>Bonjour ${name},</p>
      <p>Merci de nous avoir contactés. Votre message concernant <strong>${subjectLabel}</strong> a bien été reçu et sera traité par notre équipe sous 24h ouvrées.</p>
      <p style="color:#888;font-size:13px;">Référence ticket : ${ticket.id}</p>
      <p>— L'équipe AuPair A.EU</p>
    `,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
