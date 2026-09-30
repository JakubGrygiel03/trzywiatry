"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Force RSC refetch after a mutation redirect (delete / create) so the list is not stale. */
export function AdminCacheBust({ nonce }: { nonce?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!nonce) return;
    router.refresh();
  }, [nonce, router]);
  return null;
}
