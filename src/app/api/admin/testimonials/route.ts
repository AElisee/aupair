import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Avis en attente d'abord, puis les plus récents.
  const items = await prisma.testimonial.findMany({
    orderBy: [{ isPublished: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as { id?: string; isPublished?: boolean };
  if (!body.id || typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const item = await prisma.testimonial.update({
    where: { id: body.id },
    data: { isPublished: body.isPublished },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
