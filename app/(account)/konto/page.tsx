import Link from "next/link";
import { logoutCustomerAction } from "@/app/actions/account";
import { CustomerChangePasswordForm } from "@/components/account/customer-change-password-form";
import { OrderList } from "@/components/account/order-list";
import { Container, SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-session";
import { getOrdersForCustomer, splitCustomerOrders } from "@/lib/data/orders";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Konto" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ haslo?: string }>;
}) {
  const user = await getCustomerSession();
  if (!user) redirect("/konto/logowanie");

  const { haslo } = await searchParams;
  const { open, history } = splitCustomerOrders(getOrdersForCustomer(user));

  return (
    <div>
      <Container className="max-w-2xl space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            eyebrow="Strefa klienta"
            title={user.name.split(" ")[0] ? `Witamy, ${user.name.split(" ")[0]}` : "Twoje konto"}
            description="Zamówienia w realizacji, historia i ustawienia konta."
          />
          <form action={logoutCustomerAction}>
            <Button type="submit" variant="outline" size="sm">
              Wyloguj
            </Button>
          </form>
        </div>

        {haslo ? (
          <p className="rounded-xl bg-krem px-4 py-3 text-sm text-czarny/70">Hasło zostało zaktualizowane.</p>
        ) : null}

        <OrderList
          title="W realizacji"
          empty="Nie masz teraz żadnego zamówienia w toku."
          orders={open}
        />

        <OrderList
          title="Historia zamówień"
          empty="Tu pojawią się zakończone i anulowane zamówienia."
          orders={history}
        />

        {open.length === 0 && history.length === 0 ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/sklep">Przejdź do sklepu</Link>
          </Button>
        ) : null}

        <CustomerChangePasswordForm />
      </Container>
    </div>
  );
}
