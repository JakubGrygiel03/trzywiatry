import { brandShareCard } from "@/lib/brand-app-icon";

export const alt = "Trzy Wiatry — sygnet domu i trzech wiatrów";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return brandShareCard();
}
