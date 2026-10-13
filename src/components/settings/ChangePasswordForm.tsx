"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}

function PasswordField({ label, value, onChange, autoComplete }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-11 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? t.settings.hidePassword : t.settings.showPassword}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const { update } = useSession();
  const { t, tError } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 8) {
      setError(t.settings.tooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.settings.mismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(tError(data.error, t.common.genericError));
        return;
      }

      // Rafraîchit le token de session courante pour qu'elle reste active
      // (les autres sessions seront déconnectées à leur prochaine requête).
      await update();

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(t.common.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h2 className="font-bold text-[#1A1A2E] mb-1">{t.settings.changePasswordTitle}</h2>
      <p className="text-sm text-gray-500 mb-5">
        {t.settings.changePasswordHint}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PasswordField
          label={t.settings.currentPassword}
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordField
          label={t.settings.newPassword}
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label={t.settings.confirmPassword}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {t.settings.success}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
          {loading ? t.settings.submitting : t.settings.submit}
        </Button>
      </form>
    </div>
  );
}
