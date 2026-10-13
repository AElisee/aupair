"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Wallet, Loader2, AlertCircle, ExternalLink } from "lucide-react";
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

function AbonnementContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { t, locale, tValue, tError } = useI18n();

  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<number | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const pollAttempts = useRef(0);

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

  const verify = useCallback((transactionId: number) => {
    fetch("/api/payments/fedapay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (json.status === "pending") {
          pollAttempts.current += 1;
          if (pollAttempts.current >= MAX_POLL_ATTEMPTS) {
            setPendingTransactionId(null);
            setError(t.subscription.stillPending);
            return;
          }
          setTimeout(() => verify(transactionId), POLL_INTERVAL_MS);
          return;
        }
        setPendingTransactionId(null);
        setCheckoutUrl(null);
        if (!ok || json.status === "rejected") {
          setError(tError(json.error, t.subscription.paymentFailed));
          return;
        }
        load();
      })
      .catch(() => {
        setPendingTransactionId(null);
        setError(t.subscription.verifyError);
      });
  }, [load, t, tError]);

  const handlePay = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/fedapay/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(tError(json.error, t.common.genericError));
        return;
      }

      setCheckoutUrl(json.checkoutUrl);
      window.open(json.checkoutUrl, "_blank", "noopener,noreferrer");

      pollAttempts.current = 0;
      setPendingTransactionId(json.transactionId);
      setTimeout(() => verify(json.transactionId), POLL_INTERVAL_MS);
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
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{t.subscription.title}</h1>

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

            {/* Renouveler */}
            <div className="bg-gradient-to-br from-[#E87722] to-[#ff9a3c] rounded-2xl p-6 text-white">
              <h2 className="font-bold text-xl mb-1">{data.active ? t.subscription.renewTitle : t.subscription.activateTitle}</h2>
              <p className="text-white/80 mb-4 text-sm">{t.subscription.stayVisible}</p>
              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.subscription.planLabel(daysTotal)}</span>
                  <span className="font-extrabold text-xl">{formatCurrency(priceEur, "EUR", locale)}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">{t.subscription.fullAccess(formatCurrency(priceXof, "XOF", locale))}</p>
              </div>

              {pendingTransactionId ? (
                <div className="bg-white/20 rounded-xl p-4 flex items-center gap-3 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t.subscription.waitingConfirmation}</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      {t.subscription.finishPaymentHint}
                    </p>
                    {checkoutUrl && (
                      <button
                        onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}
                        className="mt-2 inline-flex items-center gap-1 text-xs underline"
                      >
                        {t.subscription.openPaymentPage} <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
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

            {/* Inclus dans l'abonnement */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-[#1A1A2E] mb-4">{t.subscription.includedTitle}</h2>
              <div className="space-y-3">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                    {tValue(f)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
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
