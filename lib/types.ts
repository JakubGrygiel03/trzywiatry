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
  /** Explicit shop hub — falls back to domain when missing (legacy seed). */
  shopLane?: "uzytkowa" | "pracownia";
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
  /** ISO time of the last admin shop-settings save — used to merge isolates. */
  settingsUpdatedAt?: string;
  /** When false, hide workshops from nav, home and public /warsztaty. */
  workshopsEnabled: boolean;
  /** Ordered photos for the home hero. Empty = automatic bestsellers. */
  heroSlots?: HeroSlot[];
  /** Cover photos for the /sklep two-lane hub. */
  shopHubUzytkowaImage: string;
  shopHubPracowniaImage: string;
  /** When false, the hub tile is dimmed and the catalog is closed to customers. */
  shopLaneUzytkowaEnabled: boolean;
  shopLanePracowniaEnabled: boolean;
  /** Homepage newsletter band — edited in admin shop settings. */
  newsletterEnabled: boolean;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterFormLabel: string;
  newsletterButtonLabel: string;
  /** Homepage overlay “Nowa strona pracowni”. Off by default — shop is live. */
  launchNoticeEnabled: boolean;
  /** Closes the storefront for visitors; testers use the preview cookie. */
  maintenanceMode: boolean;
  /** Opaque token for /podglad/[token] — rotate from admin to revoke access. */
  maintenancePreviewToken: string;
  /** Checkout carriers — prices in grosze. Missing = seed InPost/kurier. */
  shippingMethods?: ShippingMethodDef[];
  /** Public atelier identity — missing fields fall back to SITE. */
  studioEmail?: string;
  studioPhone?: string;
  studioAddress?: string;
  studioNip?: string;
  studioBankAccount?: string;
  studioInstagram?: string;
  studioFacebook?: string;
  studioOwner?: string;
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
  | { type: "paragraph"; text: string; align?: "left" | "center" }
  | { type: "heading"; text: string; align?: "left" | "center" }
  | { type: "list"; items: string[]; ordered?: boolean }
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
export type CheckoutShippingMethod = ShippingMethod;

export type ShippingMethodDef = {
  id: ShippingMethod;
  label: string;
  priceInCents: number;
  enabled: boolean;
  hint: string;
};

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

/** Marketing list row — consent timestamp kept for RODO. */
export type NewsletterSubscriber = {
  email: string;
  createdAt: string;
  source: string;
  consentMarketing: boolean;
  consentAt?: string;
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
  /** Set after the welcome/code email actually went out — never send twice. */
  welcomeSentAt?: string;
  /** Last welcome send failed; next signup click may retry once. */
  welcomeSendFailed?: boolean;
};

export type ShopCoupon = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  /** Percent 1–100 or amount in grosze. */
  value: number;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  oncePerEmail: boolean;
  enabled: boolean;
  minGoodsCents?: number;
};

export type CouponRedemption = {
  couponId: string;
  email: string;
  orderId: string;
  at: string;
};

export type SlugRedirect = {
  from: string;
  to: string;
  kind: "product" | "blog" | "collection";
};

export type CustomerNote = {
  email: string;
  note: string;
  updatedAt: string;
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
  /** Invoice / billing — set when the customer asked for a company invoice. */
  companyName?: string;
  nip?: string;
  /** Parcel destination when different from `street` (courier only). */
  shippingStreet?: string;
  shippingPostalCode?: string;
  shippingCity?: string;
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
