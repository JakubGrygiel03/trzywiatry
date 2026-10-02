"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { BlogBlockEditor } from "@/components/admin/blog-block-editor";
import { CoverBackdropField } from "@/components/admin/cover-backdrop-field";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { coverBackdropClass, DEFAULT_BLOG_COVER_BACKDROP, isBlogCoverBackdrop } from "@/lib/blog-cover";
import type { BlogPost } from "@/lib/types";
import type { BlogBlockInput } from "@/lib/validations/blog";
import type { BlogSaveState } from "@/app/actions/admin-blog";
import { cn } from "@/lib/utils";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlogPostForm({
  action,
  post,
  submitLabel,
}: {
  action: (state: BlogSaveState, formData: FormData) => Promise<BlogSaveState>;
  post?: BlogPost;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [subtitle, setSubtitle] = useState(post?.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverBackdrop, setCoverBackdrop] = useState(
    isBlogCoverBackdrop(post?.coverBackdrop) ? post.coverBackdrop : DEFAULT_BLOG_COVER_BACKDROP,
  );
  const initialBlocks = (post?.blocks ?? []) as BlogBlockInput[];
  const [blocks, setBlocks] = useState<BlogBlockInput[]>(
    initialBlocks.length ? initialBlocks : [{ type: "paragraph", text: "" }],
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <form action={formAction} className="space-y-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="coverImage" value={coverImage} />
      {state.message ? <AdminAlert variant="error">{state.message}</AdminAlert> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium",
            mode === "edit" ? "bg-czarny text-bialy" : "border border-czarny/12 text-czarny/60",
          )}
        >
          Edycja
        </button>
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium",
            mode === "preview" ? "bg-czarny text-bialy" : "border border-czarny/12 text-czarny/60",
          )}
        >
          Podgląd jak na blogu
        </button>
      </div>

      {mode === "preview" ? (
        <article className="rounded-xl border border-czarny/8 bg-bialy px-5 py-8 md:px-10">
          <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
            {new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-2 font-heading text-3xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-4xl">
            {title || "Bez tytułu"}
          </h1>
          {subtitle ? <p className="mt-3 text-lg leading-relaxed text-czarny/65">{subtitle}</p> : null}
          {excerpt ? <p className="mt-3 text-sm italic text-czarny/45">Zajawka na liście: {excerpt}</p> : null}
          <div className="mt-8">
            <BlogBlocks blocks={blocks} />
          </div>
        </article>
      ) : null}

      <div className={cn("grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]", mode === "preview" && "hidden")}>
        <div className="space-y-6">
          <AdminFormSection
            title="Treść wpisu"
            description="Wklej z Worda albo układaj blokami. Zdjęcia z Worda nie wchodzą — dodaj je osobno. Kolejność zmieniasz uchwytem (6 kropek) albo strzałkami."
          >
            <AdminField label="Tytuł" htmlFor="title" required error={state.fieldErrors?.title}>
              <AdminInput
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </AdminField>

            <AdminField label="Podtytuł (opcjonalnie)" htmlFor="subtitle">
              <AdminInput id="subtitle" name="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </AdminField>

            <BlogBlockEditor
              initialBlocks={initialBlocks.length ? initialBlocks : undefined}
              onChange={setBlocks}
            />
            {state.fieldErrors?.blocks ? (
              <p className="text-xs text-czerwony">{state.fieldErrors.blocks}</p>
            ) : null}
          </AdminFormSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-10rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain">
          <AdminFormSection title="Publikacja">
            <AdminField label="Status" htmlFor="status">
              <AdminSelect id="status" name="status" defaultValue={post?.status ?? "draft"}>
                <option value="draft">Szkic</option>
                <option value="published">Opublikowany</option>
                <option value="archived">Archiwum</option>
              </AdminSelect>
            </AdminField>

            <AdminField label="Adres URL (slug)" htmlFor="slug" required error={state.fieldErrors?.slug}>
              <AdminInput
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </AdminField>

            <AdminField
              label="Krótki opis (zajawka)"
              htmlFor="excerpt"
              required
              error={state.fieldErrors?.excerpt}
              hint="1–2 zdania streszczenia pod tytułem na kafelku listy /blog — zanim ktoś otworzy cały artykuł."
            >
              <AdminTextarea
                id="excerpt"
                name="excerpt"
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-20"
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Meta">
            <AdminField label="Autor" htmlFor="author">
              <AdminInput id="author" name="author" defaultValue={post?.author ?? "Jędrzej"} />
            </AdminField>
            <AdminField label="Kategoria" htmlFor="category">
              <AdminInput id="category" name="category" defaultValue={post?.category ?? "Poradnik"} />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Okładka" description="Miniatura na liście /blog. Tło widać wokół zdjęcia.">
            {state.fieldErrors?.coverImage ? (
              <p className="text-xs text-czerwony">{state.fieldErrors.coverImage}</p>
            ) : null}
            {coverImage ? (
              <div
                className={`relative mb-3 aspect-[16/10] overflow-hidden rounded-lg border border-czarny/10 ${coverBackdropClass(coverBackdrop)}`}
              >
                <Image src={coverImage} alt="" fill className="object-contain p-3" sizes="300px" unoptimized />
              </div>
            ) : null}
            <CoverBackdropField value={coverBackdrop} onChange={setCoverBackdrop} />
            <AdminField label="Wgraj okładkę" htmlFor="coverFile">
              <AdminInput
                id="coverFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/admin/blog-upload", { method: "POST", body: fd, credentials: "same-origin" });
                  const data = await res.json();
                  if (res.ok) setCoverImage(data.url);
                }}
              />
            </AdminField>
            {!coverImage ? (
              <p className="text-xs text-czerwony">Okładka jest wymagana przed publikacją.</p>
            ) : (
              <button
                type="button"
                className="text-xs text-czarny/45 underline-offset-2 hover:text-czerwony hover:underline"
                onClick={() => setCoverImage("")}
              >
                Usuń okładkę
              </button>
            )}
          </AdminFormSection>
        </aside>
      </div>

      <AdminFormActions submitLabel={submitLabel} cancelHref="/admin/blog" pending={pending} />
    </form>
  );
}
