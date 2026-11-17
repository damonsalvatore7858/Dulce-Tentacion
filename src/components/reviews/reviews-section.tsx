"use client";

import { CheckCircle2, ExternalLink, MapPin, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { REVIEWS_SUMMARY, VERIFIED_REVIEWS } from "@/lib/data/reviews-defaults";

type Props = {
  initialSedeSlug?: "belen" | "ambala";
  showBranchFilter?: boolean;
  belenMapsUrl?: string | null;
  ambalaMapsUrl?: string | null;
};

export function ReviewsSection({
  initialSedeSlug,
  showBranchFilter = true,
  belenMapsUrl = "https://maps.google.com/?q=Dulce+Tentacion+y+algo+mas+Belen+Ibague",
  ambalaMapsUrl = "https://maps.google.com/?q=Dulce+Tentacion+y+algo+mas+Ambala+Ibague",
}: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "belen" | "ambala">(
    initialSedeSlug ?? "all",
  );

  const filteredReviews =
    activeFilter === "all"
      ? VERIFIED_REVIEWS
      : VERIFIED_REVIEWS.filter((r) => r.sedeSlug === activeFilter);

  return (
    <section aria-labelledby="reviews-title" className="flex flex-col gap-8 py-8 sm:py-12">
      {/* Encabezado */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-accent-foreground uppercase tracking-wider">
          <Star className="size-3.5 fill-current text-accent-foreground" />
          Experiencias reales
        </span>
        <h2 id="reviews-title" className="font-display text-3xl sm:text-4xl text-foreground">
          Lo que dicen nuestros clientes
        </h2>
        <p className="max-w-xl text-sm sm:text-base text-muted-foreground">
          Opiniones verificadas de quienes disfrutan de nuestros helados, waffles y postres en Ibagué.
        </p>

        {/* Resumen de Calificación */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card px-5 py-3 shadow-soft">
          <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-foreground">
            <span>{REVIEWS_SUMMARY.calificacionPromedio}</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Promedio en Google y plataformas locales ({REVIEWS_SUMMARY.totalResenas}+ opiniones)
          </span>
        </div>
      </div>

      {/* Filtros de sede (si corresponde) */}
      {showBranchFilter ? (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Todas las sedes ({VERIFIED_REVIEWS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("belen")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
              activeFilter === "belen"
                ? "bg-primary text-primary-foreground shadow-xs scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Sede Belén
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("ambala")}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
              activeFilter === "ambala"
                ? "bg-primary text-primary-foreground shadow-xs scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Sede Ambalá
          </button>
        </div>
      ) : null}

      {/* Grid de Reseñas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.map((review) => (
          <article
            key={review.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/30"
          >
            {/* Cabecera de la reseña */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                    {review.avatarInicial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-tight">
                      {review.autor}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Visita verificada
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
                  <MapPin className="size-3 text-primary" />
                  {review.sedeNombre}
                </span>
              </div>

              {/* Estrellas */}
              <div className="flex text-amber-500">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>

              {/* Comentario */}
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{review.comentario}&rdquo;
              </p>
            </div>

            {/* Fecha relativa */}
            <div className="pt-2 border-t border-border/40 text-[0.75rem] text-muted-foreground/70">
              {review.fecha}
            </div>
          </article>
        ))}
      </div>

      {/* Llamado a la acción: Dejar reseña en Google Maps */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/80 bg-linear-to-r from-brand-pastel/30 via-card to-accent/15 p-6 text-center sm:flex-row sm:text-left shadow-soft">
        <div className="flex flex-col gap-1 max-w-xl">
          <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
            <MessageSquare className="size-3.5" />
            Tu opinión es muy valiosa
          </span>
          <h3 className="font-display text-xl sm:text-2xl text-foreground">
            ¿Nos visitaste recientemente en Ibagué?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comparte tu experiencia en Google Maps y ayúdanos a seguir endulzando los mejores momentos de la ciudad.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          {belenMapsUrl ? (
            <a
              href={belenMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border px-3.5 py-2 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
            >
              Calificar Sede Belén
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          ) : null}

          {ambalaMapsUrl ? (
            <a
              href={ambalaMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border px-3.5 py-2 text-xs font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
            >
              Calificar Sede Ambalá
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
