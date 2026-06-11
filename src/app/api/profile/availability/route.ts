import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileStatus } from "@/generated/prisma/client";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (session.user.role !== "AU_PAIR") {
    return NextResponse.json({ error: "Accès réservé aux au pairs." }, { status: 403 });
  }

  let body: { isAvailable?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (typeof body.isAvailable !== "boolean") {
    return NextResponse.json({ error: "Le champ isAvailable est requis." }, { status: 400 });
  }

  const profile = await prisma.auPairProfile.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  if (profile.status === ProfileStatus.HIDDEN) {
    return NextResponse.json(
      { error: "Votre profil a été masqué par un administrateur. Vous ne pouvez pas le rendre disponible vous-même." },
      { status: 403 }
    );
  }

  await prisma.auPairProfile.update({
    where: { userId: session.user.id },
    data: { isAvailable: body.isAvailable },
  });

  return NextResponse.json({ isAvailable: body.isAvailable });
}
