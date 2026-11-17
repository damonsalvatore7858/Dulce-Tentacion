import { ArrowRight, Film, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProductVideoPlayer } from "@/components/media/product-video-player";
import { Button } from "@/components/ui/button";
import { href, type Locale } from "@/i18n/config";

export type ShowcaseVideo = {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  posterUrl?: string | null;
  targetHref: string;
};

type Props = {
  lang: Locale;
  videos?: ShowcaseVideo[];
};

const DEFAULT_SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: "video-1",
    title: "Waffles recién horneados",
    subtitle: "Crocantes por fuera, suaves por dentro, con frutas frescas y helado cremoso.",
    videoUrl: "https://www.youtube.com/shorts/kJQP7kiw5Fk",
    posterUrl: "/brand/logo.jpg",
    targetHref: "/carta",
  },
  {
    id: "video-2",
    title: "Cholados tradicionales",
    subtitle: "Hielo finamente raspado, frutas tropicales, lechera artesanal y copa de helado.",
    videoUrl: "https://www.youtube.com/shorts/L_LUpnjgPso",
    posterUrl: "/brand/logo.jpg",
    targetHref: "/carta",
  },
];

export function VideoShowcase({ lang, videos = DEFAULT_SHOWCASE_VIDEOS }: Props) {
  if (videos.length === 0) return null;

  return (
    <section aria-labelledby="video-showcase-title" className="page-container flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          <Film className="size-3.5" />
          En video &middot; Antojos Dulces
        </span>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 id="video-showcase-title" className="font-display text-3xl sm:text-4xl text-foreground">
              Mira cómo preparamos tu antojo
            </h2>
            <p className="text-sm text-muted-foreground">
              Videos cortos y tentadores de nuestros postres y especialidades artesanales.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto font-bold">
            <Link href={href(lang, "/carta")}>
              Ver carta completa
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl">
        {videos.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-lift"
          >
            <ProductVideoPlayer
              videoUrl={item.videoUrl}
              posterUrl={item.posterUrl}
              title={item.title}
              aspect="video"
              className="w-full shadow-sm"
            />

            <div className="flex flex-1 flex-col justify-between gap-3 pt-4">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-accent-foreground uppercase tracking-wider">
                  <Sparkles className="size-3 text-accent" />
                  Especialidad
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-2">
                <Button asChild size="sm" className="w-full font-bold shadow-2xs">
                  <Link href={href(lang, item.targetHref)}>
                    Pedir por WhatsApp
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
