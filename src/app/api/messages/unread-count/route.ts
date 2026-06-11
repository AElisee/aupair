import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const count = await prisma.message.count({
    where: { receiverId: session.user.id, status: "SENT" },
  });

  return NextResponse.json({ count });
}
