import { ContactDirect } from "@/components/contact/contact-direct";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Napisz do Trzy Wiatry: ${SITE.email}, tel. ${SITE.phone}, ${SITE.address}.`,
};

export default function ContactPage() {
  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-10 md:space-y-12">
        <header className="mx-auto max-w-xl space-y-3 text-center">
          <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-czerwony md:text-4xl">
            Kontakt
          </h1>
          <p className="text-base leading-relaxed text-czarny/70">
            Formularz albo bezpośrednio — e-mail, telefon, pracownia w Gdańsku.
          </p>
        </header>

        <div className="grid overflow-hidden rounded-3xl border border-czarny/8 bg-bialy/60 lg:grid-cols-2 lg:items-stretch">
          <section className="flex flex-col border-b border-czarny/8 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <h2 className="mb-7 font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
              Wypełnij formularz
            </h2>
            <ContactForm />
          </section>
          <section className="flex flex-col p-6 md:p-8 lg:p-10">
            <h2 className="mb-7 font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
              Napisz bezpośrednio
            </h2>
            <ContactDirect />
          </section>
        </div>
      </Container>
    </div>
  );
}
