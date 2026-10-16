"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toast from "@radix-ui/react-toast";
import {
  CheckCircle, Wallet, Loader2, AlertCircle, ExternalLink, X, CalendarClock, Receipt, Sparkles,
  ShieldCheck, Lock, FileText, CreditCard, Smartphone, Globe,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ICON, ORANGE, TEAL, Panel, PanelHeader, Ring, pct } from "@/components/admin/AdminUI";

type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
type PaymentMethod = "MOBILE_MONEY" | "CARD" | "FEDAPAY" | "GENIUSPAY";
type Currency = "EUR" | "XOF" | "USD";

type PaymentRow = {
  id: string;
  date: string;
  startsAt: string;
  expiresAt: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: SubscriptionStatus;
  reference: string | null;
  invoiceUrl: string | null;
};

type SubscriptionData = {
  active: boolean;
  status: SubscriptionStatus | null;
  startsAt: string | null;
  expiresAt: string | null;
  daysLeft: number;
  amount: number | null;
  currency: Currency | null;
  paymentMethod: PaymentMethod | null;
  countryOfOrigin: string | null;
  history: PaymentRow[];
  constants: { priceEur: number; priceXof: number; days: number; features: string[] };
};

type Tab = "current" | "plan" | "history";
const TABS: Tab[] = ["current", "plan", "history"];

const STATUS_VARIANTS: Record<SubscriptionStatus, "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  EXPIRED: "secondary",
  CANCELLED: "warning",
  REFUNDED: "destructive",
};

const TH = "px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left";
const PRIMARY_BUTTON =
  "w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition disabled:opacity-60";
const DISABLED_BUTTON =
  "w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";

const methodIcon = (method: PaymentMethod) => {
  const props = { ...ICON, size: 15 };
  if (method === "MOBILE_MONEY") return <Smartphone {...props} />;
  if (method === "CARD") return <CreditCard {...props} />;
  return <Globe {...props} />;
};

// `color` : fond teinté (dates de début / d'expiration) ; sinon fond blanc translucide
function Detail({ label, color, children }: { label: string; color?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${color ? "" : "bg-white/70 border-gray-100"}`}
      style={color ? { backgroundColor: `${color}14`, borderColor: `${color}33` } : undefined}
    >
      <p className="text-xs" style={{ color: color ?? "#6B7280" }}>{label}</p>
      <div className="text-sm text-[#1A1A2E] mt-0.5 tabular-nums">{children}</div>
    </div>
  );
}

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
  const [tab, setTab] = useState<Tab>("current");
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
  const ts = t.subscription;
  const fmtDate = (date: string | null) => (date ? formatDate(date, locale) : "—");

  const active = data?.active ?? false;
  const daysLeft = data?.daysLeft ?? 0;
  const expiringSoon = active && daysLeft <= 7;
  const statusColor = !active ? "#D64545" : expiringSoon ? ORANGE : TEAL;
  const history = data?.history ?? [];

  const statusBadge = data ? (
    active ? (
      <Badge variant={expiringSoon ? "warning" : "success"}>{ts.active}</Badge>
    ) : data.status === "EXPIRED" ? (
      <Badge variant="secondary">{ts.expired}</Badge>
    ) : (
      <Badge variant="destructive">{ts.inactive}</Badge>
    )
  ) : null;

  // Bouton de paiement : non cliquable tant que l'abonnement en cours n'a pas expiré
  const payButton = active ? (
    <div className="space-y-2">
      <button type="button" disabled className={DISABLED_BUTTON}>
        <Lock {...ICON} size={16} />
        {ts.alreadyActive}
      </button>
      <p className="text-xs text-gray-500 text-center">{ts.renewFrom(fmtDate(data?.expiresAt ?? null))}</p>
    </div>
  ) : pendingTransactionId ? (
    // Dialogue fermé mais paiement toujours en cours de vérification : permet de le rouvrir ou d'abandonner
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm border border-[#E87722]/30 bg-[#FFF3E0] text-[#E87722] hover:bg-[#FFE7C7] transition"
      >
        <Loader2 {...ICON} size={16} className="animate-spin" />
        {ts.waitingConfirmation}
      </button>
      <button
        type="button"
        onClick={handleCancelPayment}
        className="w-full text-center text-sm text-gray-500 hover:text-[#1A1A2E] underline underline-offset-2"
      >
        {ts.cancelPayment}
      </button>
    </div>
  ) : (
    <button type="button" onClick={handlePay} disabled={submitting} className={PRIMARY_BUTTON}>
      {submitting ? <Loader2 {...ICON} size={16} className="animate-spin" /> : <Wallet {...ICON} size={16} />}
      {ts.payNow}
    </button>
  );

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-6">
        <PageHeader title={ts.title} subtitle={ts.subtitle} action={statusBadge} />

        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700 text-sm">
            <CheckCircle {...ICON} className="flex-shrink-0" />
            {ts.paymentSuccess}
          </div>
        )}
        {paymentStatus === "cancelled" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3 text-yellow-700 text-sm">
            <AlertCircle {...ICON} className="flex-shrink-0" />
            {ts.paymentCancelled}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle {...ICON} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div role="tablist" className="flex gap-1 border-b border-gray-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === key ? "border-[#E87722] text-[#E87722]" : "border-transparent text-gray-500 hover:text-[#1A1A2E]"
              }`}
            >
              {ts.tabs[key]}
              {key === "history" && history.length > 0 && (
                <span className="ml-1.5 text-xs text-gray-400 tabular-nums">{history.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <Panel className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </Panel>
        ) : tab === "current" ? (
          <div className="grid lg:grid-cols-3 gap-4">
            <Panel className="p-5 lg:col-span-2" tint={statusColor}>
              <PanelHeader title={ts.currentTitle} icon={CalendarClock} color={statusColor} />
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Ring ratio={pct(daysLeft, daysTotal)} color={statusColor} size={136}>
                  <span className="text-3xl font-semibold text-[#1A1A2E] tabular-nums leading-none">{daysLeft}</span>
                  <span className="text-[11px] text-gray-500 mt-1 px-4 leading-tight">{ts.daysLeftLabel}</span>
                </Ring>
                <div className="flex-1 w-full space-y-4">
                  {!active && (
                    <p className="text-sm text-gray-500">
                      {data.status ? ts.expiredOn(fmtDate(data.expiresAt)) : ts.noSubscription}{" "}
                      {ts.subscribeToBeVisible}
                    </p>
                  )}
                  {data.status && (
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                      <Detail label={ts.startedOn} color={TEAL}>{fmtDate(data.startsAt)}</Detail>
                      <Detail label={ts.expiresOn} color={active ? ORANGE : "#D64545"}>{fmtDate(data.expiresAt)}</Detail>
                      <Detail label={ts.lastPayment}>
                        {data.amount != null ? formatCurrency(data.amount, data.currency ?? "EUR", locale) : "—"}
                      </Detail>
                      <Detail label={ts.paymentMethod}>
                        {data.paymentMethod ? (
                          <span className="inline-flex items-center gap-1.5">
                            {methodIcon(data.paymentMethod)}
                            {ts.methods[data.paymentMethod]}
                          </span>
                        ) : "—"}
                      </Detail>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <Panel className="p-5 flex flex-col" tint={ORANGE}>
              <PanelHeader title={ts.planLabel(daysTotal)} icon={Sparkles} />
              <p className="text-2xl font-semibold text-[#1A1A2E] tabular-nums">{formatCurrency(priceEur, "EUR", locale)}</p>
              <p className="text-xs text-gray-500 mb-5">{ts.priceXof(formatCurrency(priceXof, "XOF", locale))}</p>
              <div className="flex-1" />
              {active ? (
                payButton
              ) : (
                <button type="button" onClick={() => setTab("plan")} className={PRIMARY_BUTTON}>
                  {ts.seePlan}
                </button>
              )}
            </Panel>
          </div>
        ) : tab === "plan" ? (
          <div className="grid lg:grid-cols-3 gap-4">
            <Panel className="p-5 lg:col-span-2" tint={ORANGE}>
              <PanelHeader
                title={active ? ts.includedTitle : ts.activateTitle}
                subtitle={ts.stayVisible}
                icon={Sparkles}
              />
              {features.length > 0 && (
                <>
                  {!active && <h3 className="text-sm text-gray-700 mb-3">{ts.includedTitle}</h3>}
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-[#1A1A2E]">
                        <CheckCircle {...ICON} size={16} className="text-[#3FA45B] mt-0.5 flex-shrink-0" />
                        {tValue(f)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>

            <Panel className="p-5 flex flex-col">
              <PanelHeader title={ts.planLabel(daysTotal)} icon={Wallet} />
              <div className="mb-5">
                <p className="text-3xl font-semibold text-[#1A1A2E] tabular-nums">
                  {formatCurrency(priceEur, "EUR", locale)}
                  <span className="ml-1.5 text-sm font-normal text-gray-500">{ts.priceLabel(daysTotal)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{ts.priceXof(formatCurrency(priceXof, "XOF", locale))}</p>
              </div>
              <div className="flex-1" />
              {payButton}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck {...ICON} size={14} />
                {ts.securePayment}
              </p>
            </Panel>
          </div>
        ) : (
          <Panel className="py-5">
            <div className="px-5">
              <PanelHeader title={ts.tabs.history} subtitle={ts.historySubtitle(history.length)} icon={Receipt} />
            </div>
            {history.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">{ts.noPayments}</p>
            ) : (
              <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#E87722]/60">
                <table className="w-full text-sm">
                  <thead className="border-y border-gray-200/60 bg-white/60">
                    <tr>
                      <th className={TH}>{ts.colDate}</th>
                      <th className={TH}>{ts.colPeriod}</th>
                      <th className={TH}>{ts.colAmount}</th>
                      <th className={TH}>{ts.colMethod}</th>
                      <th className={TH}>{ts.status}</th>
                      <th className={TH}>{ts.colReference}</th>
                      <th className={`${TH} !text-right`}>{ts.colInvoice}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {history.map((p) => (
                      <tr key={p.id} className="hover:bg-white/70 transition-colors">
                        <td className="px-5 py-3 text-gray-700 tabular-nums whitespace-nowrap">{fmtDate(p.date)}</td>
                        <td className="px-5 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                          {fmtDate(p.startsAt)} → {fmtDate(p.expiresAt)}
                        </td>
                        <td className="px-5 py-3 font-medium text-[#1A1A2E] tabular-nums whitespace-nowrap">
                          {formatCurrency(p.amount, p.currency, locale)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-gray-600">
                            {methodIcon(p.method)}
                            {ts.methods[p.method] ?? p.method}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={STATUS_VARIANTS[p.status]}>{ts.statuses[p.status]}</Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">{p.reference ?? "—"}</td>
                        <td className="px-5 py-3 text-right">
                          {p.invoiceUrl ? (
                            <a
                              href={p.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#E87722] text-xs hover:underline"
                            >
                              <FileText {...ICON} size={14} />PDF
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
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
              <Dialog.Title className="text-lg font-medium text-[#1A1A2E]">
                {t.subscription.waitingConfirmation}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                {t.subscription.finishPaymentHint}
              </Dialog.Description>
              {checkoutUrl && (
                <button
                  onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E87722] hover:bg-[#d96a1a] text-white rounded-xl px-6 py-4 text-base font-medium shadow-md transition-colors"
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
