export const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB

export type VideoType = "direct" | "youtube" | "instagram" | "tiktok" | "other";

export type ParsedVideo = {
  type: VideoType;
  src: string;
  embedUrl?: string;
  isDirectFile: boolean;
};

// Valida si un archivo es un video MP4 o WebM
export function isValidVideoFile(file: File): boolean {
  const allowed = ["video/mp4", "video/webm"];
  return allowed.includes(file.type);
}

// Analiza una URL de video (directo, YouTube Shorts, Instagram o TikTok)
export function parseVideoUrl(url: string | null | undefined): ParsedVideo | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube o YouTube Shorts
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ??
    trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytMatch?.[1]) {
    const id = ytMatch[1];
    return {
      type: "youtube",
      src: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`,
      isDirectFile: false,
    };
  }

  // 2. Instagram Reel o Post
  if (trimmed.includes("instagram.com/reel/") || trimmed.includes("instagram.com/p/")) {
    const cleanUrl = trimmed.split("?")[0].replace(/\/+$/, "");
    return {
      type: "instagram",
      src: trimmed,
      embedUrl: `${cleanUrl}/embed`,
      isDirectFile: false,
    };
  }

  // 3. TikTok
  if (trimmed.includes("tiktok.com/")) {
    return {
      type: "tiktok",
      src: trimmed,
      isDirectFile: false,
    };
  }

  // 4. Archivo de video directo (MP4, WebM o Supabase Storage)
  const isDirect =
    trimmed.match(/\.(mp4|webm)($|\?)/i) !== null ||
    trimmed.includes("/storage/v1/object/public/product-videos/");

  return {
    type: isDirect ? "direct" : "other",
    src: trimmed,
    isDirectFile: isDirect,
  };
}

// Obtiene la URL pública de un video (enlace externo o ruta en bucket Supabase)
export function publicVideoUrl(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) return urlOrPath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-videos/${urlOrPath}`;
}
