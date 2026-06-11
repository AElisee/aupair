import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConversationUsers, isBlockedEitherWay } from "@/lib/messages";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: myId }, { receiverId: myId }] },
    orderBy: { createdAt: "desc" },
    select: { senderId: true, receiverId: true, content: true, attachmentType: true, status: true, createdAt: true },
  });

  const conversationOrder: string[] = [];
  const summaries = new Map<string, { lastMessage: string; lastMessageAt: Date; lastMessageFromMe: boolean; unreadCount: number }>();

  for (const m of messages) {
    const otherId = m.senderId === myId ? m.receiverId : m.senderId;
    let summary = summaries.get(otherId);
    if (!summary) {
      const lastMessage = m.content || (m.attachmentType?.startsWith("image/") ? "📷 Photo" : m.attachmentType ? "📄 Document" : "");
      summary = { lastMessage, lastMessageAt: m.createdAt, lastMessageFromMe: m.senderId === myId, unreadCount: 0 };
      summaries.set(otherId, summary);
      conversationOrder.push(otherId);
    }
    if (m.receiverId === myId && m.status === "SENT") summary.unreadCount++;
  }

  const usersMap = await getConversationUsers(conversationOrder);

  const conversations = conversationOrder
    .map((userId) => {
      const summary = summaries.get(userId)!;
      const user = usersMap.get(userId);
      if (!user) return null;
      return {
        userId,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        lastMessage: summary.lastMessage,
        lastMessageAt: summary.lastMessageAt.toISOString(),
        lastMessageFromMe: summary.lastMessageFromMe,
        unreadCount: summary.unreadCount,
      };
    })
    .filter((c): c is NonNullable<typeof c> => !!c);

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;

  const body = (await req.json().catch(() => null)) as { receiverId?: string; content?: string } | null;
  const receiverId = body?.receiverId;
  const content = body?.content?.trim();

  if (!receiverId || !content) {
    return NextResponse.json({ error: "receiverId et content sont requis" }, { status: 400 });
  }
  if (receiverId === myId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  if (await isBlockedEitherWay(myId, receiverId)) {
    return NextResponse.json({ error: "Impossible d'envoyer un message à cet utilisateur" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { senderId: myId, receiverId, content },
  });

  return NextResponse.json({ message }, { status: 201 });
}
