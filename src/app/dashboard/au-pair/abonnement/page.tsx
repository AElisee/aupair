"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home, CheckCircle, Clock, Smartphone, Loader2, AlertCircle } from "lucide-react";
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

function AbonnementContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingMethod, setPayingMethod] = useState<"card" | "mobile" | "dev" | null>(null);
  const [error, setError] = useState("");

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

  const handleStripe = async () => {
    setError("");
    setPayingMethod("card");
    try {
      const res = await fetch("/api/payments/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setPayingMethod(null);
    }
  };

  const handleCinetPay = async () => {
    setError("");
    setPayingMethod("mobile");
    try {
      const res = await fetch("/api/payments/cinetpay/init", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setPayingMethod(null);
    }
  };

  const handleDevActivate = async () => {
    setError("");
    setPayingMethod("dev");
    try {
      const res = await fetch("/api/subscription/dev-activate", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.");
        return;
      }
      load();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setPayingMethod(null);
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
              <div className="space-y-2">
                <button
                  onClick={handleCinetPay}
                  disabled={payingMethod !== null}
                  className="w-full flex items-center gap-3 bg-white/20 hover:bg-white/30 disabled:opacity-60 rounded-xl p-3 text-sm font-medium transition-colors"
                >
                  {payingMethod === "mobile" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                  Payer par Mobile Money ({formatCurrency(priceXof, "XOF")})
                </button>
                <button
                  onClick={handleStripe}
                  disabled={payingMethod !== null}
                  className="w-full flex items-center gap-3 bg-white/20 hover:bg-white/30 disabled:opacity-60 rounded-xl p-3 text-sm font-medium transition-colors"
                >
                  {payingMethod === "card" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Payer par carte bancaire ({formatCurrency(priceEur, "EUR")})
                </button>
              </div>
              <button
                onClick={handleDevActivate}
                disabled={payingMethod !== null}
                className="w-full flex items-center justify-center gap-2 mt-3 border border-white/30 hover:bg-white/10 disabled:opacity-60 rounded-xl p-2.5 text-xs font-medium transition-colors text-white/80"
              >
                {payingMethod === "dev" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Activer l&apos;abonnement (test, sans paiement)
              </button>
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
