import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/badge";
import { getSettings } from "@/lib/data/queries";
import { interpolatePromoCode } from "@/lib/data/settings";

export function NewsletterCta() {
  const settings = getSettings();
  if (!settings.newsletterEnabled) return null;

  return (
    <section className="relative overflow-hidden bg-czerwony py-6 md:py-7">
      {/* Full-bleed tile: one grid from the midpoint, repeating to the right edge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url(/brand/patterns/tile-split.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "110px 110px",
          backgroundPosition: "50% 50%",
          opacity: 0.28,
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 50%, black 64%)",
          maskImage: "linear-gradient(to right, transparent 0%, transparent 50%, black 64%)",
        }}
        aria-hidden
      />
      <Container className="relative">
        <Reveal>
          <div className="text-bialy">
            <div className="grid gap-4 px-5 py-3 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-8 md:px-6 md:py-4">
              <div className="max-w-xl space-y-1.5">
                <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">
                  {settings.newsletterEyebrow}
                </p>
                <h2 className="font-heading text-xl uppercase leading-snug tracking-[0.06em] text-bialy md:text-2xl">
                  {settings.newsletterTitle}
                </h2>
                <p className="text-sm leading-relaxed text-bialy md:text-base">
                  {interpolatePromoCode(settings.newsletterBody, settings.promoCode)}
                </p>
              </div>
              <div className="rounded-xl bg-bialy p-3 text-czarny shadow-sm md:p-3.5">
                <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                  {settings.newsletterFormLabel}
                </p>
                <NewsletterForm tone="light" buttonLabel={settings.newsletterButtonLabel} />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
