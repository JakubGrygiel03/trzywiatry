import type { MetadataRoute } from "next";
import {
  areWorkshopsEnabled,
  getPublishedPosts,
  getPublishedProducts,
  getWorkshops,
} from "@/lib/data/queries";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://trzywiatry.pl";
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
  }));

  const products = getPublishedProducts().map((product) => ({
    url: `${base}/sklep/${product.slug}`,
    lastModified: new Date(),
  }));
  const workshops = workshopsOn
    ? getWorkshops().map((workshop) => ({
        url: `${base}/warsztaty/${workshop.slug}`,
        lastModified: new Date(),
      }))
    : [];
  const posts = getPublishedPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  return [...staticRoutes, ...products, ...workshops, ...posts];
}
