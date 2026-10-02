import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import type { StudioIdentity } from "@/lib/studio-identity";
import { studioIdentity } from "@/lib/studio-identity";
import type { Product } from "@/lib/types";
import { getProductPhoto } from "@/lib/media";
import { absoluteUrl } from "@/lib/site-url";

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false, noimageindex: true },
};

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  /** Homepage: skip the "%s · Trzy Wiatry" template so the brand is not doubled. */
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const shareImage = input.image || "/brand/logo-nav.png";
  const image = [{ url: shareImage, alt: input.title }];
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url, languages: { "pl-PL": url } },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: input.type ?? "website",
      locale: "pl_PL",
      siteName: SITE.name,
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [shareImage],
    },
  };
}

export function productOfferPrice(cents: number) {
  return (cents / 100).toFixed(2);
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/sklep/${product.slug}`);
  const image = getProductPhoto(product);
  const stock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const sku = product.variants.find((variant) => variant.sku)?.sku ?? product.slug;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription ?? product.description,
    image: image ? [absoluteUrl(image)] : undefined,
    sku,
    url,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PLN",
      price: productOfferPrice(product.priceInCents),
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
}

export function localBusinessJsonLd(identity: StudioIdentity = studioIdentity()) {
  const street = identity.addressLines[0]?.replace(/,$/, "") ?? identity.address;
  const cityLine = identity.addressLines[1] ?? "";
  const postal = cityLine.match(/\d{2}-\d{3}/)?.[0] ?? "80-176";
  const city = cityLine.replace(/\d{2}-\d{3}\s*/, "").trim() || "Gdańsk";
  return {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: identity.name,
    description: SITE.seoDescription,
    url: absoluteUrl("/"),
    email: identity.email,
    telephone: identity.phone,
    image: absoluteUrl("/brand/logo-nav.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      postalCode: postal,
      addressCountry: "PL",
    },
    sameAs: [identity.instagram, identity.facebook],
    areaServed: { "@type": "Country", name: "PL" },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    description: SITE.seoDescription,
    url: absoluteUrl("/"),
    inLanguage: "pl-PL",
    publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
