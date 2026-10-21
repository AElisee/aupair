import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

/** Avis en attente de publication (badge du menu admin). */
export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const count = await prisma.testimonial.count({ where: { isPublished: false } });
  return NextResponse.json({ count });
}
