import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/brand/social-icons";
import { OutboundSocialLink } from "@/components/layout/outbound-social-link";
import { SITE } from "@/lib/constants";
import type { ReactNode } from "react";

function Detail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 py-5">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-krem text-czerwony"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-czarny/55">{label}</p>
        <div className="mt-1 text-base leading-relaxed text-czarny">{children}</div>
      </div>
    </div>
  );
}

const socialBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-czarny/10 bg-bialy text-czarny transition-colors hover:border-czerwony hover:text-czerwony";

export function ContactDirect() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 divide-y divide-czarny/8">
        <Detail icon={<Mail className="size-4" strokeWidth={1.5} />} label="E-mail">
          <a href={`mailto:${SITE.email}`} className="underline-offset-4 hover:text-czerwony hover:underline">
            {SITE.email}
          </a>
        </Detail>
        <Detail icon={<Phone className="size-4" strokeWidth={1.5} />} label="Telefon / Phone">
          <a href={SITE.phoneHref} className="underline-offset-4 hover:text-czerwony hover:underline">
            {SITE.phone}
          </a>
        </Detail>
        <Detail icon={<MapPin className="size-4" strokeWidth={1.5} />} label="Adres / Studio">
          <p>
            {SITE.owner} · NIP {SITE.nip}
          </p>
          {SITE.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </Detail>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <OutboundSocialLink href={SITE.instagram} className={socialBtn} aria-label="Instagram Trzy Wiatry">
          <InstagramIcon className="size-4 shrink-0" />
          <span className="text-sm">Instagram</span>
        </OutboundSocialLink>
        <OutboundSocialLink href={SITE.facebook} className={socialBtn} aria-label="Facebook Trzy Wiatry">
          <FacebookIcon className="size-4 shrink-0" />
          <span className="text-sm">Facebook</span>
        </OutboundSocialLink>
      </div>
    </div>
  );
}
