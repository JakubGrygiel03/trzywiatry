import Image from "next/image";
import { WorksGallery } from "@/components/about/works-gallery";
import { Container } from "@/components/ui/badge";
import { aboutGalleryWorks } from "@/lib/data/gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nas",
  description:
    "Trzy Wiatry — rodzinna pracownia. Papa Marian, Jędrek i Tusia. Galeria prac z gliny i drewna.",
};

export default function AboutPage() {
  return (
    <div className="pb-16 md:pb-20">
      <Container className="space-y-10 py-12 md:space-y-12 md:py-16">
        <h1 className="text-center font-heading text-3xl uppercase tracking-[0.1em] text-czerwony md:text-4xl lg:text-5xl">
          Skąd to wszystko powstało?
        </h1>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-krem-ciemny">
            <Image
              src="/brand/photos/o-nas-rodzina.jpg"
              alt="Tusia, Papa Marian i Jędrek — rodzinna pracownia Trzy Wiatry"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-6 md:pt-2">
            <h2 className="font-heading text-xl uppercase tracking-[0.14em] text-czarny md:text-2xl">
              Nasza historia
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-czarny/80 md:text-[17px] md:leading-[1.75]">
              <p>
                Trzy Wiatry to nasza rodzinna pracownia, która zrodziła się z pasji do toczenia w glinie i
                w drewnie. Mieści się w naszym domu, w którym niemal zawsze wieje z trzech stron — stąd
                właśnie wzięła się jej nazwa.
              </p>
              <p>
                Tworzymy razem, we trójkę: Papa Marian — od zawsze zafascynowany drewnem i jego
                możliwościami, oraz Jędrek i Tusia — od kilku lat zakochani w glinie i w tym, co można z
                niej wyczarować.
              </p>
              <p>
                Uwielbiamy eksperymentować, uczyć się nowych rzeczy i dzielić się tym, co tworzymy. Nasza
                pracownia to miejsce, gdzie spotykają się pasja, rzemiosło i rodzinne ciepło.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <section className="border-t border-szary bg-bialy py-12 md:py-16">
        <Container className="space-y-8">
          <h2 className="text-center font-heading text-2xl uppercase tracking-[0.12em] text-czerwony md:text-3xl">
            Galeria naszych prac
          </h2>
          <WorksGallery works={aboutGalleryWorks} />
        </Container>
      </section>
    </div>
  );
}
