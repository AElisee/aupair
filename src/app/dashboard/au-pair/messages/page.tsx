"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

const conversations = [
  { id: "1", name: "Famille Martin", flag: "🇫🇷", city: "Lyon", lastMessage: "Bonjour ! Votre profil nous intéresse beaucoup.", time: "Il y a 2h", unread: 2, isActive: true },
  { id: "2", name: "Familie Schmidt", flag: "🇩🇪", city: "Berlin", lastMessage: "Merci pour votre message, pouvez-vous...", time: "Hier", unread: 0, isActive: true },
  { id: "3", name: "Famille Moreau", flag: "🇫🇷", city: "Paris", lastMessage: "Nous avons bien reçu votre candidature.", time: "Il y a 3j", unread: 0, isActive: false },
];

const mockMessages = [
  { id: "1", sender: "famille", text: "Bonjour Aminata ! Votre profil nous intéresse beaucoup.", time: "14:30" },
  { id: "2", sender: "moi", text: "Bonjour ! Merci beaucoup pour votre message. Je suis très intéressée par votre famille.", time: "14:45" },
  { id: "3", sender: "famille", text: "Parfait ! Seriez-vous disponible pour une vidéoconférence cette semaine ?", time: "15:00" },
];

export default function MessagesPage() {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const hasSubscription = true; // TODO: vérifier depuis la session

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName="Aminata K.">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-6">Messages</h1>

        {!hasSubscription ? (
          <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-8 text-center">
            <Lock className="w-12 h-12 text-[#E87722] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Messagerie réservée aux abonnés</h2>
            <p className="text-gray-500 mb-6">Activez votre abonnement pour envoyer et recevoir des messages des familles d'accueil.</p>
            <Link href="/dashboard/au-pair/abonnement">
              <Button>Activer l'abonnement — 32€/30j</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
            <div className="flex h-full">
              {/* Liste conversations */}
              <div className="w-80 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conv) => (
                    <button key={conv.id} onClick={() => setActiveConv(conv)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeConv.id === conv.id ? "bg-[#FFF3E0]" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <span className="text-lg">{conv.flag}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-[#1A1A2E] text-sm truncate">{conv.name}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="w-5 h-5 bg-[#E87722] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation active */}
              <div className="flex-1 flex flex-col">
                {/* En-tête */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="text-2xl">{activeConv.flag}</div>
                  <div>
                    <p className="font-bold text-[#1A1A2E]">{activeConv.name}</p>
                    <p className="text-xs text-gray-400">{activeConv.city}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={activeConv.isActive ? "success" : "secondary"}>
                      {activeConv.isActive ? "En ligne" : "Hors ligne"}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "moi" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "moi"
                          ? "bg-[#E87722] text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "moi" ? "text-white/70" : "text-gray-400"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input message */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                      placeholder="Écrire un message..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                      onKeyDown={e => { if (e.key === "Enter" && newMessage.trim()) setNewMessage(""); }}
                    />
                    <Button size="icon" onClick={() => setNewMessage("")} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
