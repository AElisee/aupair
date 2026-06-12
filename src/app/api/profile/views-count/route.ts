import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role === "AU_PAIR") {
    const profile = await prisma.auPairProfile.findUnique({
      where: { userId: session.user.id },
      select: { profileViews: true },
    });
    return NextResponse.json({ views: profile?.profileViews ?? 0 });
  }

  if (session.user.role === "FAMILLE") {
    const profile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { profileViews: true },
    });
    return NextResponse.json({ views: profile?.profileViews ?? 0 });
  }

  return NextResponse.json({ views: 0 });
}
