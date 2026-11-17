"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import { done, fail, flag, logAdminError, revalidatePublic } from "@/lib/admin/forms";
import { isValidVideoFile, MAX_VIDEO_BYTES } from "@/lib/media/video";
import { parseShowcaseVideos, type ShowcaseVideoItem } from "@/lib/data/queries";

const PATH = "/admin/videos";
const VIDEO_BUCKET = "product-videos";

export async function saveShowcaseVideo(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") || "").trim() || randomUUID();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const targetHref = String(formData.get("target_href") || "").trim() || "/carta";
  const rawVideoUrl = String(formData.get("video_url") || "").trim();
  const videoFile = formData.get("video_file");
  const removeVideo = formData.get("remove_video") === "1";
  const active = flag(formData, "active");

  if (!title) fail(PATH, "datos");

  // Obtener videos actuales de site_settings
  const { data: settingRow } = await supabase
    .from("site_settings")
    .select("valor")
    .eq("clave", "videos_showcase")
    .maybeSingle();

  const currentVideos = parseShowcaseVideos({ videos_showcase: settingRow?.valor });
  const existing = currentVideos.find((v) => v.id === id);

  let finalVideoUrl = existing?.videoUrl ?? "";

  // 1. Si se sube archivo de video directo
  if (videoFile instanceof File && videoFile.size > 0) {
    if (videoFile.size > MAX_VIDEO_BYTES) fail(PATH, "video_grande");
    if (!isValidVideoFile(videoFile)) fail(PATH, "video_tipo");

    const ext = videoFile.name.endsWith(".webm") ? "webm" : "mp4";
    const mime = ext === "webm" ? "video/webm" : "video/mp4";
    const objectPath = `showcase/${id}/${randomUUID()}.${ext}`;

    const bytes = new Uint8Array(await videoFile.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(VIDEO_BUCKET).upload(objectPath, bytes, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });

    if (uploadError) {
      logAdminError("uploadShowcaseVideo", uploadError.name);
      fail(PATH, "video_subida");
    }

    if (existing?.videoUrl && !existing.videoUrl.startsWith("http")) {
      await supabase.storage.from(VIDEO_BUCKET).remove([existing.videoUrl]);
    }

    finalVideoUrl = objectPath;
  } else if (rawVideoUrl) {
    // 2. Si se ingresa una URL externa (YouTube, Shorts, Reel, TikTok)
    if (existing?.videoUrl && !existing.videoUrl.startsWith("http")) {
      await supabase.storage.from(VIDEO_BUCKET).remove([existing.videoUrl]);
    }
    finalVideoUrl = rawVideoUrl;
  } else if (removeVideo) {
    if (existing?.videoUrl && !existing.videoUrl.startsWith("http")) {
      await supabase.storage.from(VIDEO_BUCKET).remove([existing.videoUrl]);
    }
    finalVideoUrl = "";
  }

  const updatedItem: ShowcaseVideoItem = {
    id,
    title,
    subtitle,
    videoUrl: finalVideoUrl,
    posterUrl: existing?.posterUrl ?? null,
    targetHref,
    active,
  };

  const nextVideos = existing
    ? currentVideos.map((v) => (v.id === id ? updatedItem : v))
    : [...currentVideos, updatedItem];

  const { error } = await supabase
    .from("site_settings")
    .upsert({ clave: "videos_showcase", valor: nextVideos, publico: true }, { onConflict: "clave" });

  if (error) {
    logAdminError("saveShowcaseVideos", error.code);
    fail(PATH, "guardar");
  }

  revalidatePublic();
  done(PATH);
}

export async function deleteShowcaseVideo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) fail(PATH, "datos");

  const { data: settingRow } = await supabase
    .from("site_settings")
    .select("valor")
    .eq("clave", "videos_showcase")
    .maybeSingle();

  const currentVideos = parseShowcaseVideos({ videos_showcase: settingRow?.valor });
  const target = currentVideos.find((v) => v.id === id);

  if (target?.videoUrl && !target.videoUrl.startsWith("http")) {
    await supabase.storage.from(VIDEO_BUCKET).remove([target.videoUrl]);
  }

  const nextVideos = currentVideos.filter((v) => v.id !== id);

  const { error } = await supabase
    .from("site_settings")
    .upsert({ clave: "videos_showcase", valor: nextVideos, publico: true }, { onConflict: "clave" });

  if (error) {
    logAdminError("deleteShowcaseVideo", error.code);
    fail(PATH, "guardar");
  }

  revalidatePublic();
  done(PATH);
}

export async function toggleShowcaseVideo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const targetActive = formData.get("active") === "true";
  if (!id) fail(PATH, "datos");

  const { data: settingRow } = await supabase
    .from("site_settings")
    .select("valor")
    .eq("clave", "videos_showcase")
    .maybeSingle();

  const currentVideos = parseShowcaseVideos({ videos_showcase: settingRow?.valor });
  const nextVideos = currentVideos.map((v) => (v.id === id ? { ...v, active: targetActive } : v));

  const { error } = await supabase
    .from("site_settings")
    .upsert({ clave: "videos_showcase", valor: nextVideos, publico: true }, { onConflict: "clave" });

  if (error) fail(PATH, "guardar");

  revalidatePublic();
  done(PATH);
}
