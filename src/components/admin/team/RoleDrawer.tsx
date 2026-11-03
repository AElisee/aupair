"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Crown, Loader2, Lock, Save, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import {
  ADMIN_MODULES,
  GRANTABLE_PERMISSIONS,
  modulePermissions,
  toggleModule,
  togglePermission,
  type AdminModuleKey,
  type AdminRoleDTO,
  type ModuleActionPermission,
} from "@/lib/admin-permissions";
import { MODULE_ICONS } from "./module-icons";
import { roleColor } from "./RoleCard";

export type RoleDraft = { name: string; permissions: ModuleActionPermission[] };

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Switch({ checked, partial, disabled, onChange, label }: {
  checked: boolean;
  partial?: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative w-11 h-6 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? (partial ? "bg-[#E87722]/50" : "bg-[#E87722]") : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

/**
 * Panneau latéral d'édition d'un rôle (plein écran sur mobile) : nom, puis un accordéon
 * de modules avec un interrupteur par module et les actions en pastilles.
 */
export function RoleDrawer({
  role,
  saving,
  error,
  onSave,
  onDelete,
  onClose,
}: {
  /** null = nouveau rôle */
  role: AdminRoleDTO | null;
  saving: boolean;
  error: string | null;
  onSave: (draft: RoleDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const tt = t.adminTeam;
  const c = t.adminCommon;
  const readOnly = !!role?.isSystem;
  const initial: RoleDraft = role
    ? { name: role.name, permissions: role.isSystem ? GRANTABLE_PERMISSIONS : role.permissions }
    : { name: "", permissions: [] };
  const [draft, setDraft] = useState<RoleDraft>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<AdminModuleKey>>(() => new Set());
  const [localError, setLocalError] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const color = roleColor(role);

  // Échap ferme le panneau ; le fond ne défile pas pendant l'édition
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const q = normalize(query.trim());
  const modules = useMemo(
    () =>
      ADMIN_MODULES.filter(
        (m) => !q || normalize(tt.modules[m.key].label).includes(q) || m.actions.some((a) => normalize(tt.actions[a]).includes(q))
      ),
    [q, tt]
  );

  const setPermissions = (permissions: ModuleActionPermission[]) => setDraft((d) => ({ ...d, permissions }));
  const toggleOpen = (key: AdminModuleKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const save = () => {
    if (!draft.name.trim()) return setLocalError(tt.errorRoleName);
    setLocalError(null);
    onSave({ ...draft, name: draft.name.trim() });
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={draft.name || tt.newRoleName}>
      <div className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside className="relative w-full sm:max-w-xl h-dvh bg-[#F7F8FC] shadow-2xl flex flex-col animate-drawer-in-right">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-4 pb-4" style={{ boxShadow: `inset 0 3px 0 ${color}` }}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
                {readOnly ? <><Crown className="w-3.5 h-3.5 text-[#E87722]" />{tt.systemRoleBadge}</> : role ? tt.editRole : tt.createRoleCard}
              </p>
              <input
                value={draft.name}
                disabled={readOnly}
                maxLength={60}
                autoFocus={!role}
                placeholder={tt.roleNamePlaceholder}
                aria-label={tt.roleName}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="mt-1 w-full bg-transparent text-xl font-medium text-[#1A1A2E] placeholder:text-gray-300 border-b border-dashed border-gray-200 focus:border-[#E87722] focus:outline-none pb-1 disabled:border-transparent"
              />
            </div>
            <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-[#1A1A2E] rounded-xl" aria-label={c.close}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
            <span><strong className="text-[#1A1A2E] font-semibold tabular-nums">{draft.permissions.length}</strong> / {GRANTABLE_PERMISSIONS.length} {tt.selectedLabel}</span>
            {role && <span>{tt.usersBadge(role.memberCount)}</span>}
            {dirty && !readOnly && <span className="text-[#E87722]">● {tt.unsaved}</span>}
          </div>
        </header>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {readOnly && (
            <p className="flex items-start gap-2 text-sm text-gray-600 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
              <Lock className="w-4 h-4 mt-0.5 shrink-0 text-[#E87722]" />{tt.systemRoleHint}
            </p>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tt.searchActions}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
          </div>

          {modules.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">{tt.noMatch}</p>
          ) : (
            <ul className="space-y-2">
              {modules.map((m) => {
                const Icon = MODULE_ICONS[m.key];
                const perms = modulePermissions(m);
                const n = perms.filter((p) => draft.permissions.includes(p)).length;
                const expanded = open.has(m.key) || !!q;
                return (
                  <li key={m.key} className={`rounded-2xl bg-white border transition-colors ${n > 0 ? "border-[#E87722]/30" : "border-gray-100"}`}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => toggleOpen(m.key)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleOpen(m.key))}
                      className="flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none"
                    >
                      <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${n > 0 ? "bg-[#E87722]/12 text-[#E87722]" : "bg-gray-100 text-gray-400"}`}>
                        <Icon size={18} strokeWidth={1.25} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#1A1A2E]">{tt.modules[m.key].label}</span>
                        <span className="flex items-center gap-2 mt-1">
                          <span className="h-1 w-16 rounded-full bg-gray-100 overflow-hidden">
                            <span className="block h-full bg-[#E87722] transition-all" style={{ width: `${(n / perms.length) * 100}%` }} />
                          </span>
                          <span className="text-[11px] text-gray-400 tabular-nums">{n}/{perms.length}</span>
                        </span>
                      </span>
                      <Switch
                        checked={n > 0}
                        partial={n > 0 && n < perms.length}
                        disabled={readOnly}
                        label={tt.modules[m.key].label}
                        onChange={(on) => setPermissions(toggleModule(draft.permissions, m.key, on))}
                      />
                      <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </div>
                    {expanded && (
                      <div className="px-3.5 pb-3.5 pt-0.5">
                        <p className="text-xs text-gray-500 mb-2.5 sm:pl-12">{tt.modules[m.key].hint}</p>
                        <div className="flex flex-wrap gap-2 sm:pl-12">
                          {perms.map((p) => {
                            const checked = draft.permissions.includes(p);
                            const label = tt.actions[p.split(".")[1] as keyof typeof tt.actions];
                            const match = q && normalize(label).includes(q);
                            return (
                              <button
                                key={p}
                                type="button"
                                aria-pressed={checked}
                                disabled={readOnly}
                                onClick={() => setPermissions(togglePermission(draft.permissions, p, !checked))}
                                className={`inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full text-sm border transition-colors disabled:cursor-not-allowed ${
                                  checked ? "bg-[#1A1A2E] border-[#1A1A2E] text-white" : "bg-white border-gray-200 text-gray-600 hover:border-[#1A1A2E]/40"
                                } ${match ? "ring-2 ring-[#E87722]/40" : ""}`}
                              >
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${checked ? "bg-[#E87722]" : "border border-gray-300"}`}>
                                  {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                                </span>
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-xs text-gray-400 px-1">{tt.moduleHint}</p>
        </div>

        {/* Pied */}
        <footer className="bg-white border-t border-gray-100 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {shownError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{shownError}</p>}
          {readOnly ? (
            <div className="flex justify-end"><Button variant="outline" onClick={onClose}>{c.close}</Button></div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {role && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={role.memberCount > 0 || saving}
                  title={role.memberCount > 0 ? tt.deleteRoleBlocked : undefined}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />{tt.deleteRole}
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} disabled={saving}>{c.cancel}</Button>
                <Button onClick={save} disabled={saving || (!!role && !dirty)}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {tt.saveRole}
                </Button>
              </div>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}
