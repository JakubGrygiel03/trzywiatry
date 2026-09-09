import type { ReactNode } from "react";
import { connection } from "next/server";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getSettings } from "@/lib/data/queries";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await connection();
  const announcementHidden = getSettings().announcementType === "hidden";

  return (
    <div
      className="site-shell flex min-h-screen flex-col"
      data-announcement={announcementHidden ? "off" : "on"}
    >
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
