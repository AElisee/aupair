"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SelectField } from "@/components/ui/select-field";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import AdminFormDialog, { type AdminFormValues } from "@/components/admin/team/AdminFormDialog";
import { AdminCard } from "@/components/admin/team/AdminCard";
import { NewRoleCard, RoleCard } from "@/components/admin/team/RoleCard";
import { RoleDrawer, type RoleDraft } from "@/components/admin/team/RoleDrawer";
import { PermissionMatrix } from "@/components/admin/team/PermissionMatrix";
import { PAGE_TITLE, Panel } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import type { AdminMemberDTO, AdminRoleDTO } from "@/lib/admin-permissions";
import { Grid3x3, KeyRound, Loader2, Search, UserPlus, Users } from "lucide-react";

type View = "roles" | "compare" | "admins";
type Confirm = { kind: "remove" | "suspend"; admin: AdminMemberDTO } | { kind: "deleteRole"; role: AdminRoleDTO };
type TeamResponse = { roles: AdminRoleDTO[]; admins: AdminMemberDTO[]; currentUserId?: string };

export default function AdminTeamPage() {
  const { t, tError } = useI18n();
  const tt = t.adminTeam;
  const c = t.adminCommon;

  const [roles, setRoles] = useState<AdminRoleDTO[]>([]);
  const [admins, setAdmins] = useState<AdminMemberDTO[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<View>("roles");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState<{ admin?: AdminMemberDTO } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  /** Rôle ouvert dans le panneau latéral ("new" = création) */
  const [drawerRoleId, setDrawerRoleId] = useState<string | "new" | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const applyTeam = (data: TeamResponse) => {
    setRoles(data.roles);
    setAdmins(data.admins);
    if (data.currentUserId) setCurrentUserId(data.currentUserId);
  };

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(applyTeam)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const systemRole = roles.find((r) => r.isSystem);
  /** Admin historique sans rôle = Superadmin */
  const roleOf = useCallback((a: AdminMemberDTO) => roles.find((r) => r.id === a.roleId) ?? systemRole, [roles, systemRole]);
  const membersOf = (role: AdminRoleDTO) => admins.filter((a) => roleOf(a)?.id === role.id);
  const isProtected = (a: AdminMemberDTO) => a.isOwner || a.id === currentUserId;

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter(
      (a) =>
        (!q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) &&
        (!roleFilter || roleOf(a)?.id === roleFilter)
    );
  }, [admins, search, roleFilter, roleOf]);

  /** Appel API : renvoie le JSON, ou affiche l'erreur (toast ou callback) et renvoie null */
  const call = async <T,>(url: string, init: RequestInit, onError?: (msg: string) => void): Promise<T | null> => {
    const fail = (msg: string) => (onError ? onError(msg) : setToast({ text: msg, error: true }));
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        fail(tError(data.error, c.saveError));
        return null;
      }
      return data as T;
    } catch {
      fail(c.networkError);
      return null;
    }
  };

  const replaceAdmin = (admin: AdminMemberDTO) => setAdmins((prev) => prev.map((a) => (a.id === admin.id ? admin : a)));
  const refreshTeam = async () => {
    const data = await call<TeamResponse>("/api/admin/team", { method: "GET" });
    if (data) applyTeam(data);
  };

  // ─── Administrateurs ──────────────────────────────────────────────────────
  const submitAdmin = async (values: AdminFormValues) => {
    setSaving(true);
    setFormError(null);
    const editing = form?.admin;
    const data = await call<{ admin: AdminMemberDTO }>("/api/admin/team", editing
      ? { method: "PATCH", body: JSON.stringify({ id: editing.id, action: "update", name: values.name, roleId: values.roleId, password: values.password || undefined }) }
      : { method: "POST", body: JSON.stringify(values) },
    setFormError);
    setSaving(false);
    if (!data) return;
    if (editing) replaceAdmin(data.admin);
    else setAdmins((prev) => [...prev, data.admin]);
    setToast({ text: editing ? c.saved : tt.adminCreated(data.admin.name) });
    setForm(null);
    refreshTeam(); // compteurs de membres par rôle
  };

  const adminAction = async (admin: AdminMemberDTO, action: "suspend" | "reactivate") => {
    setBusyId(admin.id);
    const data = await call<{ admin: AdminMemberDTO }>("/api/admin/team", { method: "PATCH", body: JSON.stringify({ id: admin.id, action }) });
    setBusyId(null);
    if (!data) return;
    replaceAdmin(data.admin);
    setToast({ text: c.saved });
  };

  const removeAdmin = async (admin: AdminMemberDTO) => {
    setBusyId(admin.id);
    const data = await call<{ success: true }>(`/api/admin/team?id=${admin.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!data) return;
    setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    setToast({ text: tt.adminRemoved });
    refreshTeam();
  };

  // ─── Rôles ────────────────────────────────────────────────────────────────
  const drawerRole = drawerRoleId && drawerRoleId !== "new" ? roles.find((r) => r.id === drawerRoleId) ?? null : null;
  const openRole = (id: string | "new") => {
    setRoleError(null);
    setDrawerRoleId(id);
  };
  const closeDrawer = useCallback(() => setDrawerRoleId(null), []);

  const saveRole = async (draft: RoleDraft) => {
    setSaving(true);
    setRoleError(null);
    const isNew = drawerRoleId === "new";
    const data = await call<TeamResponse & { id: string }>("/api/admin/roles", {
      method: isNew ? "POST" : "PATCH",
      body: JSON.stringify(isNew ? draft : { ...draft, id: drawerRoleId }),
    }, setRoleError);
    setSaving(false);
    if (!data) return;
    applyTeam(data);
    setDrawerRoleId(null);
    setToast({ text: tt.roleSaved });
  };

  const deleteRole = async (role: AdminRoleDTO) => {
    setSaving(true);
    const data = await call<TeamResponse>(`/api/admin/roles?id=${role.id}`, { method: "DELETE" });
    setSaving(false);
    if (!data) return;
    applyTeam(data);
    setDrawerRoleId(null);
    setToast({ text: tt.roleDeleted });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const current = confirm;
    setConfirm(null);
    if (current.kind === "remove") await removeAdmin(current.admin);
    else if (current.kind === "suspend") await adminAction(current.admin, "suspend");
    else if (current.kind === "deleteRole") await deleteRole(current.role);
  };

  const VIEWS: { key: View; label: string; icon: typeof Users; count?: number }[] = [
    { key: "roles", label: tt.tabRoles, icon: KeyRound, count: roles.length },
    { key: "compare", label: tt.tabCompare, icon: Grid3x3 },
    { key: "admins", label: tt.tabAdmins, icon: Users, count: admins.length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={PAGE_TITLE}>{tt.title}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{tt.subtitle}</p>
          </div>
          {!loading && !loadError && (
            /* Sélecteur de vue en pastilles (défile horizontalement sur mobile) */
            <div className="flex p-1 rounded-2xl bg-white/80 border border-white shadow-sm overflow-x-auto w-full lg:w-auto">
              {VIEWS.map(({ key, label, icon: Icon, count }) => (
                <button key={key} onClick={() => setView(key)}
                  className={`flex-1 lg:flex-none shrink-0 inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    view === key ? "bg-[#1A1A2E] text-white shadow" : "text-gray-600 hover:text-[#1A1A2E]"
                  }`}>
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{label}</span>
                  {count !== undefined && (
                    <span className={`text-[11px] tabular-nums rounded-md px-1.5 ${view === key ? "bg-white/15" : "bg-gray-100 text-gray-500"}`}>{count}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <Separator />

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </div>
        ) : loadError ? (
          <Panel className="p-8 text-center text-sm text-gray-500">{c.networkError}</Panel>
        ) : view === "roles" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {roles.map((r) => (
              <RoleCard key={r.id} role={r} members={membersOf(r)} onOpen={() => openRole(r.id)} />
            ))}
            <NewRoleCard onClick={() => openRole("new")} />
          </div>
        ) : view === "compare" ? (
          <PermissionMatrix roles={roles} />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tt.search}
                  className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
              </div>
              <SelectField value={roleFilter} onChange={setRoleFilter} size="sm" className="sm:w-52"
                options={[{ value: "", label: tt.allRoles }, ...roles.map((r) => ({ value: r.id, label: r.name }))]} />
              <Button onClick={() => { setFormError(null); setForm({}); }}>
                <UserPlus className="w-4 h-4" />{tt.newAdmin}
              </Button>
            </div>

            {filteredAdmins.length === 0 ? (
              <Panel className="p-10 text-center text-sm text-gray-400">{tt.noAdmins}</Panel>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAdmins.map((a) => (
                  <AdminCard
                    key={a.id}
                    admin={a}
                    role={roleOf(a)}
                    isSelf={a.id === currentUserId}
                    busy={busyId === a.id}
                    onEdit={() => { setFormError(null); setForm({ admin: a }); }}
                    onSuspend={() => setConfirm({ kind: "suspend", admin: a })}
                    onReactivate={() => adminAction(a, "reactivate")}
                    onRemove={() => setConfirm({ kind: "remove", admin: a })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {drawerRoleId && (drawerRoleId === "new" || drawerRole) && (
        <RoleDrawer
          key={drawerRoleId}
          role={drawerRole}
          saving={saving}
          error={roleError}
          onSave={saveRole}
          onDelete={drawerRole ? () => setConfirm({ kind: "deleteRole", role: drawerRole }) : undefined}
          onClose={closeDrawer}
        />
      )}

      {form && (
        <AdminFormDialog
          admin={form.admin}
          roles={roles}
          defaultRoleId={roles.find((r) => !r.isSystem)?.id ?? systemRole?.id ?? ""}
          lockRole={form.admin && isProtected(form.admin) ? (form.admin.isOwner ? tt.ownerProtected : tt.selfRoleLocked) : undefined}
          lockPassword={form.admin && isProtected(form.admin) ? (form.admin.id === currentUserId ? tt.selfPasswordLocked : tt.ownerProtected) : undefined}
          saving={saving}
          error={formError}
          onSubmit={submitAdmin}
          onClose={() => setForm(null)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === "remove" ? tt.removeTitle : confirm.kind === "suspend" ? tt.suspendTitle : tt.deleteRoleTitle}
          description={
            confirm.kind === "deleteRole" ? (
              <><strong>{confirm.role.name}</strong> {tt.deleteRoleText}</>
            ) : (
              <><strong>{confirm.admin.name || confirm.admin.email}</strong> {confirm.kind === "remove" ? tt.removeText : tt.suspendText}</>
            )
          }
          confirmLabel={confirm.kind === "remove" ? tt.remove : confirm.kind === "suspend" ? tt.suspend : c.delete}
          variant={confirm.kind === "suspend" ? "default" : "destructive"}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <div role="status" className={`fixed z-[60] left-4 right-4 sm:left-auto sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg text-white ${toast.error ? "bg-red-600" : "bg-[#1A1A2E]"}`}>
          {toast.text}
        </div>
      )}
    </AdminLayout>
  );
}
