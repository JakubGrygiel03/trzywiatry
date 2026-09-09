import { brandAppIcon } from "@/lib/brand-app-icon";

export async function GET() {
  return brandAppIcon(192);
}
