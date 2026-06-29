"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

export default function AdminCompteParametresPage() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — Mon compte</h1>
        <ChangePasswordForm />
      </div>
    </AdminLayout>
  );
}
