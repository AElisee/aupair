import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/public-stats";

export const dynamic = "force-dynamic";

/** Compteurs publics (au pairs / familles inscrits), utilisés par la page de connexion. */
export async function GET() {
  return NextResponse.json(await getPublicStats());
}
