import Link from "next/link";
import { getPublicNavLinks } from "@/lib/constants";
import { getSettings } from "@/lib/data/queries";
import { CartTrigger } from "@/components/layout/cart-trigger";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * Avoid cookies() here — it would force every public page dynamic.
 * Guests on /konto are redirected to login by proxy.
 */
export function Navbar() {
  const settings = getSettings();
  const links = getPublicNavLinks(settings.workshopsEnabled);

  return (
    <header className="site-chrome__nav border-b border-czarny/8" style={{ backgroundColor: "#ffffff" }}>
      <div className="relative mx-auto flex h-14 w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-6 md:h-[4.5rem] md:px-14 lg:px-16 xl:px-20">
        <Logo priority />
        <nav className="hidden min-w-0 items-center gap-8 md:flex lg:gap-11">
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
        <div className="relative z-10 flex shrink-0 items-center gap-2.5 md:gap-4">
          <Link
            href="/konto"
            className="hidden font-heading text-[13px] uppercase tracking-[0.14em] text-szary hover:text-czarny md:inline md:text-[15px] md:tracking-[0.16em]"
          >
            Konto
          </Link>
          <CartTrigger />
          <MobileNav links={links} accountHref="/konto" />
        </div>
      </div>
    </header>
  );
}
