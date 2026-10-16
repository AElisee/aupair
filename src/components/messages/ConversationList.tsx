"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, X } from "lucide-react";
import { ICON } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import type { DashboardRole } from "@/components/layout/dashboard-nav";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./ChatAvatar";
import type { ConversationSummary } from "./types";

type Filter = "all" | "unread";

export function ConversationList({
  role,
  conversations,
  activeUserId,
  onSelect,
}: {
  role: DashboardRole;
  conversations: ConversationSummary[] | null;
  activeUserId: string | null;
  onSelect: (userId: string) => void;
}) {
  const { t, tValue, relativeDate } = useI18n();
  const m = t.messages;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = conversations ?? [];
  const unreadTotal = list.filter((c) => c.unreadCount > 0).length;
  const query = search.trim().toLowerCase();
  const filtered = list.filter(
    (c) => (filter === "all" || c.unreadCount > 0) && (!query || c.name.toLowerCase().includes(query))
  );

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 h-9 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5",
      active ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-500 hover:text-[#1A1A2E]"
    );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 space-y-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-[#1A1A2E]">{m.conversations}</h2>
          {list.length > 0 && <span className="text-xs text-gray-400 tabular-nums">{list.length}</span>}
        </div>
        <div className="relative">
          <Search {...ICON} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={m.searchPlaceholder}
            aria-label={m.searchPlaceholder}
            className="w-full h-11 pl-10 pr-10 bg-gray-50 border border-gray-100 rounded-xl text-base sm:text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E87722]/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#1A1A2E]"
              aria-label={t.common.close}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl" role="tablist">
          <button type="button" role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")} className={tabClass(filter === "all")}>
            {m.filterAll}
          </button>
          <button type="button" role="tab" aria-selected={filter === "unread"} onClick={() => setFilter("unread")} className={tabClass(filter === "unread")}>
            {m.filterUnread}
            {unreadTotal > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#E87722] text-white text-[11px] font-semibold inline-flex items-center justify-center tabular-nums">
                {unreadTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {conversations === null ? (
          <ul className="p-2 space-y-1" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-3 w-3/4 rounded bg-gray-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          list.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FFF3E0] text-[#E87722] flex items-center justify-center">
                <MessageCircle {...ICON} size={26} />
              </div>
              <p className="text-sm font-medium text-[#1A1A2E]">{m.noConversations}</p>
              <p className="text-sm text-gray-500 mt-1">
                {role === "au-pair" ? m.noConversationsHintAuPair : m.noConversationsHintFamily}
              </p>
              <Link href={`/dashboard/${role}/recherche`} className="inline-block mt-4">
                <Button size="default">{role === "au-pair" ? m.findFamily : m.findAuPair}</Button>
              </Link>
            </div>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-gray-400">
              {query ? m.noSearchResults(search.trim()) : m.noUnread}
            </p>
          )
        ) : (
          <ul className="p-2 space-y-0.5">
            {filtered.map((conv) => {
              const active = activeUserId === conv.userId;
              const unread = conv.unreadCount > 0;
              return (
                <li key={conv.userId}>
                  <button
                    type="button"
                    onClick={() => onSelect(conv.userId)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                      active ? "bg-[#FFF3E0]" : "hover:bg-gray-50 active:bg-gray-100"
                    )}
                  >
                    <div className="relative">
                      <ChatAvatar name={conv.name} avatar={conv.avatar} className="w-11 h-11" />
                      {unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E87722] ring-2 ring-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn("text-sm truncate text-[#1A1A2E]", unread ? "font-semibold" : "font-medium")}>{conv.name}</p>
                        <span className={cn("text-xs shrink-0", unread ? "text-[#E87722] font-medium" : "text-gray-400")}>
                          {relativeDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={cn("text-[13px] truncate", unread ? "text-[#1A1A2E]" : "text-gray-500")}>
                          {conv.lastMessageFromMe && <span className="text-gray-400">{m.youPrefix}</span>}
                          {tValue(conv.lastMessage)}
                        </p>
                        {unread && (
                          <span
                            className="min-w-5 h-5 px-1.5 rounded-full bg-[#E87722] text-white text-[11px] font-semibold inline-flex items-center justify-center shrink-0 tabular-nums"
                            aria-label={m.unreadCount(conv.unreadCount)}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
