"use client";
import { useState } from "react";
import { Loader2, X, Check, Eye, EyeOff, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useI18n } from "@/i18n";
import { ADMIN_MODULES, ADMIN_PASSWORD_MIN_LENGTH, modulePermissions, type AdminMemberDTO, type AdminRoleDTO } from "@/lib/admin-permissions";

/** `password` vide en modification = mot de passe inchangé */
export type AdminFormValues = { name: string; email: string; roleId: string; password: string };

/** Mot de passe aléatoire lisible (sans caractères ambigus) */
function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%+";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT = "w-full h-11 border border-gray-200 rounded-xl px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] disabled:bg-gray-50 disabled:text-gray-500";

/** Création / modification d'un administrateur (plein écran sur mobile) */
export default function AdminFormDialog({
  admin,
  roles,
  defaultRoleId,
  lockRole,
  lockPassword,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  /** absent = création */
  admin?: AdminMemberDTO;
  roles: AdminRoleDTO[];
  defaultRoleId: string;
  /** Rôle non modifiable (propriétaire, soi-même) */
  lockRole?: string;
  /** Mot de passe non modifiable ici (propriétaire, soi-même) : message affiché */
  lockPassword?: string;
  saving: boolean;
  error: string | null;
  onSubmit: (values: AdminFormValues) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const tt = t.adminTeam;
  const c = t.adminCommon;
  const [values, setValues] = useState<AdminFormValues>({
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    roleId: admin?.roleId ?? defaultRoleId,
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const role = roles.find((r) => r.id === values.roleId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !values.email.trim() || !values.roleId) return setLocalError(tt.errorRequired);
    if (!EMAIL_REGEX.test(values.email.trim())) return setLocalError(tt.errorEmail);
    // Obligatoire à la création, facultatif en modification
    if (!admin || values.password) {
      if (values.password.length < ADMIN_PASSWORD_MIN_LENGTH) return setLocalError(tt.errorPasswordLength(ADMIN_PASSWORD_MIN_LENGTH));
      if (values.password !== confirmPassword) return setLocalError(tt.errorPasswordMatch);
    }
    setLocalError(null);
    onSubmit({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() });
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-[15px] font-medium text-[#1A1A2E]">{admin ? tt.formEditTitle : tt.formCreateTitle}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:bg-gray-100 rounded-xl" aria-label={c.close}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-4 space-y-4 overflow-y-auto">
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{tt.fieldName}</span>
            <input className={INPUT} value={values.name} placeholder={tt.namePlaceholder} autoFocus
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{tt.fieldEmail}</span>
            <input className={INPUT} type="email" value={values.email} placeholder={tt.emailPlaceholder} disabled={!!admin}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} />
          </label>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">{tt.fieldRole}</span>
            <SelectField
              value={values.roleId}
              onChange={(roleId) => setValues((v) => ({ ...v, roleId }))}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              disabled={!!lockRole}
              size="md"
            />
            {lockRole && <p className="text-xs text-gray-400 mt-1">{lockRole}</p>}
          </div>

          {lockPassword ? (
            <p className="text-xs text-gray-400">{lockPassword}</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-xs font-medium text-gray-500">{admin ? tt.fieldNewPassword : tt.fieldPassword}</span>
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-[#E87722] hover:underline"
                    onClick={() => { const p = generatePassword(); setValues((v) => ({ ...v, password: p })); setConfirmPassword(p); setShowPassword(true); }}>
                    <Wand2 className="w-3.5 h-3.5" />{tt.generatePassword}
                  </button>
                </div>
                <div className="relative">
                  <input className={`${INPUT} pr-11`} type={showPassword ? "text" : "password"} value={values.password} autoComplete="new-password"
                    placeholder={admin ? tt.passwordKeepPlaceholder : tt.passwordPlaceholder(ADMIN_PASSWORD_MIN_LENGTH)}
                    onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? tt.hidePassword : tt.showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#E87722]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {(!admin || values.password) && (
                <label className="block">
                  <span className="block text-xs font-medium text-gray-500 mb-1">{tt.fieldConfirmPassword}</span>
                  <input className={INPUT} type={showPassword ? "text" : "password"} value={confirmPassword} autoComplete="new-password"
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                </label>
              )}
              <p className="text-xs text-gray-500">{admin ? tt.passwordEditHint : tt.passwordCreateHint}</p>
            </div>
          )}

          {role && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
              <p className="text-xs font-medium text-gray-600 mb-1.5">{tt.rolePermissionsPreview}</p>
              {role.isSystem ? (
                <p className="text-xs text-gray-700">{tt.allRights}</p>
              ) : role.permissions.length === 0 ? (
                <p className="text-xs text-gray-400">{tt.noPermission}</p>
              ) : (
                <ul className="space-y-1">
                  {ADMIN_MODULES.map((m) => {
                    const granted = modulePermissions(m).filter((p) => role.permissions.includes(p));
                    if (granted.length === 0) return null;
                    return (
                      <li key={m.key} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="w-3.5 h-3.5 mt-px shrink-0 text-[#3FA45B]" />
                        <span>
                          <span className="font-medium">{tt.modules[m.key].label}</span> :{" "}
                          {granted.map((p) => tt.actions[p.split(".")[1] as keyof typeof tt.actions]).join(", ")}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}


          {shownError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{shownError}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{c.cancel}</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {admin ? c.save : c.create}
          </Button>
        </div>
      </form>
    </div>
  );
}
