"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const MUTATION_KEYS = ["zapisano", "usunieto", "przywrocono", "t", "raport"];

/** The admin shell stays mounted — refresh RSC after any mutation redirect. */
export function AdminMutationRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef("");

  useEffect(() => {
    const mutated = MUTATION_KEYS.some((key) => searchParams.has(key));
    const key = `${pathname}?${searchParams.toString()}`;
    if (!mutated || last.current === key) return;
    last.current = key;
    router.refresh();
  }, [pathname, router, searchParams]);

  return null;
}
