import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";
import { RATE, rateLimitRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/same-origin";

type Gate = "read" | "write" | "upload";

/** Session + same-origin + flood cap for /api/admin/*. */
export async function rejectUnlessAdminApi(request: Request, gate: Gate = "write") {
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = gate === "upload" ? RATE.upload.limit : gate === "read" ? 80 : 40;
  const windowMs = gate === "upload" ? RATE.upload.windowMs : 60_000;
  if (!rateLimitRequest(request, `admin:${gate}`, limit, windowMs)) {
    return Response.json({ error: "Zbyt dużo zapytań. Poczekaj chwilę." }, { status: 429 });
  }
  return null;
}
