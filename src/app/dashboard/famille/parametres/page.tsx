"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function FamilleParametresPage() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <DashboardLayout role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-5">
        <PageHeader title={t.settings.title} />
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
}
