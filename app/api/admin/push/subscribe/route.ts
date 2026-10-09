import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { upsertPushSubscription } from "@/lib/data/runtime-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

export async function POST(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "write");
  if (denied) return denied;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Telefon nie przekazał danych powiadomień." }, { status: 400 });
  }

  await ensureAtelierHydrated({ force: true });
  upsertPushSubscription({
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
  });
  await flushAtelierSave();
  return NextResponse.json({ ok: true });
}
