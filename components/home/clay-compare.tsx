import { BeforeAfterSlider } from "@/components/visual/before-after-slider";
import { HomeSection } from "@/components/home/home-section";
import type { ComparePayload } from "@/lib/cms/home-layout";

export function ClayCompare({ payload }: { payload: ComparePayload }) {
  const pairs = payload.pairs.filter((pair) => pair.before && pair.after);
  if (pairs.length === 0) return null;

  return (
    <HomeSection>
      <div className="space-y-6">
        <div className="max-w-xl space-y-2">
          {payload.eyebrow ? (
            <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-czerwony">{payload.eyebrow}</p>
          ) : null}
          <h2 className="font-heading text-2xl uppercase tracking-[0.08em] text-czarny md:text-3xl">{payload.title}</h2>
          {payload.description ? (
            <p className="text-sm leading-relaxed text-czarny/60 md:text-base">{payload.description}</p>
          ) : null}
        </div>
        <div className={`grid gap-6 ${pairs.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}>
          {pairs.map((pair) => (
            <BeforeAfterSlider
              key={pair.id}
              before={pair.before}
              after={pair.after}
              title={pair.title}
              beforeLabel={pair.beforeLabel}
              afterLabel={pair.afterLabel}
            />
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
