import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const blocks = await prisma.block.findMany({
    where: { blockerId: session.user.id },
    select: { blockedId: true },
  });

  return NextResponse.json({ blockedIds: blocks.map((b) => b.blockedId) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;

  const { blockedId } = (await req.json().catch(() => ({}))) as { blockedId?: string };
  if (!blockedId) {
    return NextResponse.json({ error: "blockedId manquant" }, { status: 400 });
  }
  if (blockedId === myId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous bloquer vous-même" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: myId, blockedId } },
    update: {},
    create: { blockerId: myId, blockedId },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const blockedId = searchParams.get("blockedId");
  if (!blockedId) {
    return NextResponse.json({ error: "blockedId manquant" }, { status: 400 });
  }

  await prisma.block.deleteMany({
    where: { blockerId: session.user.id, blockedId },
  });

  return NextResponse.json({ success: true });
}
