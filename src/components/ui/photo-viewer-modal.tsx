"use client";
import { X } from "lucide-react";
import { useI18n } from "@/i18n";

export default function PhotoViewerModal({
  url,
  alt = "",
  onClose,
}: {
  url: string;
  alt?: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
        aria-label={t.common.close}
      >
        <X className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="max-w-full max-h-full rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
