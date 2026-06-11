import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;
  const { userId } = await params;

  const result = await prisma.message.updateMany({
    where: { senderId: userId, receiverId: myId, status: "SENT" },
    data: { status: "READ" },
  });

  return NextResponse.json({ updated: result.count });
}
