import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/dictionaries";

// 404 diseñado. Muestra español (principal) e inglés porque aquí no se conoce el idioma.
export default function NotFound() {
  const es = getDictionary("es").notFound;
  const en = getDictionary("en").notFound;

  return (
    <section className="page-container section-y flex flex-col items-center gap-4 text-center">
      <p className="font-display text-7xl text-primary text-neon">404</p>
      <h1 className="font-display text-3xl">{es.title}</h1>
      <p className="text-muted-foreground">{es.text}</p>
      <p lang="en" className="text-sm text-muted-foreground">
        {en.title}. {en.text}
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">{es.back}</Link>
      </Button>
    </section>
  );
}
