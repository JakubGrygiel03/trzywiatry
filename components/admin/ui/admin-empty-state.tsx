import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AdminEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon ? (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-krem text-czarny/40">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      ) : null}
      <p className="text-sm font-medium text-czarny">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs leading-relaxed text-czarny/45">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
