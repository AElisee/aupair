"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ReinitialiserMotDePasseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/connexion"), 3000);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="text-[#1A1A2E]">AuPair</span>
          <span className="text-[#E87722]">A.EU</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">
          Réinitialiser le mot de passe
        </h1>

        {done ? (
          <div className="mt-6 px-4 py-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Votre mot de passe a été modifié. Redirection vers la connexion...</p>
          </div>
        ) : !token ? (
          <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            Ce lien de réinitialisation est invalide. Merci de refaire une
            demande depuis la page{" "}
            <Link href="/mot-de-passe-oublie" className="underline font-semibold">
              mot de passe oublié
            </Link>
            .
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-8">Choisissez votre nouveau mot de passe.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {loading ? "Modification en cours..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense>
      <ReinitialiserMotDePasseForm />
    </Suspense>
  );
}
