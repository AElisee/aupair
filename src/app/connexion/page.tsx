"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSafeCallbackUrl,
  getDefaultRedirectForRole,
} from "@/lib/safe-redirect";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function ConnexionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation côté client du callbackUrl dès le chargement de la page.
  // getSafeCallbackUrl rejette toute URL externe, schéma dangereux
  // (javascript:, data:…), double-slash (//evil.com) et retourne "/" en fallback.
  const rawCallback = searchParams.get("callbackUrl");
  const safeCallbackUrl = getSafeCallbackUrl(rawCallback);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { signIn } = await import("next-auth/react");

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false, // On contrôle la redirection pour utiliser l'URL validée
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      if (result?.ok) {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const userRole = (session?.user as { role?: string })?.role;

        // callbackUrl validé → prioritaire ; sinon dashboard du rôle
        const destination =
          safeCallbackUrl !== "/"
            ? safeCallbackUrl
            : getDefaultRedirectForRole(userRole);

        router.replace(destination);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    const { signIn } = await import("next-auth/react");
    // On passe uniquement l'URL déjà validée — jamais la valeur brute
    await signIn(provider, {
      callbackUrl:
        safeCallbackUrl !== "/" ? safeCallbackUrl : "/dashboard/au-pair",
    });
  };

  return (
    <div className="min-h-dvh flex">
      {/* Panneau gauche — déco */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#1A1A2E] to-[#0f3460] items-center justify-center p-12">
        <div className="text-center text-white max-w-sm">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Image
              src="/Logo_au_pair.png"
              alt="AuPair A.EU"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">
            Bienvenue sur AuPair A.EU
          </h2>
          <p className="text-gray-300 text-lg">
            La première plateforme mondiale dédiée aux au pairs africains.
          </p>
          <div className="mt-8 space-y-3 text-left">
            {[
              "✅ 5 000+ au pairs africains",
              "✅ 1 200+ familles d'accueil",
              "✅ 6 pays européens",
              "✅ Profils vérifiés",
            ].map((t) => (
              <p key={t} className="text-gray-300">
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          {/* <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <Image src="/Logo_au_pair.png" alt="AuPair A.EU" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-[#1A1A2E]">AuPair</span>
            <span className="text-[#E87722]">A.EU</span>
          </div> */}

          <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">
            Connexion
          </h1>
          <p className="text-gray-500 mb-8">Accédez à votre espace personnel</p>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              Continuer avec Google
            </button>
            <button
              onClick={() => handleOAuth("facebook")}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#166fe5] transition-colors"
            >
              <FaFacebook className="w-5 h-5" />
              Continuer avec Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou avec email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs text-[#E87722] hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="text-[#E87722] font-semibold hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
