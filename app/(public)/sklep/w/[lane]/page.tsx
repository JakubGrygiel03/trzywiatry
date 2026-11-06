import { ShopLaneCatalog } from "@/components/shop/shop-lane-screen";
import type { ShopLaneModel } from "@/components/shop/shop-lane-view";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import {
  filterCatalog,
  getCatalogPriceBounds,
  getProductCategories,
  getSettings,
  getShopCategoryCounts,
} from "@/lib/data/queries";
import { labelForCategory } from "@/lib/product-categories";
import { categoryTreeForLane, isShopLane, isShopLaneEnabled, SHOP_LANES } from "@/lib/shop-lanes";
import { noIndexRobots, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SHOP_DESCRIPTION =
  "Ręcznie toczona ceramika i półka dla pracowni: kubki, czarki, miski, formy matki. Katalog Trzy Wiatry z Gdańska.";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lane: "uzytkowa" }, { lane: "pracownia" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lane: string }>;
}): Promise<Metadata> {
  const { lane } = await params;
  if (!isShopLane(lane)) return { title: "Sklep", robots: noIndexRobots };
  return pageMetadata({
    title: SHOP_LANES[lane].label,
    description: SHOP_DESCRIPTION,
    path: `/sklep?sklep=${lane}`,
  });
}

function laneModel(lane: "uzytkowa" | "pracownia"): ShopLaneModel {
  const categories = getProductCategories();
  const products = filterCatalog({ lane });
  const counts = getShopCategoryCounts(lane);
  return {
    lane,
    products,
    categoryLabels: Object.fromEntries(
      products.map((product) => [product.id, labelForCategory(categories, product.category)]),
    ),
    priceBounds: getCatalogPriceBounds(lane),
    categoryCounts: {
      byCategory: Object.fromEntries(counts.byCategory),
      byDomain: Object.fromEntries(counts.byDomain),
    },
    categoryTree: categoryTreeForLane(lane, categories),
  };
}

export default async function ShopLanePage({ params }: { params: Promise<{ lane: string }> }) {
  await ensureAtelierHydrated();
  const { lane } = await params;
  if (!isShopLane(lane)) notFound();

  const laneMeta = SHOP_LANES[lane];
  if (!isShopLaneEnabled(lane, getSettings())) {
    return (
      <div className="py-8 md:py-10">
        <Container className="space-y-4">
          <SurfacePageIntro
            eyebrow={laneMeta.shortLabel}
            title={laneMeta.label}
            description="Ten dział sklepu jest teraz w przygotowaniu i chwilowo niedostępny."
          />
          <p>
            <a
              href="/sklep"
              className="inline-flex font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              Wróć do wyboru półki
            </a>
          </p>
        </Container>
      </div>
    );
  }

  const model = laneModel(lane);

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow={laneMeta.shortLabel}
          title={laneMeta.label}
          description={laneMeta.description}
        />
        <ShopLaneCatalog model={model} />
      </Container>
    </div>
  );
}
