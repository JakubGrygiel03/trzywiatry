import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AtelierFrame } from "@/components/visual/atelier-frame";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <div className="w-48">
        <AtelierFrame kind="bowl" glaze="mist" className="aspect-square min-h-48" />
      </div>
      <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">404</p>
      <h1 className="font-heading text-3xl uppercase tracking-[0.08em]">Tego naczynia nie ma na półce</h1>
      <p className="max-w-md text-sm text-czarny/60">
        Strona mogła zejść po wypale albo adres rozmył się jak szkliwo Mist.
      </p>
      <Button asChild>
        <Link href="/sklep">Wróć do sklepu</Link>
      </Button>
    </div>
  );
}
