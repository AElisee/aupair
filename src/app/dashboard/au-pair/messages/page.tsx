"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function MessagesPage() {
  const { t } = useI18n();

  return (
    <DashboardLayout role="au-pair">
      <div>
        <div className="mb-3 sm:mb-6">
          <PageHeader title={t.messages.title} />
        </div>
        <Suspense>
          <MessagesPanel />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
