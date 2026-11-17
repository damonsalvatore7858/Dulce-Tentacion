"use client";

import { ExternalLink, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import { parseVideoUrl, publicVideoUrl } from "@/lib/media/video";

type Props = {
  videoUrl: string;
  posterUrl?: string | null;
  title?: string;
  className?: string;
  aspect?: "video" | "reel";
};

export function ProductVideoPlayer({
  videoUrl,
  posterUrl,
  title = "Video del producto",
  className = "",
  aspect = "video",
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const resolvedSrc = publicVideoUrl(videoUrl);
  const parsed = parseVideoUrl(resolvedSrc);

  if (!parsed || !resolvedSrc) return null;

  const aspectClass = aspect === "reel" ? "aspect-[9/16]" : "aspect-video";

  // 1. YouTube o YouTube Shorts: fachada de carga diferida
  if (parsed.type === "youtube" && parsed.embedUrl) {
    if (!hasStarted) {
      return (
        <div
          onClick={() => setHasStarted(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setHasStarted(true);
            }
          }}
          className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-black ${aspectClass} ${className}`}
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
          <div className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-6 fill-current pl-0.5" />
          </div>
          <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
            ▶ Ver video
          </span>
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-black ${aspectClass} ${className}`}>
        <iframe
          src={`${parsed.embedUrl}&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  // 2. Instagram o TikTok: enlace directo con preview
  if (parsed.type === "instagram" || parsed.type === "tiktok") {
    return (
      <a
        href={parsed.src}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative flex items-center justify-center overflow-hidden rounded-2xl bg-black ${aspectClass} ${className}`}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-75"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />
        <div className="relative flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform group-hover:scale-110">
            <ExternalLink className="size-5" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-sm">
            Ver en {parsed.type === "instagram" ? "Instagram" : "TikTok"}
          </span>
        </div>
      </a>
    );
  }

  // 3. Video HTML5 directo (MP4 / WebM / Supabase Storage)
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePlay();
        }
      }}
      className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-black ${aspectClass} ${className}`}
    >
      <video
        ref={videoRef}
        src={resolvedSrc}
        poster={posterUrl ?? undefined}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-cover"
      />

      {/* Botón de reproducción superpuesto cuando está pausado */}
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-6 fill-current pl-0.5" />
          </div>
        </div>
      ) : null}

      {/* Control de sonido cuando está reproduciendo */}
      {hasStarted ? (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110"
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
