import { Container } from "@/components/ui/badge";

export default function AboutLoading() {
  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-full bg-czarny/8" />
        <div className="h-4 max-w-lg animate-pulse rounded-full bg-czarny/6" />
        <div className="min-h-[28rem] animate-pulse rounded-[22px] bg-czarny/5" />
      </Container>
    </div>
  );
}
