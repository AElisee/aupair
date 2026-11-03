import { NextResponse } from "next/server";
import { purgeOldAdminActivity } from "@/lib/admin-activity";

/** Cron quotidien (vercel.json) : purge du journal d'activité au-delà de 12 mois */
export async function GET(req: Request) {
  // Même protection que les autres crons : sans CRON_SECRET, la route reste fermée.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/purge-activity-logs] CRON_SECRET n'est pas configuré.");
    return NextResponse.json({ error: "Non configuré" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { count, cutoff } = await purgeOldAdminActivity();
  console.log(`[cron/purge-activity-logs] ${count} ligne(s) antérieure(s) au ${cutoff.toISOString()} supprimée(s).`);
  return NextResponse.json({ deleted: count, cutoff: cutoff.toISOString() });
}
