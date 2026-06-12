import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { slugify } from "@/lib/utils";

type BlogBody = {
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  excerpt?: string;
  excerptEn?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  isPublished?: boolean;
};

/** Génère un slug unique à partir du titre, en ajoutant un suffixe numérique si nécessaire. */
async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let i = 2;
  while (
    await prisma.blogPost.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as BlogBody;
  const { title, content, category, author } = body;

  if (!title?.trim() || !content?.trim() || !category?.trim() || !author?.trim()) {
    return NextResponse.json({ error: "Titre, contenu, catégorie et auteur sont obligatoires." }, { status: 400 });
  }

  const slug = await generateUniqueSlug(title);
  const isPublished = body.isPublished ?? false;

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: title.trim(),
      titleEn: body.titleEn?.trim() || null,
      content: content.trim(),
      contentEn: body.contentEn?.trim() || null,
      excerpt: body.excerpt?.trim() || null,
      excerptEn: body.excerptEn?.trim() || null,
      coverImage: body.coverImage?.trim() || null,
      category: category.trim(),
      tags: body.tags ?? [],
      author: author.trim(),
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as BlogBody & { id?: string };
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  const slug =
    body.title !== undefined && body.title.trim() && body.title.trim() !== existing.title
      ? await generateUniqueSlug(body.title.trim(), id)
      : undefined;

  const isPublishedChanged = body.isPublished !== undefined && body.isPublished !== existing.isPublished;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(slug && { slug }),
      ...(body.titleEn !== undefined && { titleEn: body.titleEn.trim() || null }),
      ...(body.content !== undefined && { content: body.content.trim() }),
      ...(body.contentEn !== undefined && { contentEn: body.contentEn.trim() || null }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt.trim() || null }),
      ...(body.excerptEn !== undefined && { excerptEn: body.excerptEn.trim() || null }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage.trim() || null }),
      ...(body.category !== undefined && { category: body.category.trim() }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.author !== undefined && { author: body.author.trim() }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(isPublishedChanged && {
        publishedAt: body.isPublished ? new Date() : null,
      }),
    },
  });

  return NextResponse.json({ post });
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

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
