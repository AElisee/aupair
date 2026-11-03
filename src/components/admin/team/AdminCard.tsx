"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Ban, Clock, Crown, Loader2, MoreHorizontal, Pencil, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n";
import type { AdminMemberDTO, AdminRoleDTO } from "@/lib/admin-permissions";
import { initials } from "./module-icons";
import { roleColor } from "./RoleCard";

const ITEM =
  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#1A1A2E] outline-none cursor-pointer data-[highlighted]:bg-[#FFF3E0] data-[highlighted]:text-[#E87722] data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed";

/** Carte d'un administrateur : identité, rôle, statut, dernière connexion, menu d'actions */
export function AdminCard({
  admin,
  role,
  isSelf,
  busy,
  onEdit,
  onSuspend,
  onReactivate,
  onRemove,
}: {
  admin: AdminMemberDTO;
  role?: AdminRoleDTO;
  isSelf: boolean;
  busy: boolean;
  onEdit: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onRemove: () => void;
}) {
  const { t, relativeDate } = useI18n();
  const tt = t.adminTeam;
  const color = roleColor(role);
  const locked = admin.isOwner || isSelf;
  const lockedTitle = admin.isOwner ? tt.ownerProtected : tt.selfProtected;
  const suspended = admin.status === "SUSPENDED";

  return (
    <article className={`relative rounded-2xl bg-white/85 border border-white p-4 shadow-[0_10px_30px_-18px_rgba(30,53,112,0.35)] ${suspended ? "opacity-75" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="relative shrink-0">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-medium" style={{ background: color }}>
            {initials(admin.name, admin.email)}
          </span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${suspended ? "bg-red-500" : "bg-[#3FA45B]"}`}
            title={tt.statuses[admin.status]}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#1A1A2E] truncate flex items-center gap-1.5">
            {admin.name || admin.email}
            {admin.isOwner && <Crown className="w-3.5 h-3.5 text-[#E87722] shrink-0" aria-label={tt.owner} />}
          </p>
          <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          {isSelf && <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-[#3A5BA8] bg-[#3A5BA8]/10 rounded px-1.5 py-px">{tt.you}</span>}
        </div>

        {busy ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#E87722] m-1.5" />
        ) : (
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger className="p-1.5 -mr-1 rounded-lg text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]/40" aria-label={t.adminCommon.actions}>
              <MoreHorizontal className="w-5 h-5" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-52 p-1.5 rounded-xl bg-white border border-gray-100 shadow-[0_10px_30px_-12px_rgba(26,26,46,0.3)]">
                <DropdownMenu.Item className={ITEM} onSelect={onEdit}>
                  <Pencil className="w-4 h-4" />{tt.editAdmin}
                </DropdownMenu.Item>
                {suspended ? (
                  <DropdownMenu.Item className={ITEM} disabled={locked} onSelect={onReactivate}>
                    <RotateCcw className="w-4 h-4" />{tt.reactivate}
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item className={ITEM} disabled={locked} onSelect={onSuspend}>
                    <Ban className="w-4 h-4" />{tt.suspend}
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                <DropdownMenu.Item className={`${ITEM} !text-red-600 data-[highlighted]:!bg-red-50`} disabled={locked} onSelect={onRemove}>
                  <Trash2 className="w-4 h-4" />{tt.remove}
                </DropdownMenu.Item>
                {locked && <p className="px-3 pt-1.5 pb-1 text-[11px] text-gray-400 max-w-56">{lockedTitle}</p>}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 max-w-full truncate" style={{ background: `${color}14`, color }}>
          {role?.isSystem ? <Crown className="w-3.5 h-3.5 shrink-0" /> : <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
          {role?.name ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {admin.lastLoginAt ? relativeDate(admin.lastLoginAt) : tt.neverLoggedIn}
        </span>
      </div>
      {suspended && <p className="mt-2 text-[11px] text-red-600">{tt.statuses.SUSPENDED}</p>}
    </article>
  );
}
