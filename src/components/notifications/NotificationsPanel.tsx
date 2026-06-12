"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Eye, BarChart2, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  PROFILE_VIEW: Eye,
  WEEKLY_VIEWS_DIGEST: BarChart2,
};

export default function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setNotifications(json.notifications);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? prev);
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev?.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)) ?? prev
      );
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id: notification.id }),
      });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Notifications</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={markingAll || unreadCount === 0}
        >
          {markingAll ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4 mr-1.5" />
          )}
          Tout marquer comme lu
        </Button>
      </div>

      {notifications === null ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Vous n&apos;avez aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] ?? Bell;
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleClick(notification)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-[#FFF3E0] ${
                  notification.isRead ? "" : "bg-[#FFF3E0]/50"
                }`}
              >
                <div className="w-9 h-9 bg-[#FFF3E0] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#E87722]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1A1A2E] text-sm">{notification.title}</p>
                    {!notification.isRead && <span className="w-2 h-2 rounded-full bg-[#E87722] flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notification.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(notification.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
