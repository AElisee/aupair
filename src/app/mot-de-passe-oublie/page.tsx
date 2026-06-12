"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 font-bold text-xl mb-8">
          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#1A1A2E]">AuPair</span>
          <span className="text-[#E87722]">A.EU</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">
          Mot de passe oublié
        </h1>

        {sent ? (
          <div className="mt-6 px-4 py-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
            <CheckCircle className="w-5 h-5  shrink-0 mt-0.5" />
            <p>
              Si un compte existe avec cette adresse email, un lien de
              réinitialisation vient de vous être envoyé. Pensez à vérifier vos
              courriers indésirables.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-8">
              Indiquez votre adresse email, nous vous envoyons un lien pour
              réinitialiser votre mot de passe.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="votre@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </form>
          </>
        )}

        <Link
          href="/connexion"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#E87722] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
