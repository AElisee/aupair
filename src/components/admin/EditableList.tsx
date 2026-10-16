"use client";
import { useState } from "react";
import { Plus, X, CircleCheck, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n";
import { ICON, Panel, PanelHeader } from "@/components/admin/AdminUI";

const INPUT =
  "flex-1 min-w-0 h-10 border border-gray-200 rounded-xl px-3 text-sm bg-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87722]";

/**
 * Liste de textes éditable du back-office : `chips` pour des valeurs courtes (langues, durées…),
 * `rows` pour des phrases (avantages de l'abonnement). Sans `Panel` quand `bare` est vrai.
 */
export default function EditableList({
  title,
  subtitle,
  icon,
  color,
  items,
  onChange,
  variant = "chips",
  placeholder,
  bare = false,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  items: string[];
  onChange: (items: string[]) => void;
  variant?: "chips" | "rows";
  placeholder?: string;
  bare?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const { t } = useI18n();
  const ts = t.adminSettings;

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDuplicate(true);
      return;
    }
    onChange([...items, value]);
    setDraft("");
  };

  const remove = (item: string) => onChange(items.filter((i) => i !== item));

  const content = (
    <>
      <PanelHeader
        icon={icon}
        color={color}
        title={title}
        subtitle={subtitle}
        action={
          <span
            className="rounded-xl px-2.5 py-1 text-xs font-medium tabular-nums whitespace-nowrap"
            style={{ background: `${color}1A`, color }}
          >
            {ts.itemCount(items.length)}
          </span>
        }
      />

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">{ts.noItems}</p>
      ) : variant === "chips" ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white/90 pl-3 pr-1 h-9 text-sm text-gray-700"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                title={ts.removeItem}
                aria-label={`${ts.removeItem} ${item}`}
                className="p-1 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X {...ICON} size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <ul className="mb-4 divide-y divide-gray-200/60 rounded-xl border border-gray-200/70 bg-white/70">
          {items.map((item) => (
            <li key={item} className="group flex items-start gap-2.5 px-3 py-2.5 text-sm text-gray-700">
              <CircleCheck {...ICON} size={18} className="shrink-0 mt-px" style={{ color }} />
              <span className="flex-1 min-w-0">{item}</span>
              <button
                type="button"
                onClick={() => remove(item)}
                title={ts.removeItem}
                aria-label={`${ts.removeItem} ${item}`}
                className="p-1 -m-1 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <X {...ICON} size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setDuplicate(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? ts.addItem}
          aria-label={placeholder ?? ts.addItem}
          className={INPUT}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          title={t.adminCommon.add}
          aria-label={t.adminCommon.add}
          className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-gray-500 hover:text-[#E87722] hover:border-[#E87722]/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus {...ICON} size={18} />
        </button>
      </div>
      {duplicate && <p className="text-xs text-red-500 mt-1.5">{ts.itemExists}</p>}
    </>
  );

  return bare ? <div>{content}</div> : <Panel className="p-5">{content}</Panel>;
}
