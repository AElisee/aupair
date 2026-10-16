"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowLeft, Ban, Flag, Loader2, MessagesSquare, MoreVertical, UserRound } from "lucide-react";
import { ICON, Panel } from "@/components/admin/AdminUI";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionLock";
import type { DashboardRole } from "@/components/layout/dashboard-nav";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./ChatAvatar";
import { ConversationList } from "./ConversationList";
import { MessageComposer } from "./MessageComposer";
import { MessageThread } from "./MessageThread";
import { ReportDialog } from "./ReportDialog";
import type { ConversationSummary, MessageItem, OtherUser } from "./types";

/** Actualisation de la conversation ouverte et de la liste (onglet visible uniquement) */
const THREAD_POLL_MS = 5000;
const CONVERSATIONS_POLL_MS = 10000;

/** Lien vers la fiche de l'interlocuteur, quand l'espace courant en propose une */
function profileHref(role: DashboardRole, other: OtherUser): string | null {
  if (role === "au-pair" && other.role === "FAMILLE") return `/dashboard/au-pair/famille/${other.id}`;
  if (role === "famille" && other.role === "AU_PAIR") return `/dashboard/famille/au-pair/${other.id}`;
  return null;
}

export default function MessagesPanel({ role }: { role: DashboardRole }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const myId = session?.user?.id;
  const { t, tError } = useI18n();
  const m = t.messages;
  const roleLabels: Record<string, string> = {
    AU_PAIR: m.roleAuPair,
    FAMILLE: m.roleFamily,
    AGENCE: m.roleAgency,
    ADMIN: m.roleAdmin,
  };

  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockProcessing, setBlockProcessing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const initialSelectionDone = useRef(false);
  // Conversation réellement affichée : ignore les réponses arrivées après un changement de conversation
  const activeUserIdRef = useRef<string | null>(null);

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
      if (!res.ok || activeUserIdRef.current !== userId) return;
      const data = await res.json();
      if (activeUserIdRef.current !== userId) return;
      const thread = data.messages as MessageItem[];
      setMessages(thread);
      setOtherUser(data.otherUser as OtherUser);
      setIsBlocked(Boolean(data.isBlocked));
      setBlockedByMe(Boolean(data.blockedByMe));

      if (thread.some((msg) => msg.receiverId === myId && msg.status === "SENT")) {
        await fetch(`/api/messages/${userId}/read`, { method: "POST" });
        setConversations((prev) =>
          prev ? prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)) : prev
        );
      }
    } catch {
      // erreur silencieuse : la prochaine actualisation réessaiera
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

  // Sélection initiale : conversation passée en query (?userId=), sinon la première de la liste (sur mobile, la liste reste affichée)
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
    activeUserIdRef.current = activeUserId;
    if (!activeUserId) return;
    setMessages([]);
    setOtherUser(null);
    setSendError("");
    setLoadingThread(true);
    loadThread(activeUserId).finally(() => setLoadingThread(false));
  }, [activeUserId, loadThread]);

  // Actualisation périodique (en attendant une messagerie temps réel)
  useEffect(() => {
    const visible = () => document.visibilityState === "visible";
    const threadTimer = setInterval(() => {
      if (visible() && activeUserIdRef.current) loadThread(activeUserIdRef.current);
    }, THREAD_POLL_MS);
    const listTimer = setInterval(() => {
      if (visible()) loadConversations();
    }, CONVERSATIONS_POLL_MS);
    return () => {
      clearInterval(threadTimer);
      clearInterval(listTimer);
    };
  }, [loadThread, loadConversations]);

  // Met à jour la liste localement après un envoi, sans recharger /api/messages
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
      return [updated, ...(prev ?? []).filter((c) => c.userId !== userId)];
    });
  }, [otherUser]);

  const handleSend = async (content: string) => {
    if (!activeUserId || sending) return false;
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
        setSendError(tError(data.error, m.sendError));
        return false;
      }
      setMessages((prev) => [...prev, data.message as MessageItem]);
      bumpConversation(activeUserId, content);
      return true;
    } catch {
      setSendError(t.common.networkError);
      return false;
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!activeUserId || uploading) return;
    setUploading(true);
    setSendError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("receiverId", activeUserId);
      const res = await fetch("/api/messages/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setSendError(tError(data.error, m.fileSendError));
        return;
      }
      const sent = data.message as MessageItem;
      setMessages((prev) => [...prev, sent]);
      bumpConversation(activeUserId, sent.content || (sent.attachmentType?.startsWith("image/") ? "📷 Photo" : "📄 Document"));
    } catch {
      setSendError(t.common.networkError);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!activeUserId || blockProcessing) return;
    setBlockProcessing(true);
    try {
      const res = blockedByMe
        ? await fetch(`/api/blocks?blockedId=${activeUserId}`, { method: "DELETE" })
        : await fetch("/api/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockedId: activeUserId }),
          });
      if (res.ok) setBlockedByMe(!blockedByMe);
      await loadThread(activeUserId);
    } finally {
      setBlockProcessing(false);
    }
  };

  const selectConversation = (userId: string) => {
    setActiveUserId(userId);
    setMobileShowChat(true);
  };

  // La conversation ouverte via ?userId= sans message échangé apparaît quand même dans la liste
  const baseList = conversations ?? [];
  const displayList =
    conversations && activeUserId && otherUser?.id === activeUserId && !baseList.some((c) => c.userId === activeUserId)
      ? [
          {
            userId: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            role: otherUser.role,
            lastMessage: m.newConversation,
            lastMessageAt: new Date().toISOString(),
            lastMessageFromMe: false,
            unreadCount: 0,
          },
          ...baseList,
        ]
      : conversations;

  const menuItem =
    "flex items-center gap-2.5 px-3 h-11 sm:h-10 rounded-lg text-sm text-[#1A1A2E] outline-none cursor-pointer data-[highlighted]:bg-[#FFF3E0] data-[highlighted]:text-[#E87722]";
  const otherProfileHref = otherUser ? profileHref(role, otherUser) : null;

  return (
    // Hauteur = écran − top bar (57px) − marges du contenu (2 × 16px, 2 × 24px dès sm)
    <div className="flex flex-col gap-4 sm:gap-6 h-[calc(100dvh-89px)] sm:h-[calc(100dvh-105px)] min-h-[460px]">
      <div className={mobileShowChat ? "hidden md:block" : undefined}>
        <PageHeader title={m.title} subtitle={role === "au-pair" ? m.subtitleAuPair : m.subtitleFamily} />
      </div>

      <Panel className="flex-1 min-h-0 overflow-hidden flex">
        {/* Liste des conversations */}
        <aside
          className={cn(
            "w-full md:w-80 lg:w-96 md:border-r border-gray-100 min-h-0",
            mobileShowChat ? "hidden md:block" : "block"
          )}
        >
          <ConversationList
            role={role}
            conversations={displayList}
            activeUserId={activeUserId}
            onSelect={selectConversation}
          />
        </aside>

        {/* Conversation ouverte */}
        <section className={cn("flex-1 min-w-0 min-h-0 flex-col bg-white", mobileShowChat ? "flex" : "hidden md:flex")}>
          {!activeUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-[#FAF8F5]">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm text-[#E87722] flex items-center justify-center">
                <MessagesSquare {...ICON} size={30} />
              </div>
              <p className="text-[15px] font-medium text-[#1A1A2E]">{m.selectConversation}</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">{m.selectConversationHint}</p>
            </div>
          ) : !otherUser ? (
            <div className="flex-1 flex items-center justify-center bg-[#FAF8F5]">
              <Loader2 className="w-6 h-6 animate-spin text-[#E87722]" />
            </div>
          ) : (
            <>
              {/* En-tête de la conversation */}
              <header className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-50"
                  aria-label={m.backToConversations}
                >
                  <ArrowLeft {...ICON} />
                </button>
                {otherProfileHref ? (
                  <Link href={otherProfileHref} className="flex items-center gap-3 min-w-0 flex-1 rounded-xl -my-1 py-1 hover:opacity-80" title={m.viewProfile}>
                    <ChatAvatar name={otherUser.name} avatar={otherUser.avatar} />
                    <div className="min-w-0">
                      <p className="font-medium text-[#1A1A2E] truncate">{otherUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{roleLabels[otherUser.role] ?? otherUser.role}</p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ChatAvatar name={otherUser.name} avatar={otherUser.avatar} />
                    <div className="min-w-0">
                      <p className="font-medium text-[#1A1A2E] truncate">{otherUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{roleLabels[otherUser.role] ?? otherUser.role}</p>
                    </div>
                  </div>
                )}

                <DropdownMenu.Root modal={false}>
                  <DropdownMenu.Trigger
                    className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-50 outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]/40"
                    aria-label={m.moreActions}
                    title={m.moreActions}
                  >
                    {blockProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical {...ICON} />}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={6}
                      className="z-50 min-w-56 p-1.5 rounded-xl bg-white border border-gray-100 shadow-[0_10px_30px_-12px_rgba(26,26,46,0.3)]"
                    >
                      {otherProfileHref && (
                        <>
                          <DropdownMenu.Item asChild className={menuItem}>
                            <Link href={otherProfileHref}>
                              <UserRound {...ICON} size={16} />
                              {m.viewProfile}
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                        </>
                      )}
                      <DropdownMenu.Item className={menuItem} onSelect={() => setReportOpen(true)}>
                        <Flag {...ICON} size={16} />
                        {m.reportUser}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className={cn(menuItem, !blockedByMe && "text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600")}
                        onSelect={handleToggleBlock}
                        disabled={blockProcessing}
                      >
                        <Ban {...ICON} size={16} />
                        {blockedByMe ? m.unblockUser : m.blockUser}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </header>

              <MessageThread myId={myId} otherUser={otherUser} messages={messages} loading={loadingThread} />

              {/* Saisie, ou raison pour laquelle elle est indisponible */}
              {blockedByMe ? (
                <div className="border-t border-gray-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Ban {...ICON} size={16} />
                    {m.blockedByMeNotice}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleBlock}
                    disabled={blockProcessing}
                    className="h-11 px-3 font-medium text-[#E87722] hover:underline disabled:opacity-50"
                  >
                    {m.unblock}
                  </button>
                </div>
              ) : isBlocked ? (
                <div className="border-t border-gray-100 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-2 text-sm text-gray-500 text-center">
                  <Ban {...ICON} size={16} className="shrink-0" />
                  {m.cannotMessage}
                </div>
              ) : session?.user?.role === "AU_PAIR" && !subscriptionActive ? (
                <div className="border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <SubscriptionBanner message={m.subscribeToMessage} />
                </div>
              ) : (
                <MessageComposer
                  key={otherUser.id}
                  onSend={handleSend}
                  onFile={handleFile}
                  sending={sending}
                  uploading={uploading}
                  error={sendError}
                />
              )}
            </>
          )}
        </section>
      </Panel>

      {otherUser && (
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} reportedId={otherUser.id} name={otherUser.name} />
      )}
    </div>
  );
}
