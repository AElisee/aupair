"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { t, tError } = useI18n();
  const f = t.forgotPassword;

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
        setError(tError(data.error, t.login.genericError));
        return;
      }

      setSent(true);
    } catch {
      setError(t.login.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 font-bold text-base sm:text-xl mb-8">
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-[#1A1A2E]">AuPair</span>
          <span className="text-[#E87722]">A.EU</span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">
          {f.title}
        </h1>

        {sent ? (
          <div className="mt-6 px-4 py-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
            <CheckCircle className="w-5 h-5  shrink-0 mt-0.5" />
            <p>{f.sent}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-8">{f.intro}</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.login.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder={t.login.emailPlaceholder}
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
                {loading ? f.sending : f.submit}
              </Button>
            </form>
          </>
        )}

        <Link
          href="/connexion"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#E87722] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {f.backToLogin}
        </Link>
      </div>
    </div>
  );
}
