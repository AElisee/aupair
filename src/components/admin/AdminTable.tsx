"use client";

/** Petites briques partagées par les tableaux du back-office (modération, signalements). */

export const TH = "text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap";
export const TD = "px-5 py-3.5";

export function AdminAvatar({ name, src, size = "w-8 h-8" }: { name: string; src?: string | null; size?: string }) {
  return (
    <div className={`${size} bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 overflow-hidden`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover object-top" />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}

/** Date et heure exactes sur deux lignes (ex. 06/11/2026 · 14:32) */
export function AdminDateTime({ value, locale }: { value: string | number; locale: string }) {
  const d = new Date(value);
  return (
    <div className="whitespace-nowrap tabular-nums">
      <p className="text-xs text-gray-700">{d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
      <p className="text-xs text-gray-400">{d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</p>
    </div>
  );
}

export function AdminIconButton({ title, onClick, disabled, className, children }: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-xl transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
