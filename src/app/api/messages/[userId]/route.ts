import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConversationUsers, isBlockedEitherWay } from "@/lib/messages";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;
  const { userId } = await params;

  if (userId === myId) {
    return NextResponse.json({ error: "Conversation invalide" }, { status: 400 });
  }

  const [usersMap, messages, blocked, blockedByMe] = await Promise.all([
    getConversationUsers([userId]),
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    }),
    isBlockedEitherWay(myId, userId),
    prisma.block.findFirst({ where: { blockerId: myId, blockedId: userId } }),
  ]);

  const otherUser = usersMap.get(userId);
  if (!otherUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    otherUser,
    isBlocked: blocked,
    blockedByMe: !!blockedByMe,
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      attachmentName: m.attachmentName,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
