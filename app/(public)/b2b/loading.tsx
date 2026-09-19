import { Container } from "@/components/ui/badge";

export default function B2bLoading() {
  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <div className="h-8 w-32 animate-pulse rounded-full bg-czarny/8" />
        <div className="h-4 max-w-md animate-pulse rounded-full bg-czarny/6" />
        <div className="min-h-[24rem] animate-pulse rounded-[22px] bg-czarny/5" />
      </Container>
    </div>
  );
}
