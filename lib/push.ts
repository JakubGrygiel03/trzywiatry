import "server-only";

import webpush from "web-push";
import { flushAtelierSave } from "@/lib/data/atelier-persist";
import {
  getRuntimeSettings,
  listPushSubscriptions,
  removePushSubscription,
} from "@/lib/data/runtime-store";
import { studioIdentity } from "@/lib/studio-identity";

export function vapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
}

function vapidPrivateKey() {
  return process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
}

export async function notifyAdminPush(message: { title: string; body: string; url: string; id?: string }) {
  const publicKey = vapidPublicKey();
  const privateKey = vapidPrivateKey();
  if (!publicKey || !privateKey) return;

  try {
    const who = studioIdentity(getRuntimeSettings());
    webpush.setVapidDetails(`mailto:${who.email}`, publicKey, privateKey);
    const rows = listPushSubscriptions();
    await Promise.all(
      rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            JSON.stringify(message),
          );
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            removePushSubscription(row.endpoint);
            await flushAtelierSave();
          }
        }
      }),
    );
  } catch {
    // Push must never roll back an order or inquiry.
  }
}
