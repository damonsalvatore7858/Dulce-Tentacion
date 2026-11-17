import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isProductionDeploy } from "@/lib/security/env";

export type Bucket = "order" | "event" | "login" | "click";
export type RateLimitState = "ok" | "limited" | "unavailable";

const CONFIG: Record<Bucket, { tokens: number; windowMs: number; window: `${number} m` }> = {
  order: { tokens: 8, windowMs: 10 * 60_000, window: "10 m" },
  event: { tokens: 5, windowMs: 10 * 60_000, window: "10 m" },
  login: { tokens: 10, windowMs: 10 * 60_000, window: "10 m" },
  click: { tokens: 60, windowMs: 10 * 60_000, window: "10 m" },
};

const limiters = new Map<Bucket, Ratelimit>();
const memory = new Map<string, number[]>();

function getLimiter(bucket: Bucket): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (isProductionDeploy) {
      console.warn("[security] UPSTASH_REDIS no configurado en producción; usando respaldo en memoria");
    }
    return null;
  }

  let limiter = limiters.get(bucket);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(CONFIG[bucket].tokens, CONFIG[bucket].window),
      prefix: `dt:${bucket}`,
    });
    limiters.set(bucket, limiter);
  }
  return limiter;
}

// No guardamos la IP: solo un hash corto para contar intentos.
async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

// Respaldo en memoria: solo para desarrollo y previews (no es fiable en serverless).
function memoryCheck(bucket: Bucket, key: string): RateLimitState {
  const { tokens, windowMs } = CONFIG[bucket];
  const now = Date.now();
  const id = `${bucket}:${key}`;
  const recent = (memory.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= tokens) {
    memory.set(id, recent);
    return "limited";
  }
  recent.push(now);
  memory.set(id, recent);
  return "ok";
}

export async function checkRateLimit(bucket: Bucket): Promise<RateLimitState> {
  const key = await clientKey();
  const limiter = getLimiter(bucket);

  if (limiter) {
    try {
      const { success } = await limiter.limit(key);
      return success ? "ok" : "limited";
    } catch {
      console.error("[security] rate limit backend error, usando respaldo en memoria");
      return memoryCheck(bucket, key);
    }
  }

  // Sin Upstash configurado: usamos respaldo en memoria para no bloquear los pedidos
  return memoryCheck(bucket, key);
}
