"use client";
import { ArrowRight, Crown, KeyRound, Plus } from "lucide-react";
import { BLUE, ORANGE, Ring, pct } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import { ADMIN_MODULES, GRANTABLE_PERMISSIONS, modulePermissions, type AdminMemberDTO, type AdminRoleDTO } from "@/lib/admin-permissions";
import { initials } from "./module-icons";

/** Couleur d'un rôle : orange pour le Superadmin, bleu pour les rôles créés */
export const roleColor = (role?: AdminRoleDTO | null) => (role?.isSystem ? ORANGE : BLUE);

const MAX_AVATARS = 4;

/** Carte d'un rôle : couverture des droits, modules accordés, membres */
export function RoleCard({ role, members, onOpen }: { role: AdminRoleDTO; members: AdminMemberDTO[]; onOpen: () => void }) {
  const { t } = useI18n();
  const tt = t.adminTeam;
  const color = roleColor(role);
  const granted = role.isSystem ? GRANTABLE_PERMISSIONS : role.permissions;
  const coverage = pct(granted.length, GRANTABLE_PERMISSIONS.length);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left rounded-2xl border border-white bg-white/85 backdrop-blur-sm p-4 sm:p-5 shadow-[0_10px_30px_-18px_rgba(30,53,112,0.35)] hover:shadow-[0_16px_36px_-18px_rgba(30,53,112,0.45)] hover:-translate-y-0.5 transition-all flex flex-col gap-4"
      style={{ backgroundImage: `linear-gradient(160deg, ${color}14 0%, ${color}05 45%, rgba(255,255,255,0.9) 100%)` }}
    >
      <div className="flex items-center gap-4">
        <Ring ratio={coverage} color={color} size={64}>
          <span style={{ color }}>{role.isSystem ? <Crown size={20} strokeWidth={1.25} /> : <KeyRound size={20} strokeWidth={1.25} />}</span>
        </Ring>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-[#1A1A2E] truncate">{role.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{tt.rightsOf(granted.length, GRANTABLE_PERMISSIONS.length)}</p>
          {role.isSystem && <p className="text-[11px] text-[#C2410C] mt-1">{tt.systemRoleBadge}</p>}
        </div>
      </div>

      {/* Un segment par module : plein = au moins une action accordée */}
      <div>
        <div className="flex gap-1">
          {ADMIN_MODULES.map((m) => {
            const perms = modulePermissions(m);
            const n = perms.filter((p) => granted.includes(p)).length;
            return (
              <span
                key={m.key}
                title={`${tt.modules[m.key].label} · ${n}/${perms.length}`}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: n === 0 ? "#E5E7EB" : color, opacity: n === 0 ? 1 : 0.35 + (0.65 * n) / perms.length }}
              />
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {tt.modulesCovered(ADMIN_MODULES.filter((m) => modulePermissions(m).some((p) => granted.includes(p))).length, ADMIN_MODULES.length)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-auto">
        {members.length === 0 ? (
          <span className="text-xs text-gray-400">{tt.noMembers}</span>
        ) : (
          <div className="flex items-center">
            {members.slice(0, MAX_AVATARS).map((m, i) => (
              <span
                key={m.id}
                title={m.name || m.email}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-medium text-white"
                style={{ background: color, marginLeft: i === 0 ? 0 : -8, opacity: m.status === "SUSPENDED" ? 0.45 : 1 }}
              >
                {initials(m.name, m.email)}
              </span>
            ))}
            {members.length > MAX_AVATARS && (
              <span className="w-8 h-8 -ml-2 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[11px] text-gray-600">
                +{members.length - MAX_AVATARS}
              </span>
            )}
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3A5BA8] group-hover:gap-2 transition-all">
          {role.isSystem ? tt.viewRole : tt.editRole}<ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

/** Carte « Créer un rôle » */
export function NewRoleCard({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  const tt = t.adminTeam;
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[180px] rounded-2xl border-2 border-dashed border-[#3A5BA8]/30 hover:border-[#E87722] hover:bg-[#FFF3E0]/40 transition-colors flex flex-col items-center justify-center gap-2 p-5 text-center"
    >
      <span className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#E87722]">
        <Plus size={20} strokeWidth={1.5} />
      </span>
      <span className="text-sm font-medium text-[#1A1A2E]">{tt.createRoleCard}</span>
      <span className="text-xs text-gray-500 max-w-[220px]">{tt.createRoleHint}</span>
    </button>
  );
}
