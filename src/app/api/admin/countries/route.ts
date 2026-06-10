import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { CountryType, Prisma } from "@/generated/prisma/client";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const countries = await prisma.country.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ countries });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { name, flag, dialCode, type } = body as {
    name?: string;
    flag?: string;
    dialCode?: string;
    type?: CountryType;
  };

  if (!name || !flag || !dialCode || !type) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (type !== CountryType.ORIGIN && type !== CountryType.HOST) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  try {
    const country = await prisma.country.create({
      data: { name, flag, dialCode, type },
    });
    return NextResponse.json({ country });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ce pays existe déjà" }, { status: 409 });
    }
    throw err;
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { id, name, flag, dialCode, type, isActive } = body as {
    id?: string;
    name?: string;
    flag?: string;
    dialCode?: string;
    type?: CountryType;
    isActive?: boolean;
  };

  if (!id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const country = await prisma.country.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(flag !== undefined && { flag }),
        ...(dialCode !== undefined && { dialCode }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json({ country });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ce pays existe déjà" }, { status: 409 });
    }
    throw err;
  }
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

  await prisma.country.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
