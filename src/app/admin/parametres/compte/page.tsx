"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import { useI18n } from "@/i18n";

export default function AdminCompteParametresPage() {
  const { t } = useI18n();
  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{t.adminSettings.accountTitle}</h1>
        <ChangePasswordForm />
      </div>
    </AdminLayout>
  );
}
