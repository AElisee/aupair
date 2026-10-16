import { Separator } from "@/components/ui/separator";
import { PAGE_TITLE } from "@/components/admin/AdminUI";

/** En-tête des pages des espaces au pair / famille : titre (même charte que le back-office) + séparateur */
export function PageHeader({ title, subtitle, action }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <Separator />
    </div>
  );
}
