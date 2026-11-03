"use client";
import { Fragment } from "react";
import { Check, Crown, Lock } from "lucide-react";
import { Panel } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import { ADMIN_MODULES, modulePermissions, type AdminRoleDTO } from "@/lib/admin-permissions";
import { MODULE_ICONS } from "./module-icons";

/** Comparatif : actions en lignes (groupées par module), rôles en colonnes */
export function PermissionMatrix({ roles }: { roles: AdminRoleDTO[] }) {
  const { t } = useI18n();
  const tt = t.adminTeam;
  return (
    <Panel className="overflow-hidden">
      <p className="px-4 sm:px-5 pt-4 pb-3 text-sm text-gray-500">{tt.modulesIntro}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0" style={{ minWidth: 240 + roles.length * 120 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#1A1A2E] text-left font-medium text-white/80 text-xs px-4 py-3">{tt.matrixAction}</th>
              {roles.map((r) => (
                <th key={r.id} className="bg-[#1A1A2E] px-3 py-3 text-xs font-medium text-white text-center">
                  <span className="inline-flex items-center gap-1">
                    {r.isSystem && <Crown className="w-3.5 h-3.5 text-[#E87722]" />}
                    {r.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ADMIN_MODULES.map((m) => {
              const Icon = MODULE_ICONS[m.key];
              return (
                <Fragment key={m.key}>
                  <tr>
                    <td colSpan={roles.length + 1} className="px-4 pt-4 pb-1.5">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-[#1A1A2E]">
                        <Icon size={16} strokeWidth={1.25} className="text-[#3A5BA8]" />
                        {tt.modules[m.key].label}
                      </span>
                    </td>
                  </tr>
                  {modulePermissions(m).map((p, i) => (
                    <tr key={p} className={i % 2 === 0 ? "bg-gray-50/70" : ""}>
                      <td className={`sticky left-0 pl-10 pr-4 py-2 text-gray-600 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        {tt.actions[p.split(".")[1] as keyof typeof tt.actions]}
                      </td>
                      {roles.map((r) => (
                        <td key={r.id} className="px-3 py-2 text-center">
                          {r.isSystem || r.permissions.includes(p) ? (
                            <span className="inline-flex w-6 h-6 rounded-full items-center justify-center bg-[#3FA45B]/15 text-[#3FA45B]" aria-label={t.adminCommon.yes}>
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" aria-label={t.adminCommon.no} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-4 sm:px-5 py-3 text-xs text-gray-500 flex items-center gap-1.5 border-t border-gray-100">
        <Lock className="w-3.5 h-3.5 text-[#E87722]" />{tt.superAdminOnly}
      </p>
    </Panel>
  );
}
