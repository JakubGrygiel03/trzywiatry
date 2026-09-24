import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteSettingsProvider } from "@/components/cms/site-settings-provider";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { PrefetchWarmRoutes } from "@/components/layout/prefetch-warm-routes";
import { ScrollToTopOnNavigate } from "@/components/layout/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/layout/site-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndexRobots,
};

export default async function AccountLayout({ children }: { children: ReactNode }) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const settings = getSettings();
  const announcementHidden = settings.announcementType === "hidden";

  return (
    <SiteSettingsProvider settings={settings}>
      <div
        className="site-shell flex min-h-screen w-full max-w-full flex-col"
        data-announcement={announcementHidden ? "off" : "on"}
      >
        <SiteHeader />
        <div className="site-frame flex min-h-0 flex-1 flex-col">
          <main className="min-w-0 max-w-full flex-1 overflow-x-clip">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
        <CookieConsent />
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        <PrefetchWarmRoutes />
      </div>
    </SiteSettingsProvider>
  );
}
