import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";

// Charge .env / .env.local exactement comme Next.js (gère l'échappement \$ des mots de passe)
loadEnvConfig(process.cwd());

const DEFAULT_COUNTRIES: {
  name: string;
  flag: string;
  dialCode: string;
  type: "ORIGIN" | "HOST";
}[] = [
  { name: "Bénin", flag: "🇧🇯", dialCode: "+229", type: "ORIGIN" },
  { name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226", type: "ORIGIN" },
  { name: "Cameroun", flag: "🇨🇲", dialCode: "+237", type: "ORIGIN" },
  { name: "Congo", flag: "🇨🇬", dialCode: "+242", type: "ORIGIN" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225", type: "ORIGIN" },
  { name: "Gabon", flag: "🇬🇦", dialCode: "+241", type: "ORIGIN" },
  { name: "Ghana", flag: "🇬🇭", dialCode: "+233", type: "ORIGIN" },
  // { name: "Koweït", flag: "🇰🇼", dialCode: "+965", type: "ORIGIN" },
  { name: "Madagascar", flag: "🇲🇬", dialCode: "+261", type: "ORIGIN" },
  { name: "Mali", flag: "🇲🇱", dialCode: "+223", type: "ORIGIN" },
  { name: "Maroc", flag: "🇲🇦", dialCode: "+212", type: "ORIGIN" },
  { name: "Sénégal", flag: "🇸🇳", dialCode: "+221", type: "ORIGIN" },
  { name: "Togo", flag: "🇹🇬", dialCode: "+228", type: "ORIGIN" },
  { name: "Tunisie", flag: "🇹🇳", dialCode: "+216", type: "ORIGIN" },
  { name: "Allemagne", flag: "🇩🇪", dialCode: "+49", type: "HOST" },
  { name: "Belgique", flag: "🇧🇪", dialCode: "+32", type: "HOST" },
  { name: "États-Unis", flag: "🇺🇸", dialCode: "+1", type: "HOST" },
  { name: "France", flag: "🇫🇷", dialCode: "+33", type: "HOST" },
  { name: "Luxembourg", flag: "🇱🇺", dialCode: "+352", type: "HOST" },
  { name: "Suisse", flag: "🇨🇭", dialCode: "+41", type: "HOST" },
];

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrateur";

  if (!email || !password) {
    console.log(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD non définis dans .env — aucun compte admin créé.",
    );
  } else {
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
  }

  for (const country of DEFAULT_COUNTRIES) {
    await prisma.country.upsert({
      where: { name: country.name },
      update: {
        flag: country.flag,
        dialCode: country.dialCode,
        type: country.type,
      },
      create: country,
    });
  }

  console.log(`[seed] ${DEFAULT_COUNTRIES.length} pays par défaut prêts.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed] Erreur lors de la création de l'admin :", err);
  process.exit(1);
});
