import { cn } from "@/lib/utils";

type AdminAlertProps = {
  children: React.ReactNode;
  variant?: "info" | "success" | "error";
};

export function AdminAlert({ children, variant = "info" }: AdminAlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        variant === "success" && "border-czerwony/20 bg-czerwony/8 text-czarny/80",
        variant === "error" && "border-czerwony/35 bg-czerwony/12 text-czarny",
        variant === "info" && "border-czarny/10 bg-krem/60 text-czarny/70",
      )}
    >
      {children}
    </div>
  );
}
