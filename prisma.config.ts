import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Charge .env / .env.local exactement comme Next.js (gère l'échappement \$ des mots de passe)
loadEnvConfig(process.cwd());

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
