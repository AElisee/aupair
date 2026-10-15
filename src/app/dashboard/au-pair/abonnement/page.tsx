"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toast from "@radix-ui/react-toast";
import { CheckCircle, Clock, Wallet, Loader2, AlertCircle, ExternalLink, X } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useI18n } from "@/i18n";

type SubscriptionData = {
  active: boolean;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED" | null;
  expiresAt: string | null;
  daysLeft: number;
  amount: number | null;
  currency: "EUR" | "XOF" | "USD" | null;
  countryOfOrigin: string | null;
  constants: { priceEur: number; priceXof: number; days: number; features: string[] };
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;
// Paiement en cours, partagé entre l'onglet d'origine et l'onglet ouvert par l'URL de retour de l'agrégateur
const PENDING_PAYMENT_KEY = "aupair-pending-payment";
const PAYMENT_CHANNEL = "aupair-payment";
// Statuts d'échec que l'agrégateur peut ajouter à l'URL de retour (`?status=…`)
const RETURN_FAILED_STATUSES = new Set(["declined", "canceled", "cancelled", "failed", "expired"]);

type PendingPayment = { provider: string; transactionId: number | string };

function readPendingPayment(): PendingPayment | null {
  try {
    const raw = localStorage.getItem(PENDING_PAYMENT_KEY);
    return raw ? (JSON.parse(raw) as PendingPayment) : null;
  } catch {
    return null;
  }
}

function writePendingPayment(payment: PendingPayment | null) {
  try {
    if (payment) localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
    else localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // stockage indisponible (navigation privée…) : le polling de l'onglet d'origine suffit
  }
}

function notifyOtherTabs() {
  try {
    const channel = new BroadcastChannel(PAYMENT_CHANNEL);
    channel.postMessage("payment-return");
    channel.close();
  } catch {
    // BroadcastChannel non supporté
  }
}

function AbonnementContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { t, locale, tValue, tError } = useI18n();

  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Notification affichée en toast (haut, centre) plutôt qu'en bandeau
  const [toastMessage, setToastMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  // FedaPay identifie une transaction par un id numérique, GeniusPay par une référence "MTX-…"
  const [pendingTransactionId, setPendingTransactionId] = useState<number | string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const pollAttempts = useRef(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Incrémenté à chaque arrêt du polling : les réponses d'une vérification devenue obsolète sont ignorées
  const pollGeneration = useRef(0);
  const pendingProvider = useRef<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const paymentStatus = searchParams.get("payment");
  const returnStatus = searchParams.get("status")?.toLowerCase() ?? null;

  const stopPolling = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = null;
    pollGeneration.current += 1;
  }, []);

  const finishPayment = useCallback(() => {
    stopPolling();
    writePendingPayment(null);
    pendingProvider.current = null;
    setPendingTransactionId(null);
    setCheckoutUrl(null);
    setDialogOpen(false);
  }, [stopPolling]);

  const verify = useCallback((provider: string, transactionId: number | string, poll = true) => {
    const generation = pollGeneration.current;
    fetch(`/api/payments/${provider}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (generation !== pollGeneration.current) return;
        if (json.status === "pending") {
          if (!poll) return;
          pollAttempts.current += 1;
          if (pollAttempts.current >= MAX_POLL_ATTEMPTS) {
            finishPayment();
            setToastMessage(t.subscription.stillPending);
            return;
          }
          pollTimer.current = setTimeout(() => verify(provider, transactionId), POLL_INTERVAL_MS);
          return;
        }
        finishPayment();
        if (!ok || json.status === "rejected") {
          setError(tError(json.error, t.subscription.paymentFailed));
          return;
        }
        load();
      })
      .catch(() => {
        if (generation !== pollGeneration.current) return;
        finishPayment();
        setError(t.subscription.verifyError);
      });
  }, [load, t, tError, finishPayment]);

  // Revérifie tout de suite (sans attendre le prochain tick) quand l'utilisateur revient sur l'onglet
  const verifyNow = useCallback(() => {
    if (!pendingTransactionId || !pendingProvider.current) return;
    stopPolling();
    verify(pendingProvider.current, pendingTransactionId);
  }, [pendingTransactionId, stopPolling, verify]);

  const handleCancelPayment = () => {
    finishPayment();
    setError("");
  };

  // Retour sur l'onglet d'origine, ou signal envoyé par l'onglet ouvert via l'URL de retour de l'agrégateur
  useEffect(() => {
    if (!pendingTransactionId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") verifyNow();
    };
    document.addEventListener("visibilitychange", onVisible);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(PAYMENT_CHANNEL);
      channel.onmessage = () => verifyNow();
    } catch {
      // BroadcastChannel non supporté
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      channel?.close();
    };
  }, [pendingTransactionId, verifyNow]);

  // Arrête le polling quand l'utilisateur quitte la page
  useEffect(() => stopPolling, [stopPolling]);

  // Onglet ouvert par l'URL de retour de l'agrégateur (paiement validé, refusé ou annulé)
  useEffect(() => {
    if (paymentStatus !== "return") return;
    notifyOtherTabs();
    if (returnStatus && RETURN_FAILED_STATUSES.has(returnStatus)) {
      writePendingPayment(null);
      setError(t.subscription.paymentFailed);
      return;
    }
    const pending = readPendingPayment();
    if (pending) verify(pending.provider, pending.transactionId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, returnStatus]);

  const handlePay = async () => {
    setError("");
    setSubmitting(true);
    try {
      // L'API choisit l'agrégateur actif (FedaPay ou GeniusPay) et renvoie `provider` pour le polling.
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(tError(json.error, t.common.genericError));
        return;
      }

      setCheckoutUrl(json.checkoutUrl);
      window.open(json.checkoutUrl, "_blank", "noopener,noreferrer");

      const provider: string = json.provider ?? "fedapay";
      stopPolling();
      pollAttempts.current = 0;
      pendingProvider.current = provider;
      writePendingPayment({ provider, transactionId: json.transactionId });
      setPendingTransactionId(json.transactionId);
      setDialogOpen(true);
      pollTimer.current = setTimeout(() => verify(provider, json.transactionId), POLL_INTERVAL_MS);
    } catch {
      setError(t.common.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  const constants = data?.constants;
  const daysTotal = constants?.days ?? 30;
  const priceEur = constants?.priceEur ?? 32;
  const priceXof = constants?.priceXof ?? 20800;
  const features = constants?.features ?? [];

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-6">{t.subscription.title}</h1>
      <div className="max-w-2xl mx-auto space-y-6">

        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {t.subscription.paymentSuccess}
          </div>
        )}
        {paymentStatus === "cancelled" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3 text-yellow-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {t.subscription.paymentCancelled}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </div>
        ) : (
          <>
            {/* Statut actuel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1A1A2E]">{t.subscription.currentTitle}</h2>
                {data.active ? (
                  <Badge variant="success">{t.subscription.active}</Badge>
                ) : data.status === "EXPIRED" ? (
                  <Badge variant="secondary">{t.subscription.expired}</Badge>
                ) : (
                  <Badge variant="destructive">{t.subscription.inactive}</Badge>
                )}
              </div>

              {data.active ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-[#FFF3E0] rounded-full flex items-center justify-center">
                      <Clock className="w-7 h-7 text-[#E87722]" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-[#1A1A2E]">{t.subscription.daysCount(data.daysLeft)}</p>
                      <p className="text-sm text-gray-500">
                        {t.subscription.remaining(data.expiresAt ? formatDate(data.expiresAt, locale) : "—")}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#E87722] h-2 rounded-full" style={{ width: `${Math.min(100, (data.daysLeft / daysTotal) * 100)}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  {data.status
                    ? t.subscription.expiredOn(data.expiresAt ? formatDate(data.expiresAt, locale) : "—")
                    : t.subscription.noSubscription}
                  {" "}{t.subscription.subscribeToBeVisible}
                </p>
              )}
            </div>

            {/* Activer / renouveler + contenu inclus */}
            <div className="bg-gradient-to-br from-[#E87722] to-[#ff9a3c] rounded-2xl p-6 text-white">
              <h2 className="font-bold text-xl mb-1">{data.active ? t.subscription.renewTitle : t.subscription.activateTitle}</h2>
              <p className="text-white/80 mb-4 text-sm">{t.subscription.stayVisible}</p>
              <div className="bg-white/20 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.subscription.planLabel(daysTotal)}</span>
                  <span className="font-extrabold text-xl">{formatCurrency(priceEur, "EUR", locale)}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">{t.subscription.fullAccess(formatCurrency(priceXof, "XOF", locale))}</p>
              </div>

              {features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">{t.subscription.includedTitle}</h3>
                  <div className="space-y-2.5">
                    {features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
                        {tValue(f)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingTransactionId ? (
                // Dialogue fermé mais paiement toujours en cours de vérification : permet de le rouvrir ou d'abandonner
                <div className="space-y-2">
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="w-full flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium transition-colors"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.subscription.waitingConfirmation}
                  </button>
                  <button
                    onClick={handleCancelPayment}
                    className="w-full text-center text-sm text-white/80 hover:text-white underline underline-offset-2"
                  >
                    {t.subscription.cancelPayment}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 disabled:opacity-60 rounded-xl p-3 text-sm font-medium transition-colors text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {t.subscription.payNow}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog.Root open={dialogOpen && !!pendingTransactionId} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
            <Dialog.Close
              aria-label={t.common.close}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-[#FFF3E0] rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-7 h-7 text-[#E87722] animate-spin" />
              </div>
              <Dialog.Title className="text-lg font-bold text-[#1A1A2E]">
                {t.subscription.waitingConfirmation}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                {t.subscription.finishPaymentHint}
              </Dialog.Description>
              {checkoutUrl && (
                <button
                  onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E87722] hover:bg-[#d96a1a] text-white rounded-xl px-6 py-4 text-base font-bold shadow-md transition-colors"
                >
                  {t.subscription.openPaymentPage}
                  <ExternalLink className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleCancelPayment}
                className="mt-3 w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t.subscription.cancelPayment}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Toast.Provider swipeDirection="up" duration={6000}>
        <Toast.Root
          open={!!toastMessage}
          onOpenChange={(open) => { if (!open) setToastMessage(""); }}
          className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-lg"
        >
          <AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0" />
          <Toast.Description className="flex-1">{toastMessage}</Toast.Description>
          <Toast.Close aria-label={t.common.close} className="rounded-full p-0.5 text-yellow-700 hover:bg-yellow-100">
            <X className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 outline-none" />
      </Toast.Provider>
    </DashboardLayout>
  );
}

export default function AbonnementPage() {
  return (
    <Suspense>
      <AbonnementContent />
    </Suspense>
  );
}
