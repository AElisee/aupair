"use client";

import { useEffect, useRef } from "react";
import { Check, CheckCheck, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { ICON } from "@/components/admin/AdminUI";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useI18n, getDictionary, intlLocale, type Lang } from "@/i18n";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./ChatAvatar";
import type { MessageItem, OtherUser } from "./types";

function formatTime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(intlLocale(lang), { hour: "2-digit", minute: "2-digit" });
}

// Étiquette du séparateur de jour (Aujourd'hui, Hier, jour de la semaine, Semaine dernière, ou date)
function getDayLabel(iso: string, lang: Lang): string {
  const t = getDictionary(lang);
  const locale = intlLocale(lang);
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) return t.time.today;
  if (diffDays === 1) return t.time.yesterday;
  if (diffDays < 7) {
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  if (diffDays < 14) return t.time.lastWeek;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
  }).format(date);
}

/** Regroupe les messages par jour (pour les séparateurs collants) */
function groupByDay(messages: MessageItem[], lang: Lang) {
  const days: { label: string; messages: MessageItem[] }[] = [];
  for (const msg of messages) {
    const label = getDayLabel(msg.createdAt, lang);
    const last = days[days.length - 1];
    if (last && last.label === label) last.messages.push(msg);
    else days.push({ label, messages: [msg] });
  }
  return days;
}

/** Distance au bas (px) sous laquelle on suit automatiquement les nouveaux messages */
const STICK_TO_BOTTOM_PX = 120;

export function MessageThread({
  myId,
  otherUser,
  messages,
  loading,
}: {
  myId: string | undefined;
  otherUser: OtherUser;
  messages: MessageItem[];
  loading: boolean;
}) {
  const { t, lang } = useI18n();
  const m = t.messages;
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const lastId = messages[messages.length - 1]?.id;
  const lastFromMe = messages[messages.length - 1]?.senderId === myId;

  // Premier affichage d'une conversation : on se place directement en bas, sans animation.
  // Ensuite, on suit les nouveaux messages s'ils viennent de moi ou si l'utilisateur est déjà en bas.
  const positionedFor = useRef<string | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !lastId) return;
    if (positionedFor.current !== otherUser.id) {
      positionedFor.current = otherUser.id;
      nearBottomRef.current = true;
      el.scrollTop = el.scrollHeight;
    } else if (lastFromMe || nearBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [lastId, lastFromMe, otherUser.id]);

  // Dernier de mes messages lus par l'interlocuteur : seul à porter la mention « Lu »
  const lastReadMineId = [...messages].reverse().find((msg) => msg.senderId === myId && msg.status === "READ")?.id;

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX;
      }}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 pb-4 bg-[#FAF8F5]"
    >
      {loading && messages.length === 0 ? (
        <div className="flex justify-center pt-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#E87722]" />
        </div>
      ) : messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
          <ChatAvatar name={otherUser.name} avatar={otherUser.avatar} className="w-16 h-16 text-xl mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A2E] flex items-center gap-1.5">
            <Sparkles {...ICON} size={16} className="text-[#E87722]" />
            {m.emptyThreadTitle}
          </p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">{m.emptyThreadHint(otherUser.name)}</p>
        </div>
      ) : (
        groupByDay(messages, lang).map((day) => (
          <section key={day.label + day.messages[0].id} aria-label={day.label}>
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2">
              <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
                {day.label}
              </span>
            </div>
            {day.messages.map((msg, index) => {
              const mine = msg.senderId === myId;
              // Dernier message d'une suite du même expéditeur : il porte l'avatar et la « queue » de la bulle
              const next = day.messages[index + 1];
              const endsRun = !next || next.senderId !== msg.senderId;
              const isImage = Boolean(msg.attachmentUrl && msg.attachmentType?.startsWith("image/"));
              return (
                <Message key={msg.id} align={mine ? "end" : "start"} className={endsRun ? "mb-3" : "mb-1"}>
                  {!mine &&
                    (endsRun ? (
                      <MessageAvatar className="group-has-data-[slot=message-footer]/message:-translate-y-5">
                        <ChatAvatar name={otherUser.name} avatar={otherUser.avatar} className="w-8 h-8 text-xs" />
                      </MessageAvatar>
                    ) : (
                      <div className="w-8 shrink-0" aria-hidden />
                    ))}
                  <MessageContent className="gap-1">
                    <Bubble
                      variant={mine ? "default" : "outline"}
                      align={mine ? "end" : "start"}
                      className="max-w-[82%] sm:max-w-sm lg:max-w-md"
                    >
                      <BubbleContent
                        title={formatTime(msg.createdAt, lang)}
                        className={cn(
                          "rounded-2xl text-[15px] sm:text-sm shadow-[0_1px_2px_rgba(26,26,46,0.06)]",
                          isImage && !msg.content ? "p-1" : "px-3.5 py-2",
                          !mine && "border-gray-100 text-[#1A1A2E]",
                          endsRun && (mine ? "rounded-br-md" : "rounded-bl-md")
                        )}
                      >
                        {isImage ? (
                          <a href={msg.attachmentUrl!} target="_blank" rel="noopener noreferrer" className="block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.attachmentUrl!}
                              alt={msg.attachmentName ?? m.image}
                              className={cn("rounded-xl max-w-full max-h-64 object-cover", msg.content && "mb-1.5")}
                            />
                          </a>
                        ) : msg.attachmentUrl ? (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 min-w-48",
                              msg.content && "mb-1.5",
                              mine ? "bg-white/15 hover:bg-white/25" : "bg-gray-50 hover:bg-gray-100"
                            )}
                          >
                            <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", mine ? "bg-white/20" : "bg-[#FFF3E0] text-[#E87722]")}>
                              <FileText {...ICON} size={18} />
                            </span>
                            <span className="truncate text-sm font-medium">{msg.attachmentName ?? m.document}</span>
                            <Download {...ICON} size={16} className="shrink-0 ml-auto opacity-80" />
                          </a>
                        ) : null}
                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                      </BubbleContent>
                    </Bubble>
                    {endsRun && (
                      <MessageFooter className="px-1 gap-1 text-[11px] font-normal text-gray-400">
                        <time dateTime={msg.createdAt}>{formatTime(msg.createdAt, lang)}</time>
                        {mine &&
                          (msg.status === "READ" ? (
                            <span className="inline-flex items-center gap-0.5 text-[#3A5BA8]" title={m.statusRead}>
                              <CheckCheck size={14} strokeWidth={1.75} aria-hidden />
                              {msg.id === lastReadMineId && <span>{m.statusRead}</span>}
                            </span>
                          ) : (
                            <Check size={14} strokeWidth={1.75} aria-label={m.statusSent} />
                          ))}
                      </MessageFooter>
                    )}
                  </MessageContent>
                </Message>
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}
