import { prisma } from "./prisma";

/**
 * Limiteur de débit persistant (table Postgres) — nécessaire en serverless où
 * la mémoire d'une instance de fonction ne survit pas entre deux invocations.
 * Best-effort (pas d'atomicité stricte sous forte concurrence), suffisant pour
 * freiner le brute-force/spam sur des routes publiques à faible trafic.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  const now = new Date();
  const entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

  if (!entry || now.getTime() - entry.windowStart.getTime() > windowMs) {
    await prisma.rateLimitEntry.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { allowed: true };
  }

  if (entry.count >= max) {
    return { allowed: false };
  }

  await prisma.rateLimitEntry.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}

export async function resetRateLimit(key: string) {
  await prisma.rateLimitEntry.deleteMany({ where: { key } });
}

/** IP du client à partir des en-têtes posés par le proxy Vercel. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
