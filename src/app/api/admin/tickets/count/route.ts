import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { TicketStatus } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const count = await prisma.ticket.count({ where: { status: TicketStatus.OPEN } });

  return NextResponse.json({ count });
}
