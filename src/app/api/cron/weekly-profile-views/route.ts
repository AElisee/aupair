import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { createNotification } from "@/lib/notifications";
import { getISOWeekKey } from "@/lib/profile-views";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  // CRON_SECRET doit toujours être configuré en prod — sans lui, on refuse plutôt que
  // de laisser cette route publique déclencher des notifications à volonté.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/weekly-profile-views] CRON_SECRET n'est pas configuré.");
    return NextResponse.json({ error: "Non configuré" }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const settings = await getAppSettings();
  if (!settings.notifyWeeklyViewsDigestEnabled) {
    return NextResponse.json({ skipped: true });
  }

  const lastWeekKey = getISOWeekKey(new Date(Date.now() - WEEK_MS));

  const grouped = await prisma.profileView.groupBy({
    by: ["profileUserId"],
    where: { weekKey: lastWeekKey },
    _count: { _all: true },
  });

  for (const group of grouped) {
    const count = group._count._all;
    const user = await prisma.user.findUnique({
      where: { id: group.profileUserId },
      select: { role: true },
    });
    const link = user?.role === "FAMILLE" ? "/dashboard/famille" : "/dashboard/au-pair";

    await createNotification({
      userId: group.profileUserId,
      type: "WEEKLY_VIEWS_DIGEST",
      title: "Résumé hebdomadaire",
      content: `${count} personne${count > 1 ? "s" : ""} ${count > 1 ? "ont" : "a"} consulté votre profil la semaine dernière.`,
      link,
    });
  }

  return NextResponse.json({ sent: grouped.length });
}
