import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

/** Nombre de signalements ouverts (badge du menu admin). */
export async function GET() {
  const session = await requireAdminSession("reports.view");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const count = await prisma.report.count({ where: { isResolved: false } });
  return NextResponse.json({ count });
}
