import { loadEnvConfig } from "@next/env";

// Charge .env / .env.local exactement comme Next.js
loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "CountryType" AS ENUM ('ORIGIN', 'HOST');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "countries" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "flag" TEXT NOT NULL,
      "dialCode" TEXT NOT NULL,
      "type" "CountryType" NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "countries_name_key" ON "countries"("name");
  `);

  console.log("[create-countries-table] Table 'countries' prête.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[create-countries-table] Erreur :", err);
  process.exit(1);
});
