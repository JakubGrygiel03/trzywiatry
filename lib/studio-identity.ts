import { SITE } from "@/lib/constants";
import type { StudioSettings } from "@/lib/types";

export type StudioIdentity = {
  name: string;
  email: string;
  phone: string;
  phoneHref: string;
  address: string;
  addressLines: string[];
  nip: string;
  bankAccount: string;
  instagram: string;
  facebook: string;
  owner: string;
  regon: string;
};

export function phoneToHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return SITE.phoneHref;
  if (digits.startsWith("48") && digits.length >= 11) return `tel:+${digits}`;
  if (digits.length === 9) return `tel:+48${digits}`;
  return `tel:+${digits}`;
}

export function addressToLines(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return [`${parts[0]},`, parts.slice(1).join(", ")];
  }
  return [address];
}

/** CMS identity with SITE fallback — empty admin fields keep the brand seed. */
export function studioIdentity(settings?: Pick<
  StudioSettings,
  | "studioEmail"
  | "studioPhone"
  | "studioAddress"
  | "studioNip"
  | "studioBankAccount"
  | "studioInstagram"
  | "studioFacebook"
  | "studioOwner"
> | null): StudioIdentity {
  const email = settings?.studioEmail?.trim() || SITE.email;
  const phone = settings?.studioPhone?.trim() || SITE.phone;
  const address = settings?.studioAddress?.trim() || SITE.address;
  return {
    name: SITE.name,
    email,
    phone,
    phoneHref: phoneToHref(phone),
    address,
    addressLines: addressToLines(address),
    nip: settings?.studioNip?.replace(/\s/g, "") || SITE.nip,
    bankAccount: settings?.studioBankAccount?.trim() || SITE.bankAccount,
    instagram: settings?.studioInstagram?.trim() || SITE.instagram,
    facebook: settings?.studioFacebook?.trim() || SITE.facebook,
    owner: settings?.studioOwner?.trim() || SITE.owner,
    regon: SITE.regon,
  };
}
