import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { ProfileStatus } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [auPairsCount, familiesCount] = await Promise.all([
    prisma.auPairProfile.count({ where: { status: ProfileStatus.PENDING } }),
    prisma.familyProfile.count({ where: { status: ProfileStatus.PENDING } }),
  ]);

  return NextResponse.json({ count: auPairsCount + familiesCount });
}
