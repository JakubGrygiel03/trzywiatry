import type { MetadataRoute } from "next";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import {
  areWorkshopsEnabled,
  getCollections,
  getPublishedPosts,
  getPublishedProducts,
  getSettings,
  getWorkshops,
} from "@/lib/data/queries";
import { getProductPhoto } from "@/lib/media";
import { absoluteUrl } from "@/lib/site-url";

/** Cached XML for Googlebot — cold Supabase must not 500 the sitemap. */
export const revalidate = 3600;

async function hydrateSitemapCatalog() {
  try {
    await Promise.race([
      ensureAtelierHydrated(),
      new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      }),
    ]);
  } catch {
    // Seed / last in-memory catalog is enough for GSC.
  }
}

function entry(
  path: string,
  opts: {
    lastModified?: Date | string;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    images?: string[];
  } = {},
): MetadataRoute.Sitemap[number] {
  const lastModified =
    opts.lastModified instanceof Date
      ? opts.lastModified
      : opts.lastModified
        ? new Date(opts.lastModified)
        : undefined;
  return {
    url: absoluteUrl(path),
    lastModified: lastModified && !Number.isNaN(lastModified.getTime()) ? lastModified : undefined,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    images: opts.images,
  };
}

/** Public URLs only — GSC: https://trzywiatry.pl/sitemap.xml */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await hydrateSitemapCatalog();
  const settingsStamp = getSettings().settingsUpdatedAt;
  const workshopsOn = areWorkshopsEnabled();

  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1, lastModified: settingsStamp }),
    entry("/sklep", { changeFrequency: "daily", priority: 0.9, lastModified: settingsStamp }),
    entry("/b2b", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/o-nas", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/kontakt", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/faq", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/poradnik-pielegnacji", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/dostawa-i-zwroty", { changeFrequency: "monthly", priority: 0.5 }),
    entry("/regulamin", { changeFrequency: "yearly", priority: 0.3 }),
    entry("/polityka-prywatnosci", { changeFrequency: "yearly", priority: 0.3 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.7 }),
  ];

  if (workshopsOn) {
    staticRoutes.splice(2, 0, entry("/warsztaty", { changeFrequency: "weekly", priority: 0.7 }));
  }

  const products = getPublishedProducts().map((product) => {
    const photo = getProductPhoto(product);
    return entry(`/sklep/${product.slug}`, {
      changeFrequency: "weekly",
      priority: product.isBestseller ? 0.85 : 0.8,
      images: photo ? [absoluteUrl(photo)] : undefined,
    });
  });

  const collections = getCollections().map((collection) =>
    entry(`/kolekcje/${collection.slug}`, {
      changeFrequency: "weekly",
      priority: 0.65,
      images: collection.imageUrl ? [absoluteUrl(collection.imageUrl)] : undefined,
    }),
  );

  const workshops = workshopsOn
    ? getWorkshops()
        .filter((workshop) => workshop.isPublished)
        .map((workshop) =>
          entry(`/warsztaty/${workshop.slug}`, {
            lastModified: workshop.eventDate,
            changeFrequency: "weekly",
            priority: 0.6,
            images: workshop.imageUrl ? [absoluteUrl(workshop.imageUrl)] : undefined,
          }),
        )
    : [];

  const posts = getPublishedPosts().map((post) =>
    entry(`/blog/${post.slug}`, {
      lastModified: post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      images: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    }),
  );

  return [...staticRoutes, ...products, ...collections, ...workshops, ...posts];
}
