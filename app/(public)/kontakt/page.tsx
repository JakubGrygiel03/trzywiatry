import { ContactDirect } from "@/components/contact/contact-direct";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/badge";
import { getContentPage } from "@/lib/data/content-pages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("kontakt");
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function ContactPage() {
  const page = await getContentPage("kontakt");

  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-10 md:space-y-12">
        <header className="mx-auto max-w-xl space-y-3 text-center">
          <h1 className="font-heading text-3xl uppercase tracking-[0.12em] text-czerwony md:text-4xl">
            {page.title}
          </h1>
          <p className="text-base leading-relaxed text-czarny/70">{page.subtitle}</p>
          {page.subtitleEn ? (
            <p className="text-sm leading-relaxed text-czarny/50" lang="en">
              {page.subtitleEn}
            </p>
          ) : null}
        </header>

        <div className="grid overflow-hidden rounded-3xl border border-czarny/8 bg-bialy lg:grid-cols-2 lg:items-stretch">
          <section className="flex flex-col border-b border-czarny/8 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <h2 className="mb-7 font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
              {page.formHeading}
            </h2>
            <ContactForm intro={page.formIntro} />
          </section>
          <section className="flex flex-col p-6 md:p-8 lg:p-10">
            <h2 className="mb-7 font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
              {page.directHeading}
            </h2>
            <ContactDirect />
          </section>
        </div>
      </Container>
    </div>
  );
}
