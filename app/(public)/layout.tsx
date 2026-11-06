import type { ReactNode } from "react";
import { Suspense } from "react";
import { TrafficBeacon } from "@/components/analytics/traffic-beacon";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteSettingsProvider } from "@/components/cms/site-settings-provider";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { PrefetchWarmRoutes } from "@/components/layout/prefetch-warm-routes";
import { ScrollToTopOnNavigate } from "@/components/layout/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/layout/site-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { arePaymentsPublic } from "@/lib/payment-access";
import { studioIdentity } from "@/lib/studio-identity";

/**
 * Safety-net ISR. Admin saves and paid orders call revalidatePath, so a visit
 * should not rebuild the shell. One hour covers a missed invalidation.
 */
export const revalidate = 3600;

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Shared data cache — do not force a Supabase read on every visitor.
  await ensureAtelierHydrated();
  const settings = getSettings();
  const announcementHidden = settings.announcementType === "hidden";
  // Env-only in layout so cookies() do not force every public page dynamic.
  // /zamowienie still uses resolvePaymentAccess() for admin-tester bypass.
  const paymentsPublic = arePaymentsPublic();
  const paymentAccess = {
    isPublic: paymentsPublic,
    canPay: paymentsPublic,
    isTester: false,
  };

  return (
    <SiteSettingsProvider settings={settings} paymentAccess={paymentAccess}>
      <div
        className="site-shell flex min-h-screen w-full max-w-full flex-col"
        data-announcement={announcementHidden ? "off" : "on"}
      >
        <SiteHeader />
        <div className="site-frame flex min-h-0 flex-1 flex-col">
          <main className="min-w-0 max-w-full flex-1 overflow-x-clip">{children}</main>
          <Footer identity={studioIdentity(settings)} />
        </div>
        <CartDrawer />
        <CookieConsent />
        <TrafficBeacon />
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        <PrefetchWarmRoutes />
      </div>
    </SiteSettingsProvider>
  );
}
