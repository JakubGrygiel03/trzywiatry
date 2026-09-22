import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/brand/social-icons";
import { Logo } from "@/components/layout/logo";
import { MailtoLink } from "@/components/layout/mailto-link";
import { OutboundSocialLink } from "@/components/layout/outbound-social-link";
import { SITE } from "@/lib/constants";

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/poradnik-pielegnacji", label: "Pielęgnacja" },
  { href: "/dostawa-i-zwroty", label: "Dostawa" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} prefetch className="relative z-[1] shrink-0 transition-colors hover:text-czerwony">
      {children}
    </Link>
  );
}

function FooterSocials() {
  const iconClass =
    "relative z-[1] flex size-7 shrink-0 items-center justify-center text-czarny/55 transition-colors hover:text-czerwony";
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      <OutboundSocialLink href={SITE.instagram} className={iconClass} aria-label="Instagram Trzy Wiatry">
        <InstagramIcon className="size-3.5" />
      </OutboundSocialLink>
      <OutboundSocialLink href={SITE.facebook} className={iconClass} aria-label="Facebook Trzy Wiatry">
        <FacebookIcon className="size-3.5" />
      </OutboundSocialLink>
    </span>
  );
}

/** Slim bar — help, credit and legal on one line. Header already covers Sklep / O nas / B2B. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-frame relative overflow-hidden border-t border-czarny/10 bg-bialy">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(/brand/wzory/a.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
        }}
      />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-4 md:flex-row md:justify-between md:gap-5 md:px-14 md:py-5 lg:px-16 xl:px-20">
        <Logo variant="footer" />

        <nav
          aria-label="Stopka"
          className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-sm tracking-wide text-czarny/70 md:flex-nowrap md:gap-x-4"
        >
          {helpLinks.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
          <MailtoLink email={SITE.email} className="shrink-0" />
          <FooterSocials />
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-x-3 text-[11px] tracking-wide text-czarny/40 md:flex-nowrap md:justify-end">
          <p className="whitespace-nowrap">
            © {year} {SITE.name} · Copyright Jakub Grygiel
          </p>
          <span className="hidden text-czarny/20 md:inline" aria-hidden>
            ·
          </span>
          <nav aria-label="Dokumenty sklepu" className="flex shrink-0 gap-3">
            <FooterLink href="/regulamin">Regulamin</FooterLink>
            <FooterLink href="/polityka-prywatnosci">Polityka prywatności</FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}
