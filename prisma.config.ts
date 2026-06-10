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
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
