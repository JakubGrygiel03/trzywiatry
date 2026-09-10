import type { ReactNode } from "react";
import { connection } from "next/server";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSettings } from "@/lib/data/queries";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await connection();
  const announcementHidden = getSettings().announcementType === "hidden";

  return (
    <div
      className="site-shell flex min-h-screen flex-col"
      data-announcement={announcementHidden ? "off" : "on"}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
