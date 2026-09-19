"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { defaultBannerPayload, type BannerPayload } from "@/lib/cms/home-layout";
import { scrollElementBelowChrome } from "@/lib/scroll-chrome";
import { cn } from "@/lib/utils";

function scrollToMore(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : "hero-atelier";
  const el = document.getElementById(id) ?? document.getElementById("hero-atelier");
  if (!el) return;
  scrollElementBelowChrome(el, "smooth");
}

function resolvePanels(payload: BannerPayload & { image?: string }): [string, string, string] {
  const defaults = defaultBannerPayload().panels;
  if (Array.isArray(payload.panels) && payload.panels.length === 3) {
    return [
      payload.panels[0]?.trim() || defaults[0],
      payload.panels[1]?.trim() || defaults[1],
      payload.panels[2]?.trim() || defaults[2],
    ];
  }
  const legacy = payload.image?.trim();
  if (legacy) return [legacy, legacy, legacy];
  return defaults;
}

function resolveMobilePanel(value: unknown): 0 | 1 | 2 {
  if (value === 0 || value === 1 || value === 2) return value;
  return 1;
}

function resolveTabletPanels(value: unknown): [0 | 1 | 2, 0 | 1 | 2] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    (value[0] === 0 || value[0] === 1 || value[0] === 2) &&
    (value[1] === 0 || value[1] === 1 || value[1] === 2)
  ) {
    return [value[0], value[1]];
  }
  return [0, 2];
}

function isFineHoverDevice() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Scrim lives inside each cell so white grid gaps stay visible. */
function BannerPanel({
  src,
  sizes,
  priority,
}: {
  src: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden bg-bialy">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        className="object-cover object-center transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/banner:scale-[1.03] group-[.is-revealed]/banner:scale-[1.03]"
        sizes={sizes}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-czarny transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          "opacity-[var(--banner-veil-rest)]",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover/banner:opacity-[var(--banner-veil)]",
          "group-[.is-revealed]/banner:opacity-[var(--banner-veil)]",
        )}
        aria-hidden
      />
    </div>
  );
}

/**
 * Phone (<768): 1 · Tablet/laptop (<1400): 2 · Wide desktop (≥1400): 3.
 * Copy: hover on desktop, tap-to-reveal on phone/tablet.
 */
export function HomeBanner({ payload }: { payload: BannerPayload }) {
  const [revealed, setRevealed] = useState(false);
  const panels = resolvePanels(payload);
  const mobilePanel = resolveMobilePanel(payload.mobilePanel);
  const tabletPanels = resolveTabletPanels(payload.tabletPanels);
  const mobileSrc = panels[mobilePanel];
  const tabletSrcs = [panels[tabletPanels[0]], panels[tabletPanels[1]]] as const;
  const light = (payload.textColor ?? "bialy") === "bialy";
  const overlay = Math.min(80, Math.max(0, payload.overlayOpacity ?? 32)) / 100;
  const vh = payload.minHeightVh ?? 100;
  const useResponsiveStrip = vh >= 95;
  const stageHeight = useResponsiveStrip
    ? "var(--banner-stage)"
    : `${Math.max(28, Math.min(100, vh))}vh`;
  const gap = Math.min(24, Math.max(0, payload.panelGap ?? 10));
  const inset = Math.min(12, Math.max(0, payload.panelInset ?? 0));
  const textAlign = payload.textAlign ?? "center";
  const seeMoreHref = payload.ctaHref?.startsWith("#") ? payload.ctaHref : "#hero-atelier";
  const seeMoreLabel = (payload.ctaLabel ?? "").trim() || "Zobacz więcej";
  const title = payload.title?.trim() || "Trzy Wiatry";
  const eyebrow = payload.eyebrow?.trim() ?? "";
  const subtitle = payload.subtitle?.trim() ?? "";

  function onBannerActivate() {
    if (isFineHoverDevice()) return;
    setRevealed((open) => !open);
  }

  return (
    <section
      className={cn(
        "home-banner group/banner relative flex w-full cursor-pointer items-center justify-center overflow-hidden bg-bialy min-[1400px]:cursor-default",
        revealed && "is-revealed",
      )}
      style={
        {
          marginTop: payload.marginTop ?? 0,
          marginBottom: payload.marginBottom ?? 0,
          height: stageHeight,
          minHeight: stageHeight,
          padding: inset,
          "--banner-veil": String(overlay),
          "--banner-veil-rest": String(Math.max(0.08, overlay * 0.35)),
        } as CSSProperties
      }
      onClick={onBannerActivate}
      role="presentation"
    >
      <div
        className="home-banner__strip"
        style={
          useResponsiveStrip
            ? undefined
            : ({ height: "100%", ["--banner-strip" as string]: "100%" } as CSSProperties)
        }
      >
        <div className="absolute inset-0 block md:hidden" aria-hidden>
          <BannerPanel src={mobileSrc} sizes="100vw" priority />
        </div>

        <div
          className="absolute inset-0 hidden grid-cols-2 bg-bialy md:grid min-[1400px]:hidden"
          style={{ gap: `${gap}px` }}
          aria-hidden
        >
          {tabletSrcs.map((src, index) => (
            <BannerPanel
              key={`tablet-${tabletPanels[index]}-${src}`}
              src={src}
              sizes="50vw"
              priority={index === 0}
            />
          ))}
        </div>

        <div
          className="absolute inset-0 hidden grid-cols-3 bg-bialy min-[1400px]:grid"
          style={{ gap: `${gap}px` }}
          aria-hidden
        >
          {panels.map((src, index) => (
            <BannerPanel
              key={`${src}-${index}`}
              src={src}
              sizes="33vw"
              priority={index === mobilePanel}
            />
          ))}
        </div>

        <div
          className="home-banner__copy absolute inset-0 z-10 grid place-items-center"
          style={{
            paddingLeft: payload.contentPaddingX ?? 28,
            paddingRight: payload.contentPaddingX ?? 28,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          <div
            className={cn(
              "w-full max-w-2xl",
              textAlign === "center" && "text-center",
              textAlign === "left" && "text-left",
              textAlign === "right" && "ml-auto text-right",
            )}
          >
            {eyebrow ? (
              <p
                className={cn(
                  "home-banner__copy-line home-banner__copy-line--1 font-heading text-[10px] uppercase tracking-[0.28em] sm:text-[11px]",
                  light ? "text-bialy/80" : "text-czarny/70",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <p
              className={cn(
                "home-banner__copy-line home-banner__copy-line--2 mt-3 font-heading text-[clamp(1.85rem,5.5vw,3.5rem)] uppercase leading-[1.05] tracking-[0.06em]",
                light ? "text-bialy" : "text-czarny",
              )}
            >
              {title}
            </p>
            {subtitle ? (
              <p
                className={cn(
                  "home-banner__copy-line home-banner__copy-line--3 mt-4 max-w-lg text-[15px] leading-[1.7] sm:text-base",
                  light ? "text-bialy/85" : "text-czarny/75",
                  textAlign === "center" && "mx-auto",
                  textAlign === "right" && "ml-auto",
                )}
              >
                {subtitle}
              </p>
            ) : null}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                scrollToMore(seeMoreHref);
              }}
              className={cn(
                "home-banner__copy-line home-banner__copy-line--4 mt-7 inline-flex h-11 items-center justify-center rounded-full px-7 font-heading text-[11px] uppercase tracking-[0.2em] transition-colors",
                light
                  ? "bg-bialy text-czarny hover:bg-krem"
                  : "bg-czarny text-bialy hover:bg-czerwony",
              )}
            >
              {seeMoreLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
