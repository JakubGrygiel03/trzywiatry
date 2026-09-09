import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Official horizontal lockup — exact brand asset. */
export function Logo({
  variant = "nav",
  className,
  priority = false,
}: {
  variant?: "nav" | "footer";
  className?: string;
  priority?: boolean;
}) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      aria-label="Trzy Wiatry — strona główna"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/brand/logo-nav.png"
        alt="Trzy Wiatry"
        width={336}
        height={156}
        sizes={isFooter ? "(max-width: 768px) 160px, 280px" : "192px"}
        className={isFooter ? "footer-logo" : "h-8 w-auto md:h-12"}
        style={{ width: "auto" }}
        priority={priority}
      />
    </Link>
  );
}
