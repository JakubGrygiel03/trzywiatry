import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/constants";

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/poradnik-pielegnacji", label: "Pielęgnacja" },
  { href: "/dostawa-i-zwroty", label: "Dostawa" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

const primaryLinks = helpLinks.slice(0, 3);
const contactLink = helpLinks[3]!;

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="transition-colors hover:text-czerwony">
      {children}
    </Link>
  );
}

/** Slim bar — help + coordinates. Header already covers Sklep / O nas / B2B. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-frame relative overflow-hidden border-t border-czarny/10 bg-bialy">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/brand/wzory/a.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "360px auto",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:px-14 lg:px-16 xl:px-20">
        {/* Mobile: 1) FAQ/Pielęgnacja/Dostawa 2) Kontakt/mail/IG 3) logo → line. Desktop: logo | links. */}
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <nav
            aria-label="Stopka"
            className="order-1 w-full text-sm tracking-wide text-czarny/70 sm:order-2 sm:w-auto"
          >
            <div className="flex flex-col gap-2.5 sm:hidden">
              <div className="flex justify-between gap-2 text-center">
                {primaryLinks.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-center">
                <FooterLink href={contactLink.href}>{contactLink.label}</FooterLink>
                <a href={`mailto:${SITE.email}`} className="min-w-0 truncate transition-colors hover:text-czerwony">
                  {SITE.email}
                </a>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 transition-colors hover:text-czerwony"
                >
                  Instagram
                </a>
              </div>
            </div>

            <div className="hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
              {helpLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-czerwony">
                {SITE.email}
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-czerwony"
              >
                Instagram
              </a>
            </div>
          </nav>

          <div className="order-2 flex justify-center sm:order-1 sm:justify-start">
            <Logo variant="footer" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-czarny/8 pt-3 text-[11px] tracking-wide text-czarny/40">
          <p>
            © {year} {SITE.name}
            <span className="hidden sm:inline"> · {SITE.address}</span>
          </p>
          <nav aria-label="Dokumenty sklepu" className="flex gap-4">
            <FooterLink href="/regulamin">Regulamin</FooterLink>
            <FooterLink href="/polityka-prywatnosci">Polityka prywatności</FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
