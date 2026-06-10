"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Eye, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ProfileDetailModal from "@/components/admin/ProfileDetailModal";

type PendingProfile = {
  userId: string;
  role: "AU_PAIR" | "FAMILLE";
  name: string;
  country: string;
  flag: string;
  age: number;
  description: string;
  waitingDays: number;
  hasPhoto: boolean;
  hasId: boolean;
};

export default function ModerationPage() {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{ userId: string; role: "AU_PAIR" | "FAMILLE" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/moderation")
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (p: PendingProfile, action: "validate" | "reject") => {
    setProcessingId(p.userId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: p.userId, role: p.role, action }),
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((item) => item.userId !== p.userId));
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">File de modération</h1>
          <Badge variant="warning">{profiles.length} profil(s) en attente</Badge>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="font-bold text-[#1A1A2E] text-lg">File vide !</h2>
            <p className="text-gray-500">Tous les profils ont été traités.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div key={p.userId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#1A1A2E]">{p.name}</h3>
                        <span className="text-lg">{p.flag}</span>
                        <Badge variant={p.role === "AU_PAIR" ? "default" : "secondary"}>
                          {p.role === "AU_PAIR" ? "Au pair" : "Famille"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${p.hasPhoto ? "text-green-600" : "text-red-500"}`}>
                          {p.hasPhoto ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          Photo
                        </span>
                        <span className={`flex items-center gap-1 ${p.hasId ? "text-green-600" : "text-red-500"}`}>
                          {p.hasId ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          Pièce d'identité
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {p.waitingDays === 0 ? "Aujourd'hui" : `${p.waitingDays} jour(s)`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => setViewing({ userId: p.userId, role: p.role })}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Voir profil
                    </Button>
                    <Button size="sm" disabled={processingId === p.userId} onClick={() => handleAction(p, "validate")}
                      className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Valider
                    </Button>
                    <Button size="sm" variant="destructive" disabled={processingId === p.userId} onClick={() => handleAction(p, "reject")}>
                      <X className="w-3.5 h-3.5 mr-1" /> Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <ProfileDetailModal userId={viewing.userId} role={viewing.role} onClose={() => setViewing(null)} />
      )}
    </AdminLayout>
  );
}
