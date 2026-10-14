import { existsSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// En production, on charge uniquement .env.production : loadEnvConfig chargerait
// aussi .env.local, prioritaire sur .env.production, et viserait la base de dev.
// Sur Vercel (pas de fichier .env.*), les variables du dashboard sont utilisées.
// En dev (ou sans NODE_ENV), loadEnvConfig charge .env / .env.local.
if (process.env.NODE_ENV === "production") {
  if (existsSync(".env.production")) process.loadEnvFile(".env.production");
} else {
  loadEnvConfig(process.cwd(), true);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // DIRECT_URL (port 5432, session mode) pour les commandes CLI Prisma.
  // L'app elle-même utilise DATABASE_URL (port 6543, pgbouncer) via src/lib/prisma.ts.
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
