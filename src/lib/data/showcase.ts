import { z } from "zod";

export const showcaseVideoSchema = z.object({
  id: z.string(),
  title: z.string().max(120),
  subtitle: z.string().max(300).default(""),
  videoUrl: z.string().max(500),
  posterUrl: z.string().nullable().default(null),
  targetHref: z.string().max(200).default("/carta"),
  active: z.boolean().default(true),
});

export type ShowcaseVideoItem = z.infer<typeof showcaseVideoSchema>;

export function parseShowcaseVideos(settings: Record<string, unknown>): ShowcaseVideoItem[] {
  const raw = settings.videos_showcase;
  if (!Array.isArray(raw)) return [];
  const parsed = z.array(showcaseVideoSchema).safeParse(raw);
  return parsed.success ? parsed.data : [];
}
