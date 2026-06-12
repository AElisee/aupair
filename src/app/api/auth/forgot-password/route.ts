import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { passwordResetEmailHtml } from "@/lib/email-templates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
