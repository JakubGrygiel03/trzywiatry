"use client";

import { useLayoutEffect, useState } from "react";
import { ShopLaneView, type ShopLaneModel } from "@/components/shop/shop-lane-view";
import { EMPTY_CATALOG_QUERY, parseCatalogSearchParams, type CatalogQuery } from "@/lib/catalog-query";

function sameQuery(a: CatalogQuery, b: CatalogQuery) {
  return (
    a.page === b.page &&
    a.sort === b.sort &&
    a.capacity === b.capacity &&
    a.domain === b.domain &&
    a.category === b.category &&
    a.minZl === b.minZl &&
    a.maxZl === b.maxZl
  );
}

/** Cached lane shell. Filters and pages update in the browser, not on the server. */
export function ShopLaneCatalog({ model }: { model: ShopLaneModel }) {
  const [query, setQuery] = useState<CatalogQuery>(EMPTY_CATALOG_QUERY);

  useLayoutEffect(() => {
    const sync = () => {
      const next = parseCatalogSearchParams(new URLSearchParams(window.location.search));
      setQuery((prev) => (sameQuery(prev, next) ? prev : next));
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function navigate(href: string) {
    window.history.pushState(null, "", href);
    setQuery(parseCatalogSearchParams(new URLSearchParams(href.split("?")[1] ?? "")));
  }

  return <ShopLaneView model={model} query={query} navigate={navigate} />;
}
