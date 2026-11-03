import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { logAdminActivity } from "@/lib/admin-activity";

export async function GET() {
  const session = await requireAdminSession("testimonials.view");
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
  const session = await requireAdminSession("testimonials.publish");
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
  await logAdminActivity(session, {
    action: body.isPublished ? "testimonials.publish" : "testimonials.unpublish",
    targetType: "TESTIMONIAL", targetId: item.id, targetLabel: item.authorName,
  }, req);
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const session = await requireAdminSession("testimonials.delete");
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const deleted = await prisma.testimonial.delete({ where: { id } });
  await logAdminActivity(session, { action: "testimonials.delete", targetType: "TESTIMONIAL", targetId: id, targetLabel: deleted.authorName }, req);
  return NextResponse.json({ success: true });
}
