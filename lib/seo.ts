import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
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
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ? [{ url: input.image, alt: input.title }] : undefined;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
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
      images: input.image ? [input.image] : undefined,
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
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PLN",
      price: productOfferPrice(product.priceInCents),
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: SITE.name,
    description: SITE.tagline,
    url: absoluteUrl("/"),
    email: SITE.email,
    telephone: SITE.phone,
    image: absoluteUrl("/brand/logo-nav.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Życzliwa 13/4",
      addressLocality: "Gdańsk",
      postalCode: "80-176",
      addressCountry: "PL",
    },
    sameAs: [SITE.instagram, SITE.facebook],
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
