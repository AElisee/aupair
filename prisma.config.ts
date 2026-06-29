import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// En dev (ou sans NODE_ENV), force le chargement de .env (pas .env.production).
// Sur Vercel, NODE_ENV=production → .env.production est chargé correctement.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

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
