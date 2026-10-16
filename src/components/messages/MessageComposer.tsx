"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, SendHorizontal } from "lucide-react";
import { ICON } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const ACCEPTED_FILES =
  "image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_TEXTAREA_HEIGHT_PX = 128;

/** Zone de saisie : pièce jointe, texte multiligne auto-extensible, envoi */
export function MessageComposer({
  onSend,
  onFile,
  sending,
  uploading,
  error,
}: {
  /** Renvoie `true` si le message est parti (le champ est alors vidé) */
  onSend: (content: string) => Promise<boolean>;
  onFile: (file: File) => void;
  sending: boolean;
  uploading: boolean;
  error: string;
}) {
  const { t } = useI18n();
  const m = t.messages;
  const [value, setValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  };

  const submit = async () => {
    const content = value.trim();
    if (!content || sending) return;
    if (await onSend(content)) {
      setValue("");
      requestAnimationFrame(() => {
        resize();
        textareaRef.current?.focus();
      });
    }
  };

  const iconButton =
    "w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]/50";

  return (
    <div className="border-t border-gray-100 bg-white px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {error && <p className="text-xs text-red-500 mb-2 px-1" role="alert">{error}</p>}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          title={m.attach}
          aria-label={m.attach}
          className={cn(iconButton, "text-gray-500 hover:text-[#E87722] hover:bg-[#FFF3E0]")}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip {...ICON} />}
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            // Entrée envoie sur ordinateur ; sur écran tactile elle passe à la ligne (bouton d'envoi dédié)
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia("(pointer: coarse)").matches) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={m.writeMessage}
          aria-label={m.writeMessage}
          className="flex-1 min-w-0 resize-none max-h-32 min-h-11 py-2.5 px-4 rounded-3xl bg-gray-50 border border-gray-200 text-base sm:text-sm leading-6 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E87722]/40"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || sending}
          aria-label={m.send}
          title={m.send}
          className={cn(iconButton, "bg-[#E87722] text-white hover:bg-[#d06619] shadow-sm")}
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal {...ICON} strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  );
}
