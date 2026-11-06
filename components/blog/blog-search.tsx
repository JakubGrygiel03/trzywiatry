"use client";

import { useLayoutEffect } from "react";

function applyBlogQuery(raw: string) {
  const q = raw.trim().toLowerCase();
  const items = document.querySelectorAll<HTMLElement>("[data-blog-search]");
  let visible = 0;
  items.forEach((item) => {
    const show = !q || (item.dataset.blogSearch ?? "").includes(q);
    item.hidden = !show;
    if (show) visible += 1;
  });

  const status = document.getElementById("blog-search-status");
  if (status) {
    status.hidden = !q;
    status.textContent =
      visible === 0
        ? `Nic nie pasuje do „${raw.trim()}”.`
        : `Znaleziono ${visible} ${visible === 1 ? "wpis" : "wpisów"} dla „${raw.trim()}”.`;
  }

  const empty = document.getElementById("blog-search-empty");
  if (empty) empty.hidden = !q || visible !== 0;
}

/** Filters the server-rendered list in the browser — /blog stays a cached page. */
export function BlogSearch() {
  useLayoutEffect(() => {
    const sync = () => applyBlogQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return (
    <form
      className="mt-5 flex max-w-md gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        const href = q ? `/blog?q=${encodeURIComponent(q)}` : "/blog";
        window.history.pushState(null, "", href);
        applyBlogQuery(q);
      }}
    >
      <input
        id="blog-q"
        name="q"
        type="search"
        placeholder="Szukaj we wpisach…"
        className="h-10 min-w-0 flex-1 rounded-full border border-czarny/12 bg-krem/30 px-4 text-sm outline-none focus:border-czerwony"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-czerwony px-4 font-heading text-[10px] uppercase tracking-[0.14em] text-bialy"
      >
        Szukaj
      </button>
    </form>
  );
}
