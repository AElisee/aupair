"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";

export default function FamilleNotificationsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout role="famille" userName={session?.user?.name ?? ""}>
      <NotificationsPanel />
    </DashboardLayout>
  );
}
