import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-6 pb-12 md:pt-8 md:pb-16">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
