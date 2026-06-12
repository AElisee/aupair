import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";

type FaqBody = {
  question?: string;
  questionEn?: string;
  answer?: string;
  answerEn?: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
};

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const items = await prisma.faqItem.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as FaqBody;
  const { question, answer, category } = body;

  if (!question?.trim() || !answer?.trim() || !category?.trim()) {
    return NextResponse.json({ error: "Question, réponse et catégorie sont obligatoires." }, { status: 400 });
  }

  const item = await prisma.faqItem.create({
    data: {
      question: question.trim(),
      questionEn: body.questionEn?.trim() || null,
      answer: answer.trim(),
      answerEn: body.answerEn?.trim() || null,
      category: category.trim(),
      order: body.order ?? 0,
      isPublished: body.isPublished ?? true,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json()) as FaqBody & { id?: string };
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const item = await prisma.faqItem.update({
    where: { id },
    data: {
      ...(body.question !== undefined && { question: body.question.trim() }),
      ...(body.questionEn !== undefined && { questionEn: body.questionEn.trim() || null }),
      ...(body.answer !== undefined && { answer: body.answer.trim() }),
      ...(body.answerEn !== undefined && { answerEn: body.answerEn.trim() || null }),
      ...(body.category !== undefined && { category: body.category.trim() }),
      ...(body.order !== undefined && { order: body.order }),
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

  await prisma.faqItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
