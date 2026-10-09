import type { BlogBlock, BlogPost } from "@/lib/types";

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "formula":
      return block.text;
    case "list":
      return block.items.join(" ");
    case "image":
      return [block.alt, block.caption].filter(Boolean).join(" ");
    case "image-row":
      return block.images.map((image) => [image.alt, image.caption].filter(Boolean).join(" ")).join(" ");
    case "compare":
      return [
        block.title,
        block.beforeLabel,
        block.afterLabel,
        block.before.alt,
        block.after.alt,
        block.before.caption,
        block.after.caption,
      ]
        .filter(Boolean)
        .join(" ");
    case "link":
      return [block.prefix, block.label].filter(Boolean).join(" ");
    default:
      return "";
  }
}

export function postSearchHaystack(post: BlogPost) {
  const blocks = (post.blocks ?? []).map(blockText).join(" ");
  return [post.title, post.excerpt, post.content, post.category, post.subtitle, post.author, blocks]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterPostsByQuery<T extends BlogPost>(posts: T[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return posts;
  return posts.filter((post) => postSearchHaystack(post).includes(needle));
}
