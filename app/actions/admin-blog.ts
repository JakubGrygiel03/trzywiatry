"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllPosts, getPostById } from "@/lib/data/queries";
import { deleteRuntimeBlogPost, upsertRuntimeBlogPost } from "@/lib/data/runtime-store";
import type { BlogPost } from "@/lib/types";
import { blogPostSchema } from "@/lib/validations/blog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function plainContentFromBlocks(blocks: BlogPost["blocks"]) {
  const first = blocks?.find((b) => b.type === "paragraph");
  return first && first.type === "paragraph" ? first.text : "";
}

function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
}

async function parseBlogForm(formData: FormData) {
  const blocksRaw = String(formData.get("blocks") ?? "").trim();
  let blocks: unknown = [];
  try {
    blocks = JSON.parse(blocksRaw);
  } catch {
    return { ok: false as const, message: "Nieprawidłowy format bloków treści." };
  }

  const coverImage = String(formData.get("coverImage") ?? "").trim();

  const parsed = blogPostSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    title: formData.get("title"),
    slug: String(formData.get("slug") ?? "").trim() || slugify(String(formData.get("title") ?? "")),
    excerpt: formData.get("excerpt"),
    subtitle: String(formData.get("subtitle") ?? "").trim() || undefined,
    author: String(formData.get("author") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined,
    coverImage,
    status: formData.get("status"),
    blocks,
  });

  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Błąd walidacji." };
  }

  return { ok: true as const, data: parsed.data };
}

export async function createBlogPost(formData: FormData) {
  const result = await parseBlogForm(formData);
  if (!result.ok) {
    redirect(`/admin/blog/nowy?blad=${encodeURIComponent(result.message)}`);
  }

  const data = result.data;
  const slugTaken = getAllPosts().some((post) => post.slug === data.slug);
  if (slugTaken) {
    redirect("/admin/blog/nowy?blad=" + encodeURIComponent("Slug jest już zajęty."));
  }

  const now = new Date().toISOString();
  const post: BlogPost = {
    id: `post-${crypto.randomUUID().slice(0, 10)}`,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    subtitle: data.subtitle,
    author: data.author ?? "Jędrzej",
    category: data.category ?? "Poradnik",
    content: plainContentFromBlocks(data.blocks) || data.excerpt,
    blocks: data.blocks,
    coverImage: data.coverImage,
    status: data.status,
    publishedAt: data.status === "published" ? now : now,
  };

  upsertRuntimeBlogPost(post);
  revalidateBlog(post.slug);
  redirect(`/admin/blog/${post.id}?zapisano=1`);
}

export async function updateBlogPost(formData: FormData) {
  const result = await parseBlogForm(formData);
  if (!result.ok || !result.data.id) {
    redirect("/admin/blog?blad=1");
  }

  const data = result.data;
  const existing = getPostById(data.id!);
  if (!existing) redirect("/admin/blog?blad=1");

  const slugTaken = getAllPosts().some((post) => post.slug === data.slug && post.id !== existing.id);
  if (slugTaken) {
    redirect(`/admin/blog/${existing.id}?blad=` + encodeURIComponent("Slug jest już zajęty."));
  }

  const wasPublished = existing.status === "published";
  const nowPublished = data.status === "published";

  const post: BlogPost = {
    ...existing,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    subtitle: data.subtitle,
    author: data.author ?? existing.author,
    category: data.category ?? existing.category,
    content: plainContentFromBlocks(data.blocks) || data.excerpt,
    blocks: data.blocks,
    coverImage: data.coverImage,
    status: data.status,
    publishedAt: nowPublished && !wasPublished ? new Date().toISOString() : existing.publishedAt,
  };

  upsertRuntimeBlogPost(post);
  revalidateBlog(post.slug);
  redirect(`/admin/blog/${post.id}?zapisano=1`);
}

export async function deleteBlogPost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const existing = getPostById(id);
  if (!existing) redirect("/admin/blog?blad=1");

  deleteRuntimeBlogPost(id);
  revalidateBlog(existing.slug);
  redirect("/admin/blog?usunieto=1");
}
