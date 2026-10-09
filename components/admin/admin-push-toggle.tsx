"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function AdminPushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    let cancelled = false;
    void navigator.serviceWorker.ready
      .then((ready) => ready.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setEnabled(Boolean(subscription));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

  async function enable() {
    if (enabled || busy) return;
    setError("");
    setBusy(true);
    try {
      if (!vapidPublicKey) {
        setError("Brak kluczy na serwerze.");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setError("Dodaj stronę do ekranu początkowego.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Zgoda jest wyłączona w przeglądarce.");
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
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || "Nie udało się włączyć.");
        return;
      }
      setEnabled(true);
    } catch {
      setError("Odśwież panel i spróbuj jeszcze raz.");
    } finally {
      setBusy(false);
    }
  }

  const label = enabled ? "Powiadomienia włączone na tym telefonie" : "Włącz powiadomienia na tym telefonie";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy || enabled}
        title={label}
        aria-label={label}
        aria-pressed={enabled}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-czarny/10 bg-bialy text-czarny/75 transition hover:border-czerwony/30 hover:text-czerwony disabled:opacity-80"
      >
        <Bell className="h-4 w-4" />
        <span
          className={cn(
            "absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-bialy",
            enabled ? "bg-emerald-600" : "bg-czerwony",
          )}
          aria-hidden
        />
      </button>
      {error ? (
        <p className="absolute right-0 top-full z-40 mt-1 w-max max-w-[12rem] rounded-md bg-czarny px-2 py-1 text-[11px] leading-snug text-bialy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
