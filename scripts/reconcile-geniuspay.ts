/**
 * Rattrapage des paiements GeniusPay réussis (`completed`) sans abonnement en base
 * (webhook perdu + onglet fermé avant la fin du polling).
 *
 *   npx tsx scripts/reconcile-geniuspay.ts                 # base de dev, simulation
 *   npx tsx scripts/reconcile-geniuspay.ts --prod          # base de prod (.env.production), simulation
 *   npx tsx scripts/reconcile-geniuspay.ts --prod --apply  # crée réellement les abonnements manquants
 *
 * Le statut est relu auprès de l'API GeniusPay (GET /payments/{reference}) et l'utilisateur vient de
 * `metadata.user_id`, exactement comme le webhook. L'abonnement démarre à l'exécution du script.
 */
import { loadEnvConfig } from "@next/env";

const args = new Set(process.argv.slice(2));
const PROD = args.has("--prod");
const APPLY = args.has("--apply");
const PER_PAGE = 100;

if (PROD) process.loadEnvFile(".env.production");
else loadEnvConfig(process.cwd(), true);

async function main() {
  // Imports dynamiques : le client Prisma doit être créé après le chargement de DATABASE_URL.
  const { prisma } = await import("../src/lib/prisma");
  const { getAppSettings } = await import("../src/lib/settings");
  const { activateSubscriptionForPayment } = await import("../src/lib/payments");
  const {
    GENIUSPAY_BASE_URL,
    geniuspayHeaders,
    fetchGeniuspayPayment,
    extractUserIdFromGeniuspayPayment,
    resolvePaymentMethodFromGeniuspay,
    GENIUSPAY_SUCCESS_STATUSES,
  } = await import("../src/lib/geniuspay");

  const settings = await getAppSettings();
  if (!settings.geniuspayPublicKey || !settings.geniuspaySecretKey) throw new Error("Clés GeniusPay absentes.");
  const { geniuspayPublicKey: pk, geniuspaySecretKey: sk } = settings;

  const res = await fetch(`${GENIUSPAY_BASE_URL}/payments?per_page=${PER_PAGE}`, { headers: geniuspayHeaders(pk, sk) });
  if (!res.ok) throw new Error(`Liste des paiements refusée (${res.status})`);
  const json = await res.json();
  const list: { reference: string; status: string }[] = json?.data?.data ?? json?.data ?? [];

  const completed = list.filter((p) => GENIUSPAY_SUCCESS_STATUSES.has(p.status));
  console.log(`${list.length} paiements lus, ${completed.length} réussis. Mode : ${PROD ? "PROD" : "dev"}${APPLY ? " / APPLY" : " / simulation"}`);

  let missing = 0;
  for (const { reference } of completed) {
    if (await prisma.subscription.findFirst({ where: { paymentId: reference }, select: { id: true } })) continue;

    const payment = await fetchGeniuspayPayment(reference, pk, sk);
    if (!payment || !GENIUSPAY_SUCCESS_STATUSES.has(payment.status)) continue;
    const userId = extractUserIdFromGeniuspayPayment(payment);
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } }) : null;
    if (!user) {
      console.warn(`  ${reference} : utilisateur introuvable (${userId ?? "aucun user_id"})`);
      continue;
    }

    missing++;
    console.log(`  ${reference} → ${user.id} (${user.email}) : abonnement manquant`);
    if (APPLY) {
      const sub = await activateSubscriptionForPayment({
        userId: user.id,
        paymentId: payment.reference,
        amount: payment.amount ?? settings.subscriptionPriceXof,
        paymentMethod: resolvePaymentMethodFromGeniuspay(payment.payment_method),
        subscriptionDays: settings.subscriptionDays,
      });
      console.log(`    créé : ${sub.id}, expire le ${sub.expiresAt.toISOString()}`);
    }
  }

  console.log(missing ? `${missing} abonnement(s) manquant(s)${APPLY ? " créé(s)." : " — relancer avec --apply."}` : "Rien à rattraper.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
