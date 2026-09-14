import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/badge";
import type { NewsletterPayload } from "@/lib/cms/home-layout";
import { getSettings } from "@/lib/data/queries";
import { interpolateStudioCopy } from "@/lib/data/settings";

export function NewsletterCta({ payload }: { payload?: NewsletterPayload }) {
  const settings = getSettings();
  const copy = payload ?? {
    eyebrow: settings.newsletterEyebrow,
    title: settings.newsletterTitle,
    body: settings.newsletterBody,
    formLabel: settings.newsletterFormLabel,
    buttonLabel: settings.newsletterButtonLabel,
  };

  if (!payload && !settings.newsletterEnabled) return null;

  return (
    <section className="py-4 md:py-5">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-czerwony shadow-[0_18px_48px_-36px_rgb(1_1_1_/_0.45)]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "url(/brand/wzory/b.png)",
              backgroundRepeat: "repeat",
              backgroundSize: "280px auto",
              backgroundPosition: "50% 50%",
              opacity: 0.28,
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 50%, black 64%)",
              maskImage: "linear-gradient(to right, transparent 0%, transparent 50%, black 64%)",
            }}
            aria-hidden
          />
          <Reveal>
            <div className="relative text-bialy">
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-8 md:px-7 md:py-6">
                <div className="max-w-xl space-y-1.5">
                  <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">{copy.eyebrow}</p>
                  <h2 className="font-heading text-xl uppercase leading-snug tracking-[0.06em] text-bialy md:text-2xl">
                    {copy.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-bialy md:text-base">
                    {interpolateStudioCopy(copy.body, settings)}
                  </p>
                </div>
                <div className="rounded-2xl bg-krem px-3.5 py-3.5 text-czarny shadow-sm md:px-4 md:py-4">
                  <p className="mb-2 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                    {copy.formLabel}
                  </p>
                  <NewsletterForm tone="light" buttonLabel={copy.buttonLabel} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
