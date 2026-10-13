"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";
import { useI18n } from "@/i18n";

export default function MessagesPage() {
  const { t } = useI18n();

  return (
    <DashboardLayout role="au-pair">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] mb-3 sm:mb-6">{t.messages.title}</h1>
        <Suspense>
          <MessagesPanel />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
