import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { CONTACT_EMAIL, CONTACT_SUBJECTS } from "@/lib/constants";
import { escapeHtml } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  customSubject?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;
const MAX_CUSTOM_SUBJECT = 100;

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
  const customSubject = body.customSubject?.trim() ?? "";
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
  if (subject === "autre" && (!customSubject || customSubject.length > MAX_CUSTOM_SUBJECT)) {
    return NextResponse.json({ error: "Merci de préciser l'objet (100 caractères max)." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Le message doit contenir au moins 10 caractères." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const [emailLimit, ipLimit] = await Promise.all([
    checkRateLimit(`contact:email:${email}`, MAX_PER_EMAIL, WINDOW_MS),
    checkRateLimit(`contact:ip:${ip}`, MAX_PER_IP, WINDOW_MS),
  ]);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    console.log(`[contact] Limite de débit atteinte pour "${email}" (ip=${ip}).`);
    return NextResponse.json(
      { error: "Trop de messages envoyés. Merci de réessayer plus tard." },
      { status: 429 }
    );
  }

  const session = await auth();
  // « Autre » : l'objet saisi par le visiteur remplace le libellé générique.
  const subjectLabel = subject === "autre" ? customSubject : CONTACT_SUBJECTS[subject];
  const safeSubject = escapeHtml(subjectLabel);

  const ticket = await prisma.ticket.create({
    data: {
      userId: session?.user?.id ?? null,
      guestName: name,
      guestEmail: email,
      subject: subjectLabel,
      description: message,
    },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  await Promise.all([
    // Copie à l'équipe : « Répondre » écrit directement au visiteur.
    sendMail({
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact] ${subjectLabel} — ${name}`,
      html: `
        <p><strong>${safeName}</strong> &lt;${safeEmail}&gt;${session?.user?.id ? " (membre connecté)" : ""}</p>
        <p><strong>Objet :</strong> ${safeSubject}</p>
        <p style="white-space:normal;">${safeMessage}</p>
        <p style="color:#888;font-size:13px;">Référence ticket : ${ticket.id} — visible dans Admin › Tickets.</p>
      `,
    }),
    sendMail({
      to: email,
      subject: "Nous avons reçu votre message — AuPair A.EU",
      html: `
        <p>Bonjour ${safeName},</p>
        <p>Merci de nous avoir contactés. Votre message concernant <strong>${safeSubject}</strong> a bien été reçu et sera traité par notre équipe sous 24h ouvrées.</p>
        <p style="color:#888;font-size:13px;">Référence ticket : ${ticket.id}</p>
        <p>— L'équipe AuPair A.EU</p>
      `,
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
