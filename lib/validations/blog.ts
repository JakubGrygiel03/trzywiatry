import { z } from "zod";

const blogImageSchema = z.object({
  src: z.string().min(1, "Dodaj zdjęcie"),
  alt: z.string().min(1, "Podaj opis zdjęcia (alt)"),
  caption: z.string().optional(),
});

export const blogBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().min(1, "Tekst nie może być pusty") }),
  z.object({ type: z.literal("heading"), text: z.string().min(1, "Nagłówek nie może być pusty") }),
  z.object({
    type: z.literal("image"),
    src: z.string().min(1, "Dodaj zdjęcie"),
    alt: z.string().min(1, "Podaj opis zdjęcia (alt)"),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1)).min(1, "Lista musi mieć co najmniej jeden punkt"),
  }),
  z.object({ type: z.literal("formula"), text: z.string().min(1, "Wzór nie może być pusty") }),
  z.object({
    type: z.literal("link"),
    href: z.string().min(1, "Podaj adres URL"),
    label: z.string().min(1, "Podaj tekst linku"),
    prefix: z.string().optional(),
  }),
  z.object({
    type: z.literal("image-row"),
    images: z.tuple([blogImageSchema, blogImageSchema]),
  }),
]);

export const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Tytuł min. 3 znaki"),
  slug: z.string().min(2, "Podaj slug"),
  excerpt: z.string().min(10, "Zajawka min. 10 znaków"),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  coverImage: z.string().min(1, "Dodaj zdjęcie okładki"),
  status: z.enum(["draft", "published", "archived"]),
  blocks: z.array(blogBlockSchema).min(1, "Dodaj co najmniej jeden blok treści"),
});

export type BlogBlockInput = z.infer<typeof blogBlockSchema>;
