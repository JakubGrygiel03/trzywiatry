import { Container } from "@/components/ui/badge";

/** Shared instant shell while a public route resolves. */
export function PublicRouteLoading({ cards = 1 }: { cards?: number }) {
  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-czarny/8" />
          <div className="h-8 w-48 animate-pulse rounded-full bg-czarny/10" />
        </div>
        <div className={cards > 1 ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>
          {Array.from({ length: cards }, (_, index) => (
            <div key={index} className="min-h-[14rem] animate-pulse rounded-[22px] bg-czarny/5" />
          ))}
        </div>
      </Container>
    </div>
  );
}
