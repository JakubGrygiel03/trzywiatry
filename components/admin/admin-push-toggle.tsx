"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function AdminPushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function enable() {
    setMessage("");
    setBusy(true);
    try {
      if (!vapidPublicKey) {
        setMessage("Brak kluczy VAPID na serwerze.");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setMessage("Na iPhonie dodaj stronę do ekranu początkowego i włącz powiadomienia z tej ikony.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Powiadomienia są wyłączone w ustawieniach przeglądarki.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await registration.update();
      const ready = await navigator.serviceWorker.ready;
      const subscription = await ready.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const response = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(subscription.toJSON()),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(
        response.ok
          ? "Powiadomienia są włączone na tym telefonie."
          : payload?.error || "Nie udało się włączyć powiadomień.",
      );
    } catch {
      setMessage("Nie udało się włączyć powiadomień. Odśwież panel i spróbuj jeszcze raz.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/10 bg-bialy px-3 py-1.5 text-xs font-medium text-czarny/75 transition hover:border-czerwony/30 hover:text-czerwony disabled:opacity-50"
      >
        <Bell className="h-3.5 w-3.5" />
        {busy ? "Włączam…" : "Powiadomienia"}
      </button>
      {message ? <p className="max-w-[14rem] text-right text-[11px] leading-snug text-czarny/50">{message}</p> : null}
    </div>
  );
}
