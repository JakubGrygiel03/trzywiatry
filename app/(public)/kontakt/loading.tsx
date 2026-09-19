import { Container } from "@/components/ui/badge";

/** Instant shell while /kontakt (and similar CMS pages) resolve. */
export default function ContactLoading() {
  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-full bg-czarny/8" />
          <div className="h-4 max-w-md animate-pulse rounded-full bg-czarny/6" />
        </div>
        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <div className="min-h-[22rem] animate-pulse rounded-[22px] bg-czarny/5" />
          <div className="min-h-[22rem] animate-pulse rounded-[22px] bg-czarny/5" />
        </div>
      </Container>
    </div>
  );
}
