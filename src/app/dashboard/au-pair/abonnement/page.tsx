"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home, CheckCircle, Clock, Wallet, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

type SubscriptionData = {
  active: boolean;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED" | null;
  expiresAt: string | null;
  daysLeft: number;
  amount: number | null;
  currency: "EUR" | "XOF" | "USD" | null;
  constants: { priceEur: number; priceXof: number; days: number; features: string[] };
};

type SebpayCountry = { country_code: string; country_name: string; prefix: string };
type SebpayOperator = { slug: string; name: string; otp_required: boolean; ussd_code?: string };

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;

function AbonnementContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [countries, setCountries] = useState<SebpayCountry[]>([]);
  const [operators, setOperators] = useState<SebpayOperator[]>([]);
  const [country, setCountry] = useState("");
  const [operator, setOperator] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [providerLink, setProviderLink] = useState<string | null>(null);
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

  useEffect(() => {
    fetch("/api/payments/sebpay/countries")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.countries?.length) return;
        setCountries(json.countries);
        setCountry(json.countries[0].country_code);
      });
  }, []);

  useEffect(() => {
    if (!country) return;
    setOperator("");
    setOperators([]);
    fetch(`/api/payments/sebpay/operators?country=${encodeURIComponent(country)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.operators?.length) return;
        setOperators(json.operators);
        setOperator(json.operators[0].slug);
      });
    const selected = countries.find((c) => c.country_code === country);
    if (selected) setPhone(selected.prefix);
  }, [country, countries]);

  const paymentStatus = searchParams.get("payment");
  const selectedOperator = operators.find((o) => o.slug === operator);

  const verify = useCallback((reference: string) => {
    fetch("/api/payments/sebpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (json.status === "pending") {
          pollAttempts.current += 1;
          if (pollAttempts.current >= MAX_POLL_ATTEMPTS) {
            setPendingReference(null);
            setError("Le paiement est toujours en attente. Vérifiez votre téléphone ou réessayez dans quelques minutes.");
            return;
          }
          setTimeout(() => verify(reference), POLL_INTERVAL_MS);
          return;
        }
        setPendingReference(null);
        setProviderLink(null);
        if (!ok || json.status === "rejected") {
          setError(json.error ?? "Le paiement a échoué ou a été refusé.");
          return;
        }
        load();
      })
      .catch(() => {
        setPendingReference(null);
        setError("Erreur lors de la vérification du paiement. Contactez le support.");
      });
  }, [load]);

  const handleSubmit = async () => {
    setError("");
    if (!country || !operator || !phone.trim()) {
      setError("Veuillez renseigner le pays, l'opérateur et le numéro de téléphone.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/sebpay/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          operator,
          phone: phone.trim(),
          otpCode: otpCode.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
        return;
      }

      if (json.providerLink) {
        setProviderLink(json.providerLink);
        window.open(json.providerLink, "_blank", "noopener,noreferrer");
      }

      if (json.status === "approved") {
        load();
        return;
      }

      pollAttempts.current = 0;
      setPendingReference(json.externalReference);
      setTimeout(() => verify(json.externalReference), POLL_INTERVAL_MS);
    } catch {
      setError("Une erreur est survenue.");
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
    <DashboardLayout navItems={navItems} role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Mon abonnement</h1>

        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            Paiement réussi ! Votre abonnement sera activé dans quelques instants.
          </div>
        )}
        {paymentStatus === "cancelled" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3 text-yellow-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            Le paiement a été annulé.
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
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Statut actuel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1A1A2E]">Abonnement actuel</h2>
                {data.active ? (
                  <Badge variant="success">Actif</Badge>
                ) : data.status === "EXPIRED" ? (
                  <Badge variant="secondary">Expiré</Badge>
                ) : (
                  <Badge variant="destructive">Inactif</Badge>
                )}
              </div>

              {data.active ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-[#FFF3E0] rounded-full flex items-center justify-center">
                      <Clock className="w-7 h-7 text-[#E87722]" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-[#1A1A2E]">{data.daysLeft} jour{data.daysLeft > 1 ? "s" : ""}</p>
                      <p className="text-sm text-gray-500">
                        restants · Expire le {data.expiresAt ? formatDate(data.expiresAt) : "—"}
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
                    ? `Votre abonnement a expiré le ${data.expiresAt ? formatDate(data.expiresAt) : "—"}.`
                    : "Vous n'avez pas encore d'abonnement actif."}
                  {" "}Souscrivez pour être visible par toutes les familles d&apos;accueil.
                </p>
              )}
            </div>

            {/* Renouveler */}
            <div className="bg-gradient-to-br from-[#E87722] to-[#ff9a3c] rounded-2xl p-6 text-white">
              <h2 className="font-bold text-xl mb-1">{data.active ? "Renouveler mon abonnement" : "Activer mon abonnement"}</h2>
              <p className="text-white/80 mb-4 text-sm">Restez visible par toutes les familles d&apos;accueil.</p>
              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Abonnement {daysTotal} jours</span>
                  <span className="font-extrabold text-xl">{formatCurrency(priceEur, "EUR")}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">= {formatCurrency(priceXof, "XOF")} · Accès complet à toutes les fonctionnalités</p>
              </div>

              {pendingReference ? (
                <div className="bg-white/20 rounded-xl p-4 flex items-center gap-3 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <div>
                    <p className="font-medium">En attente de confirmation du paiement...</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      {providerLink
                        ? "Validez le paiement dans l'onglet ouvert, ou sur votre téléphone."
                        : "Validez la transaction sur votre téléphone (USSD/notification)."}
                    </p>
                    {providerLink && (
                      <button
                        onClick={() => window.open(providerLink, "_blank", "noopener,noreferrer")}
                        className="mt-2 inline-flex items-center gap-1 text-xs underline"
                      >
                        Ouvrir la page de paiement <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="bg-white/20 rounded-xl p-3 text-sm text-white [&>option]:text-[#1A1A2E]"
                    >
                      {countries.map((c) => (
                        <option key={c.country_code} value={c.country_code}>{c.country_name}</option>
                      ))}
                    </select>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="bg-white/20 rounded-xl p-3 text-sm text-white [&>option]:text-[#1A1A2E]"
                    >
                      {operators.map((o) => (
                        <option key={o.slug} value={o.slug}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Numéro de téléphone (format international, sans +)"
                    className="w-full bg-white/20 rounded-xl p-3 text-sm text-white placeholder:text-white/70"
                  />
                  {selectedOperator?.otp_required && (
                    <div className="space-y-1">
                      {selectedOperator.ussd_code && (
                        <p className="text-white/80 text-xs">
                          Composez <strong>{selectedOperator.ussd_code}</strong> sur votre téléphone pour recevoir le code, puis saisissez-le ci-dessous.
                        </p>
                      )}
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Code reçu par SMS/USSD"
                        className="w-full bg-white/20 rounded-xl p-3 text-sm text-white placeholder:text-white/70"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center gap-3 bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 disabled:opacity-60 rounded-xl p-3 text-sm font-medium transition-colors text-white"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                    Payer maintenant ({formatCurrency(priceXof, "XOF")})
                  </button>
                </div>
              )}
            </div>

            {/* Inclus dans l'abonnement */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-[#1A1A2E] mb-4">Inclus dans votre abonnement</h2>
              <div className="space-y-3">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                    {f}
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
