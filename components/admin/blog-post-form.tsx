"use client";

import Image from "next/image";
import { useState } from "react";
import { BlogBlockEditor } from "@/components/admin/blog-block-editor";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import type { BlogPost } from "@/lib/types";
import type { BlogBlockInput } from "@/lib/validations/blog";

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
  action: (formData: FormData) => void | Promise<void>;
  post?: BlogPost;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");

  const initialBlocks = (post?.blocks ?? []) as BlogBlockInput[];

  return (
    <form action={action} className="space-y-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="coverImage" value={coverImage} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <AdminFormSection title="Treść wpisu" description="Układaj artykuł blokami — jak w edytorze WordPressa.">
            <AdminField label="Tytuł" htmlFor="title" required>
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
              <AdminInput id="subtitle" name="subtitle" defaultValue={post?.subtitle ?? ""} />
            </AdminField>

            <BlogBlockEditor initialBlocks={initialBlocks.length ? initialBlocks : undefined} />
          </AdminFormSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <AdminFormSection title="Publikacja">
            <AdminField label="Status" htmlFor="status">
              <AdminSelect id="status" name="status" defaultValue={post?.status ?? "draft"}>
                <option value="draft">Szkic</option>
                <option value="published">Opublikowany</option>
                <option value="archived">Archiwum</option>
              </AdminSelect>
            </AdminField>

            <AdminField label="Adres URL (slug)" htmlFor="slug" required>
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

            <AdminField label="Zajawka (lista wpisów)" htmlFor="excerpt" required>
              <AdminTextarea id="excerpt" name="excerpt" required defaultValue={post?.excerpt ?? ""} className="min-h-20" />
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

          <AdminFormSection title="Okładka" description="Miniatura na liście /blog.">
            {coverImage ? (
              <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg border border-czarny/10 bg-krem">
                <Image src={coverImage} alt="" fill className="object-cover" sizes="300px" unoptimized />
              </div>
            ) : null}
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

      <AdminFormActions submitLabel={submitLabel} cancelHref="/admin/blog" />
    </form>
  );
}
