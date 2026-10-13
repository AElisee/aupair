import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { normalizeDocumentSlug } from "@/lib/legal-documents";
import { isEmptyDocumentHtml, sanitizeDocumentHtml } from "@/lib/legal-documents.server";

type DocumentBody = {
  slug?: string;
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  isPublished?: boolean;
};

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const items = await prisma.legalDocument.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as DocumentBody;
  const slug = normalizeDocumentSlug(body.slug ?? "");
  const { title } = body;
  const content = sanitizeDocumentHtml(body.content ?? "");
  const contentEn = sanitizeDocumentHtml(body.contentEn ?? "");

  if (!slug || !title?.trim() || isEmptyDocumentHtml(content)) {
    return NextResponse.json({ error: "Identifiant, titre et contenu sont obligatoires." }, { status: 400 });
  }

  const existing = await prisma.legalDocument.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: `Un document avec l'identifiant « ${slug} » existe déjà.` }, { status: 409 });
  }

  const item = await prisma.legalDocument.create({
    data: {
      slug,
      title: title.trim(),
      titleEn: body.titleEn?.trim() || null,
      content,
      contentEn: isEmptyDocumentHtml(contentEn) ? null : contentEn,
      isPublished: body.isPublished ?? false,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as DocumentBody & { id?: string };
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (body.title !== undefined && !body.title.trim()) {
    return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
  }
  const content = body.content !== undefined ? sanitizeDocumentHtml(body.content) : undefined;
  const contentEn = body.contentEn !== undefined ? sanitizeDocumentHtml(body.contentEn) : undefined;
  if (content !== undefined && isEmptyDocumentHtml(content)) {
    return NextResponse.json({ error: "Le contenu est obligatoire." }, { status: 400 });
  }

  let slug: string | undefined;
  if (body.slug !== undefined) {
    slug = normalizeDocumentSlug(body.slug);
    if (!slug) {
      return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    }
    const existing = await prisma.legalDocument.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: `Un document avec l'identifiant « ${slug} » existe déjà.` }, { status: 409 });
    }
  }

  const item = await prisma.legalDocument.update({
    where: { id },
    data: {
      ...(slug !== undefined && { slug }),
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.titleEn !== undefined && { titleEn: body.titleEn.trim() || null }),
      ...(content !== undefined && { content }),
      ...(contentEn !== undefined && { contentEn: isEmptyDocumentHtml(contentEn) ? null : contentEn }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  await prisma.legalDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
