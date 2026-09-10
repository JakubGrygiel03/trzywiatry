import Link from "next/link";
import { getPublicNavLinks } from "@/lib/constants";
import { getCustomerSession } from "@/lib/customer-session";
import { getSettings } from "@/lib/data/queries";
import { CartTrigger } from "@/components/layout/cart-trigger";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function Navbar() {
  const settings = getSettings();
  const links = getPublicNavLinks(settings.workshopsEnabled);
  const customer = await getCustomerSession();

  return (
    <header className="border-b border-czarny/8 bg-nav">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-[4.5rem] md:px-14 lg:px-16 xl:px-20">
        <Logo priority />
        <nav className="hidden items-center gap-8 md:flex lg:gap-11">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-[13px] uppercase tracking-[0.14em] text-czarny/80 transition-colors hover:text-czerwony md:text-[15px] md:tracking-[0.16em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 md:gap-4">
          <Link
            href={customer ? "/konto" : "/konto/logowanie"}
            className="hidden font-heading text-[13px] uppercase tracking-[0.14em] text-szary hover:text-czarny md:inline md:text-[15px] md:tracking-[0.16em]"
          >
            {customer ? "Konto" : "Zaloguj"}
          </Link>
          <CartTrigger />
          <MobileNav links={links} accountHref={customer ? "/konto" : "/konto/logowanie"} />
        </div>
      </div>
    </header>
  );
}
