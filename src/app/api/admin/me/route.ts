import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin";

/** GET — permissions de l'admin connecté (menu et accès aux pages du back-office) */
export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  return NextResponse.json({
    id: session.user.id,
    name: session.user.name ?? "",
    permissions: session.user.permissions ?? [],
  });
}
