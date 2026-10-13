"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import { useI18n } from "@/i18n";

export default function AuPairParametresPage() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{t.settings.title}</h1>
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
}
