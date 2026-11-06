import { ShopHub } from "@/components/shop/shop-hub";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const SHOP_DESCRIPTION =
  "Ręcznie toczona ceramika i półka dla pracowni: kubki, czarki, miski, formy matki. Katalog Trzy Wiatry z Gdańska.";

export const metadata: Metadata = pageMetadata({
  title: "Sklep",
  description: SHOP_DESCRIPTION,
  path: "/sklep",
});

/** Hub only. Lane URLs are rewritten to a cached page so filters do not SSR. */
export default async function ShopPage() {
  await ensureAtelierHydrated();
  return <ShopHub />;
}
