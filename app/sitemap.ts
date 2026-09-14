import type { MetadataRoute } from "next";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import {
  areWorkshopsEnabled,
  getCollections,
  getPublishedPosts,
  getPublishedProducts,
  getWorkshops,
} from "@/lib/data/queries";
import { getPublicSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureAtelierHydrated();
  const base = getPublicSiteUrl();
  const workshopsOn = areWorkshopsEnabled();

  const staticPaths = [
    "",
    "/sklep",
    ...(workshopsOn ? ["/warsztaty"] : []),
    "/b2b",
    "/o-nas",
    "/kontakt",
    "/faq",
    "/poradnik-pielegnacji",
    "/dostawa-i-zwroty",
    "/regulamin",
    "/polityka-prywatnosci",
    "/blog",
  ];

  const staticRoutes = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/sklep" ? ("daily" as const) : ("weekly" as const),
    priority: path === "" ? 1 : path === "/sklep" ? 0.9 : 0.7,
  }));

  const products = getPublishedProducts().map((product) => ({
    url: `${base}/sklep/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const collections = getCollections().map((collection) => ({
    url: `${base}/kolekcje/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const workshops = workshopsOn
    ? getWorkshops().map((workshop) => ({
        url: `${base}/warsztaty/${workshop.slug}`,
        lastModified: new Date(workshop.eventDate),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    : [];
  const posts = getPublishedPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...products, ...collections, ...workshops, ...posts];
}
