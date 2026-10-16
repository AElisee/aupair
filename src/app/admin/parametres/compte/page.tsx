"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";

export default function AdminCompteParametresPage() {
  const { t } = useI18n();
  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight">{t.adminSettings.accountTitle}</h1>
        <Separator />
        <ChangePasswordForm />
      </div>
    </AdminLayout>
  );
}
