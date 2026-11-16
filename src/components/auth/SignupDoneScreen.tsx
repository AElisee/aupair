"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { SIGNUP_PAGE_BACKGROUND, type SignupRole } from "./SignupProfileFields";

/**
 * Confirmation de fin d'inscription : compte en attente de validation par l'équipe (email envoyé).
 * Affichée par `/inscription` et par `/inscription/completer` (comptes Google/Facebook), sans session.
 */
export function SignupDoneScreen({ role }: { role: SignupRole }) {
  const { t } = useI18n();
  const s = t.signup;

  return (
    <div className={`min-h-dvh flex items-center justify-center p-8 ${SIGNUP_PAGE_BACKGROUND}`}>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">{s.doneTitle}</h1>
        <p className="text-gray-500 mb-6">{role === "au-pair" ? s.doneAuPair : s.doneFamily}</p>
        <Link href={role === "au-pair" ? "/trouver-famille" : "/trouver-au-pair"}>
          <Button size="lg">{role === "au-pair" ? s.browseFamilies : s.browseAuPairs}</Button>
        </Link>
      </div>
    </div>
  );
}
