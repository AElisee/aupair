import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

/**
 * Routes protégées par authentification (tout utilisateur connecté)
 */
const AUTH_REQUIRED = ["/dashboard"];

/**
 * Routes réservées au rôle ADMIN uniquement
 */
const ADMIN_ONLY = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRequired = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  const isAdminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  if (!isAuthRequired && !isAdminOnly) return NextResponse.next();

  // Décode le JWT NextAuth sans requête DB (compatible Edge runtime)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Non authentifié → redirection vers /connexion ──────────────────────────
  if (!token) {
    const loginUrl = new URL("/connexion", request.url);

    // Sécurité : on valide le pathname via getSafeCallbackUrl avant de
    // le transmettre — bloque toute tentative d'injection dans l'URL
    const safeCallback = getSafeCallbackUrl(pathname);
    if (safeCallback !== "/") {
      loginUrl.searchParams.set("callbackUrl", safeCallback);
    }

    return NextResponse.redirect(loginUrl);
  }

  // ── Authentifié mais route ADMIN réservée au rôle ADMIN ───────────────────
  if (isAdminOnly && token.role !== "ADMIN") {
    // Redirection silencieuse vers le dashboard du rôle réel
    // (pas d'erreur 403 exposée — évite l'énumération des routes admin)
    const role = token.role as string | undefined;
    const dashboardUrl =
      role === "AU_PAIR"
        ? "/dashboard/au-pair"
        : role === "FAMILLE"
          ? "/dashboard/famille"
          : "/";

    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
