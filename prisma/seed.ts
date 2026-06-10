import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

// Charge .env / .env.local exactement comme Next.js (gère l'échappement \$ des mots de passe)
loadEnvConfig(process.cwd());

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrateur";

  if (!email || !password) {
    console.log("[seed] ADMIN_EMAIL / ADMIN_PASSWORD non définis dans .env — aucun compte admin créé.");
    return;
  }

  const { prisma } = await import("../src/lib/prisma");

  const normalizedEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      password: hashedPassword,
      name,
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      email: normalizedEmail,
      password: hashedPassword,
      name,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log(`[seed] Compte admin prêt : ${normalizedEmail}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed] Erreur lors de la création de l'admin :", err);
  process.exit(1);
});
