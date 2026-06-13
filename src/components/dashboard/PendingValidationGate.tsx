import Link from "next/link";
import { Clock, Globe } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function PendingValidationGate({ role }: { role: "au-pair" | "famille" }) {
  const browseHref = role === "au-pair" ? "/trouver-famille" : "/trouver-au-pair";
  const browseLabel = role === "au-pair" ? "Consulter les familles d'accueil" : "Consulter les au pairs";

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A2E]">AuPair<span className="text-[#E87722]">A.EU</span></span>
        </div>
        <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-[#E87722]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">Profil en cours de vérification</h1>
        <p className="text-gray-500 mb-6">
          Votre tableau de bord sera accessible dès que notre équipe aura validé votre profil. Vous recevrez un email de confirmation dans les 24-48h.
        </p>
        <Link href={browseHref}>
          <Button size="lg">{browseLabel}</Button>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          className="block mx-auto mt-6 text-sm text-gray-400 hover:text-[#1A1A2E] font-medium"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
