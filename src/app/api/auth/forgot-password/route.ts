import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { passwordResetEmailHtml } from "@/lib/email-templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const [emailLimit, ipLimit] = await Promise.all([
    checkRateLimit(`forgot-password:email:${email}`, MAX_PER_EMAIL, WINDOW_MS),
    checkRateLimit(`forgot-password:ip:${ip}`, MAX_PER_IP, WINDOW_MS),
  ]);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    console.log(`[forgot-password] Limite de débit atteinte pour "${email}" (ip=${ip}).`);
    // Réponse identique au cas normal — n'expose jamais l'état du rate limit à l'appelant.
    return NextResponse.json({ ok: true });
  }

  console.log(`[forgot-password] Demande de réinitialisation reçue pour "${email}".`);

  const user = await prisma.user.findUnique({ where: { email } });

  // On ne révèle jamais si l'email existe en base.
  if (user?.password) {
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`;

    console.log(`[forgot-password] Lien de réinitialisation généré pour l'utilisateur ${user.id}: ${resetUrl}`);

    const result = await sendMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — AuPair A.EU",
      html: passwordResetEmailHtml({ name: user.name, resetUrl, expiresAt }),
    });

    if (!result.ok) {
      console.error(
        `[forgot-password] L'email de réinitialisation n'a pas pu être envoyé à "${user.email}" (raison: ${result.reason}).`
      );
    } else {
      console.log(`[forgot-password] Email de réinitialisation envoyé à "${user.email}".`);
    }
  } else {
    console.log(`[forgot-password] Aucun compte avec mot de passe trouvé pour "${email}" — aucun email envoyé.`);
  }

  return NextResponse.json({ ok: true });
}
