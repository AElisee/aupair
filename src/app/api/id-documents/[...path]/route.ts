import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/admin";
import { createIdDocumentSignedUrl, isIdDocumentPath, idDocumentOwnerId } from "@/lib/id-documents.server";

/**
 * Ouvre une pièce d'identité : droits vérifiés à chaque clic (propriétaire, ou admin ayant accès
 * aux utilisateurs / à la modération), puis redirection vers un lien temporaire du bucket privé.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const path = (await params).path.join("/");
  if (!isIdDocumentPath(path)) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const isOwner = idDocumentOwnerId(path) === session.user.id;
  if (!isOwner && !(await requireAdminSession(["users.view", "moderation.view"]))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const signedUrl = await createIdDocumentSignedUrl(path).catch((err) => {
    console.error("[id-documents] Signed URL error:", err);
    return null;
  });
  if (!signedUrl) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
