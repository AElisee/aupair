import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-20 bg-[#E87722]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Prêt(e) à commencer votre aventure ?
        </h2>
        <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
          Rejoignez des milliers d'au pairs africains et de familles d'accueil sur la plateforme la plus dédiée à votre communauté.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/inscription?role=au-pair">
            <Button
              size="lg"
              className="bg-white text-[#E87722] hover:bg-gray-100 px-8 py-6 text-base font-bold"
            >
              Créer un profil d'au pair <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/inscription?role=famille">
            <Button
              size="lg"
              className="bg-[#1A1A2E] text-white hover:bg-[#2a2a3e] px-8 py-6 text-base font-bold"
            >
              Créer un profil famille <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
