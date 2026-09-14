import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official Trzy Wiatry sygnet from brand assets (`/brand/sygnet.png`).
 * Do not recolor with CSS filters — opaque PNG backgrounds become solid squares.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/sygnet.png"
      alt=""
      width={120}
      height={100}
      className={cn("h-auto w-auto object-contain", className)}
      aria-hidden
    />
  );
}
