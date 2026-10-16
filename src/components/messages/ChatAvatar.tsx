import { cn } from "@/lib/utils";

/** Avatar d'un interlocuteur : photo, sinon initiale sur fond bleu nuit */
export function ChatAvatar({ name, avatar, className }: { name: string; avatar: string | null; className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white text-sm font-medium overflow-hidden shrink-0",
        className
      )}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="w-full h-full object-cover object-top" />
      ) : (
        <span>{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
