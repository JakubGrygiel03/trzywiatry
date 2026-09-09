import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trzy Wiatry",
    short_name: "Trzy Wiatry",
    description: SITE.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#9c644e",
    lang: "pl-PL",
    categories: ["shopping", "lifestyle", "productivity"],
    icons: [
      { src: "/api/pwa/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/api/pwa/icon-512", sizes: "512x512", type: "image/png" },
      {
        src: "/api/pwa/maskable-icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Sklep",
        short_name: "Sklep",
        description: "Otwórz katalog Trzy Wiatry",
        url: "/sklep",
      },
      {
        name: "Panel admina",
        short_name: "Admin",
        description: "Otwórz panel CMS",
        url: "/admin/logowanie",
      },
    ],
  };
}
