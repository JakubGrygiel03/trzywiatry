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
  /** Structured options — colour / capacity like fobe.eu, optional image per glaze. */
  color?: string;
  colorHex?: string;
  capacityMl?: number;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  /** One-sentence teaser next to the price. Full copy stays in `description`. */
  shortDescription?: string;
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
  /** When false, hide gift wrap in cart and never charge it at checkout. */
  giftWrapEnabled: boolean;
  /** When false, hide workshops from nav, home and public /warsztaty. */
  workshopsEnabled: boolean;
  /** Ordered photos for the home hero. Empty = automatic bestsellers. */
  heroSlots?: HeroSlot[];
  /** Cover photos for the /sklep two-lane hub. */
  shopHubUzytkowaImage: string;
  shopHubPracowniaImage: string;
  /** Homepage newsletter band — edited in admin shop settings. */
  newsletterEnabled: boolean;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterFormLabel: string;
  newsletterButtonLabel: string;
  /** Closes the storefront for visitors; testers use the preview cookie. */
  maintenanceMode: boolean;
  /** Opaque token for /podglad/[token] — rotate from admin to revoke access. */
  maintenancePreviewToken: string;
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
  /** Mat behind the cover on /blog tiles (brand neutrals). */
  coverBackdrop?: "bialy" | "krem" | "krem-ciemny";
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
/** Methods selectable in checkout — personal pickup withdrawn. */
export type CheckoutShippingMethod = "inpost" | "kurier";

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

/** One-time −15% code minted on newsletter signup (format TW-XXXXXX). */
export type NewsletterCoupon = {
  id: string;
  code: string;
  email: string;
  createdAt: string;
  isUsed: boolean;
  usedAt?: string;
  usedOrderId?: string;
  /** Holds the code on a pending checkout until paid or cancelled. */
  reservedOrderId?: string;
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
  /** How the customer is expected to pay / did pay. */
  paymentProvider?: "p24" | "manual" | "none";
  /** P24 transaction orderId from webhook. */
  paymentId?: string;
  /** Last sessionId sent to P24 (order number or retry suffix). */
  p24SessionId?: string;
  /** P24 methodId from status notification (BLIK, card, bank…). */
  paymentMethodId?: number;
  /** Human label cached at webhook time. */
  paymentMethodLabel?: string;
  /** ISO timestamp when status first became paid. */
  paidAt?: string;
  /** Kept for older admin KPI code that read payload.total */
  payload: Record<string, string | number>;
};
