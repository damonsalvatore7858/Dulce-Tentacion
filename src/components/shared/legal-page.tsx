import { PageHeader } from "@/components/shared/page-header";

type Props = { title: string; sections: { h: string; p: string }[] };

export function LegalPage({ title, sections }: Props) {
  return (
    <>
      <PageHeader title={title} />
      <div className="page-container flex max-w-3xl flex-col gap-6 pb-16">
        {sections.map((section) => (
          <section key={section.h} className="flex flex-col gap-2">
            <h2 className="font-display text-2xl">{section.h}</h2>
            <p className="text-muted-foreground">{section.p}</p>
          </section>
        ))}
      </div>
    </>
  );
}
