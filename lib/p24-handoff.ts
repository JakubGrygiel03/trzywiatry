"use client";

import { useSyncExternalStore } from "react";

const KEY = "tw-p24-handoff";

let active = false;
const listeners = new Set<() => void>();

function readStored() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

/** True while we are leaving for Przelewy24 — never render “koszyk pusty”. */
export function isP24Handoff() {
  return active || (typeof window !== "undefined" && readStored());
}

export function beginP24Handoff() {
  active = true;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode */
  }
  notify();
}

export function endP24Handoff() {
  active = false;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  notify();
}

export function goToP24(url: string) {
  beginP24Handoff();
  window.location.assign(url);
}

export function useP24Handoff() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    isP24Handoff,
    () => false,
  );
}

if (typeof window !== "undefined") {
  active = readStored();
  // Back-forward cache only — a generic pageshow would hide the overlay mid-redirect.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) endP24Handoff();
  });
}
