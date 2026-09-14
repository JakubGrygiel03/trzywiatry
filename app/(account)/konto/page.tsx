import { logoutCustomerAction } from "@/app/actions/account";
import {
  AccountHelpLinks,
  AccountProfileCard,
  AccountStudioNotes,
} from "@/components/account/account-info-panels";
import { AccountOrdersPanels } from "@/components/account/account-orders-panels";
import { AccountTile, AccountTileBody } from "@/components/account/account-tile";
import { CustomerChangePasswordForm } from "@/components/account/customer-change-password-form";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";
import { Container } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-session";
import { getOrdersForCustomer, splitCustomerOrders } from "@/lib/data/orders";
import { getSettings } from "@/lib/data/queries";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Konto" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ haslo?: string; potwierdzone?: string }>;
}) {
  const user = await getCustomerSession();
  if (!user) redirect("/konto/logowanie");

  const { haslo, potwierdzone } = await searchParams;
  const settings = getSettings();
  const { open, history } = splitCustomerOrders(await getOrdersForCustomer(user));
  const firstName = user.name.trim().split(/\s+/)[0] || "gościu";

  return (
    <SurfaceCanvas>
      <Container className="relative max-w-3xl space-y-5 py-8 md:space-y-6 md:py-10">
        <AccountTile>
          <AccountTileBody className="sm:py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">
                  Strefa klienta
                </p>
                <h1 className="font-heading text-3xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-4xl">
                  Witamy, {firstName}
                </h1>
                <p className="max-w-md text-[15px] leading-relaxed text-czarny/60">
                  Zamówienia, śledzenie, dane konta i pomoc pracowni — w jednym miejscu.
                </p>
              </div>

              <form action={logoutCustomerAction} className="shrink-0">
                <Button type="submit" variant="outline" size="sm">
                  Wyloguj
                </Button>
              </form>
            </div>
          </AccountTileBody>
          <div className="grid grid-cols-2 border-t border-czarny/8 divide-x divide-czarny/8 bg-krem/45">
            <div className="px-5 py-4 sm:px-7">
              <p className="font-heading text-[10px] uppercase tracking-[0.18em] text-czarny/45">
                W realizacji
              </p>
              <p className="mt-1 font-heading text-2xl tracking-wide text-czerwony">{open.length}</p>
            </div>
            <div className="px-5 py-4 sm:px-7">
              <p className="font-heading text-[10px] uppercase tracking-[0.18em] text-czarny/45">
                Historia
              </p>
              <p className="mt-1 font-heading text-2xl tracking-wide text-czarny">{history.length}</p>
            </div>
          </div>
        </AccountTile>

        {potwierdzone ? (
          <p className="rounded-[22px] border border-czerwony/20 bg-bialy px-4 py-3 text-sm text-czerwony shadow-sm">
            E-mail potwierdzony. Konto jest aktywne.
          </p>
        ) : null}
        {haslo ? (
          <p className="rounded-[22px] border border-czerwony/20 bg-bialy px-4 py-3 text-sm text-czerwony shadow-sm">
            Hasło zostało zaktualizowane.
          </p>
        ) : null}

        <AccountOrdersPanels open={open} history={history} />

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <AccountProfileCard name={user.name} email={user.email} createdAt={user.createdAt} />
          <AccountStudioNotes settings={settings} />
        </div>

        <AccountHelpLinks />
        <CustomerChangePasswordForm />
      </Container>
    </SurfaceCanvas>
  );
}
