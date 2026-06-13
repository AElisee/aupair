"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Search, Send, Loader2, MessageCircle, Ban, Paperclip, FileText, Download, Flag, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { useConstants } from "@/hooks/useConstants";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionLock";

interface ConversationSummary {
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  status: string;
  createdAt: string;
}

interface OtherUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  AU_PAIR: "Au pair",
  FAMILLE: "Famille d'accueil",
  AGENCE: "Agence",
  ADMIN: "Admin",
};

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  return (
    <div className="w-10 h-10 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="w-full h-full object-cover object-top" />
      ) : (
        <span>{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Étiquette du séparateur de jour affiché entre les messages (Aujourd'hui, Hier, jour de la semaine, Semaine dernière, ou date)
function getDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) {
    const weekday = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  if (diffDays < 14) return "Semaine dernière";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
  }).format(date);
}

export default function MessagesPanel() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const myId = session?.user?.id;
  const { reportReasons: REPORT_REASONS } = useConstants();

  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockProcessing, setBlockProcessing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialSelectionDone = useRef(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations as ConversationSummary[]);
    } catch {
      setConversations((prev) => prev ?? []);
    }
  }, []);

  const loadThread = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages as MessageItem[]);
      setOtherUser(data.otherUser as OtherUser);
      setIsBlocked(Boolean(data.isBlocked));
      setBlockedByMe(Boolean(data.blockedByMe));

      const hasUnread = (data.messages as MessageItem[]).some(
        (m) => m.receiverId === myId && m.status === "SENT"
      );
      if (hasUnread) {
        await fetch(`/api/messages/${userId}/read`, { method: "POST" });
        setConversations((prev) =>
          prev ? prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)) : prev
        );
      }
    } catch {
      // erreur silencieuse, l'utilisateur peut recharger la page
    }
  }, [myId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (session?.user?.role !== "AU_PAIR") return;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setSubscriptionActive(Boolean(json.active));
      });
  }, [session?.user?.role]);

  // Sélection initiale : conversation passée en query (?userId=) ou première de la liste
  useEffect(() => {
    if (initialSelectionDone.current) return;
    const userIdParam = searchParams.get("userId");
    if (userIdParam) {
      setActiveUserId(userIdParam);
      setMobileShowChat(true);
      initialSelectionDone.current = true;
    } else if (conversations && conversations.length > 0) {
      setActiveUserId(conversations[0].userId);
      initialSelectionDone.current = true;
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!activeUserId) return;
    setLoadingThread(true);
    loadThread(activeUserId).finally(() => setLoadingThread(false));
  }, [activeUserId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Met à jour la liste des conversations localement après l'envoi d'un message,
  // sans recharger /api/messages.
  const bumpConversation = useCallback((userId: string, lastMessage: string) => {
    setConversations((prev) => {
      const now = new Date().toISOString();
      const existing = prev?.find((c) => c.userId === userId);
      const updated: ConversationSummary = existing
        ? { ...existing, lastMessage, lastMessageAt: now, lastMessageFromMe: true, unreadCount: 0 }
        : {
            userId,
            name: otherUser?.name ?? "",
            avatar: otherUser?.avatar ?? null,
            role: otherUser?.role ?? "",
            lastMessage,
            lastMessageAt: now,
            lastMessageFromMe: true,
            unreadCount: 0,
          };
      const rest = (prev ?? []).filter((c) => c.userId !== userId);
      return [updated, ...rest];
    });
  }, [otherUser]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || !activeUserId || sending) return;

    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeUserId, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Erreur lors de l'envoi du message.");
        return;
      }
      setMessages((prev) => [...prev, data.message as MessageItem]);
      setNewMessage("");
      bumpConversation(activeUserId, content);
    } catch {
      setSendError("Erreur réseau, veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeUserId || uploading) return;

    setUploading(true);
    setSendError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("receiverId", activeUserId);
      const res = await fetch("/api/messages/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Erreur lors de l'envoi du fichier.");
        return;
      }
      const sentMessage = data.message as MessageItem;
      setMessages((prev) => [...prev, sentMessage]);
      const lastMessage =
        sentMessage.content ||
        (sentMessage.attachmentType?.startsWith("image/") ? "📷 Photo" : "📄 Document");
      bumpConversation(activeUserId, lastMessage);
    } catch {
      setSendError("Erreur réseau, veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!activeUserId || blockProcessing) return;
    setBlockProcessing(true);
    try {
      if (blockedByMe) {
        const res = await fetch(`/api/blocks?blockedId=${activeUserId}`, { method: "DELETE" });
        if (res.ok) setBlockedByMe(false);
      } else {
        const res = await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockedId: activeUserId }),
        });
        if (res.ok) setBlockedByMe(true);
      }
      loadThread(activeUserId);
    } finally {
      setBlockProcessing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!activeUserId || !reportReason || reportSubmitting) return;
    setReportSubmitting(true);
    setReportError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: activeUserId,
          reason: reportReason,
          description: reportDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error || "Erreur lors de l'envoi du signalement.");
        return;
      }
      setReportSent(true);
    } catch {
      setReportError("Erreur réseau, veuillez réessayer.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    setReportError("");
    setReportSent(false);
  };

  const baseList = conversations ?? [];
  // Si la conversation active (ouverte via ?userId=) n'a pas encore de message, on l'affiche quand même
  const displayList =
    activeUserId && otherUser && !baseList.some((c) => c.userId === activeUserId)
      ? [
          {
            userId: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            role: otherUser.role,
            lastMessage: "Nouvelle conversation",
            lastMessageAt: new Date().toISOString(),
            lastMessageFromMe: false,
            unreadCount: 0,
          },
          ...baseList,
        ]
      : baseList;

  const filteredList = search.trim()
    ? displayList.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : displayList;

  if (conversations === null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-[calc(100vh-180px)] min-h-[420px] md:h-[calc(100vh-200px)] md:min-h-[500px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#E87722]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100vh-180px)] min-h-[420px] md:h-[calc(100vh-200px)] md:min-h-[500px]">
      <div className="flex h-full">
        {/* Liste conversations */}
        <div className={`w-full md:w-80 border-r border-gray-100 flex-col ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Aucune conversation pour le moment.
              </div>
            ) : (
              filteredList.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => {
                    setActiveUserId(conv.userId);
                    setMobileShowChat(true);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeUserId === conv.userId ? "bg-[#FFF3E0]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={conv.name} avatar={conv.avatar} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-[#1A1A2E] text-sm truncate">{conv.name}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatRelativeDate(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessageFromMe && "Vous : "}{conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#E87722] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation active */}
        <div className={`flex-1 flex-col min-w-0 ${mobileShowChat ? "flex" : "hidden md:flex"}`}>
          {!activeUserId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Sélectionnez une conversation
            </div>
          ) : !otherUser ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#E87722]" />
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden -ml-1 p-1.5 text-gray-500 hover:text-[#1A1A2E] flex-shrink-0"
                  title="Retour aux conversations"
                  aria-label="Retour aux conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={otherUser.name} avatar={otherUser.avatar} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1A2E] truncate">{otherUser.name}</p>
                  <p className="text-xs text-gray-400">{ROLE_LABELS[otherUser.role] ?? otherUser.role}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    title="Signaler cet utilisateur"
                    className="h-7 px-2 text-xs gap-1"
                  >
                    <Flag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Signaler</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={blockedByMe ? "default" : "outline"}
                    type="button"
                    onClick={handleToggleBlock}
                    disabled={blockProcessing}
                    title={blockedByMe ? "Débloquer cet utilisateur" : "Bloquer cet utilisateur"}
                    className={`h-7 px-2 text-xs gap-1 ${blockedByMe ? "bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/90" : "text-red-600 border-red-200 hover:bg-red-50"}`}
                  >
                    {blockProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{blockedByMe ? "Débloquer" : "Bloquer"}</span>
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                {loadingThread && messages.length === 0 ? (
                  <div className="flex justify-center pt-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[#E87722]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 pt-8">
                    Aucun message. Lancez la conversation !
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const dayLabel = getDayLabel(msg.createdAt);
                    const showSeparator = index === 0 || getDayLabel(messages[index - 1].createdAt) !== dayLabel;
                    return (
                      <div key={msg.id}>
                        {showSeparator && (
                          <div className="flex items-center gap-3 my-4 first:mt-0">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{dayLabel}</span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        <div className={`flex flex-col mb-3 ${msg.senderId === myId ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                            msg.senderId === myId
                              ? "bg-[#E87722] text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}>
                            {msg.attachmentUrl && msg.attachmentType?.startsWith("image/") ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={msg.attachmentUrl} alt={msg.attachmentName ?? "Image"} className="rounded-lg max-w-full max-h-48 object-cover mb-1" />
                              </a>
                            ) : msg.attachmentUrl ? (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1 ${
                                  msg.senderId === myId ? "bg-white/15" : "bg-white"
                                }`}
                              >
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate text-sm underline">{msg.attachmentName ?? "Document"}</span>
                                <Download className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                              </a>
                            ) : null}
                            {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                          </div>
                          <span className="text-[13px] text-gray-400 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Saisie */}
              <div className="p-4 border-t border-gray-100">
                {isBlocked ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-2">
                    <Ban className="w-4 h-4" />
                    Vous ne pouvez pas échanger de messages avec cet utilisateur.
                  </div>
                ) : session?.user?.role === "AU_PAIR" && !subscriptionActive ? (
                  <SubscriptionBanner message="Abonnez-vous pour envoyer des messages aux familles." />
                ) : (
                  <>
                    {sendError && <p className="text-xs text-red-500 mb-2">{sendError}</p>}
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || sending}
                        title="Joindre une photo ou un document"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      </Button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrire un message..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        disabled={sending}
                      />
                      <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modale de signalement */}
      {showReportModal && otherUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1A1A2E] text-lg">Signaler {otherUser.name}</h3>
              <button onClick={closeReportModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSent ? (
              <div className="text-center py-4">
                <Flag className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Votre signalement a été envoyé. Merci, notre équipe va l&apos;examiner.</p>
                <Button className="mt-4 w-full" onClick={closeReportModal}>Fermer</Button>
              </div>
            ) : (
              <>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Motif</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                >
                  <option value="">Sélectionnez un motif</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>

                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Description (optionnel)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  placeholder="Détails utiles pour notre équipe de modération..."
                />

                {reportError && <p className="text-xs text-red-500 mb-3">{reportError}</p>}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={closeReportModal}>Annuler</Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleSubmitReport}
                    disabled={!reportReason || reportSubmitting}
                  >
                    {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Flag className="w-4 h-4 mr-1" />}
                    Envoyer
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
