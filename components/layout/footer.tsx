import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const navLinks = [
  { href: "/sklep", label: "Sklep" },
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Minimal footer matching the legacy WordPress layout. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-frame border-t border-czarny/10 bg-bialy">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-6 py-5 md:grid-cols-3 md:gap-5 md:px-14 md:py-6 lg:px-16 xl:px-20">
        <nav className="space-y-1 text-left text-sm leading-snug tracking-wide text-czarny md:justify-self-start">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-czerwony"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/regulamin"
            className="inline-block text-czarny/80 transition-colors hover:text-czerwony"
          >
            Regulamin sklepu internetowego
          </Link>
          <Link
            href="/polityka-prywatnosci"
            className="mt-0.5 inline-block text-czarny/80 transition-colors hover:text-czerwony"
          >
            Polityka prywatności
          </Link>
        </nav>

        <Logo variant="footer" className="justify-self-center" />

        <p className="text-left text-sm tracking-wide text-czarny md:justify-self-end md:text-right">
          Copyright © {year} Trzy Wiatry
        </p>
      </div>
    </footer>
  );
}
