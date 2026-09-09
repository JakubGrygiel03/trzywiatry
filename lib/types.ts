export type ProductDomain = "ceramika" | "drewno" | "warsztaty" | "formy";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";
export type BannerType = "promo" | "vacation" | "hidden";
export type PostStatus = "draft" | "published" | "archived";

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  priceInCents?: number;
  stockQuantity: number;
  isAvailable: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain: ProductDomain;
  category: string;
  subCategory?: string;
  capacityMl?: number;
  collectionId?: string;
  priceInCents: number;
  isPublished: boolean;
  isBestseller: boolean;
  images: string[];
  careInstructions?: string;
  lowStockThreshold: number;
  metaTitle?: string;
  metaDescription?: string;
  /** Curated upsell / pair IDs (boosted above algorithmic matches). */
  relatedIds?: string[];
  variants: ProductVariant[];
};

export type HeroSlot = {
  productId: string;
  image: string;
};

export type StudioSettings = {
  announcementType: BannerType;
  announcementText: string;
  promoCode?: string;
  vacationStartDate?: string;
  vacationEndDate?: string;
  vacationDispatchDate?: string;
  freeShippingThresholdCents: number;
  giftWrapPriceCents: number;
  /** When false, hide workshops from nav, home and public /warsztaty. */
  workshopsEnabled: boolean;
  /** Ordered photos for the home hero. Empty = automatic bestsellers. */
  heroSlots?: HeroSlot[];
  /** Homepage newsletter band — edited in admin shop settings. */
  newsletterEnabled: boolean;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterFormLabel: string;
  newsletterButtonLabel: string;
};

export type Workshop = {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  durationHours: number;
  priceInCents: number;
  maxAttendees: number;
  bookedSeats: number;
  isPublished: boolean;
  location: string;
  imageUrl: string;
};

export type BlogBlockImage = { src: string; alt: string; caption?: string };

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "formula"; text: string }
  | ({ type: "image" } & BlogBlockImage)
  | { type: "image-row"; images: [BlogBlockImage, BlogBlockImage] }
  | { type: "link"; href: string; label: string; prefix?: string };

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Plain fallback / short listing text */
  content: string;
  /** Rich body for article page */
  blocks?: BlogBlock[];
  coverImage: string;
  status: PostStatus;
  publishedAt: string;
  author?: string;
  subtitle?: string;
  category?: string;
};

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantTitle: string;
  image: string;
  unitPriceInCents: number;
  quantity: number;
  stockQuantity: number;
};

export type ShippingMethod = "inpost" | "kurier" | "odbior";

export type StoredOrderItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  quantity: number;
  unitPriceInCents: number;
};

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
};

/** In-memory / file-backed order until Supabase `orders` table is wired. */
export type StoredOrder = {
  id: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  status: OrderStatus;
  /** Set when checkout happens on a logged-in account. */
  userId?: string;
  statusHistory?: OrderStatusEvent[];
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  street: string;
  postalCode: string;
  city: string;
  shippingMethod: ShippingMethod;
  inpostLocker?: string;
  notes?: string;
  items: StoredOrderItem[];
  hasGiftWrapping: boolean;
  giftMessage?: string;
  goodsInCents: number;
  shippingCostInCents: number;
  giftWrappingCostCents: number;
  discountAmountCents: number;
  totalAmountInCents: number;
  trackingNumber?: string;
  discountCode?: string;
  /** Kept for older admin KPI code that read payload.total */
  payload: Record<string, string | number>;
};
