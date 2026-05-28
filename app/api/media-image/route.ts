import { getPocketBaseConfig } from "@/app/lib/pocketbase";
import sharp from "sharp";

export const runtime = "nodejs";

const MIN_WIDTH = 64;
const MAX_WIDTH = 1600;
const DEFAULT_WIDTH = 640;
const DEFAULT_QUALITY = 82;
const MAX_BYTES = 20 * 1024 * 1024;

function clampNumber(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(parsed), min), max);
}

function isAllowedPocketBaseImage(src: URL) {
  const baseUrl = getPocketBaseConfig().baseUrl;

  if (!baseUrl) {
    return false;
  }

  const allowed = new URL(baseUrl);

  return (
    src.protocol === allowed.protocol &&
    src.host === allowed.host &&
    src.pathname.startsWith("/api/files/")
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const srcParam = requestUrl.searchParams.get("src");

  if (!srcParam) {
    return new Response("Missing src", { status: 400 });
  }

  let src: URL;

  try {
    src = new URL(srcParam);
  } catch {
    return new Response("Invalid src", { status: 400 });
  }

  if (!isAllowedPocketBaseImage(src)) {
    return new Response("Image source not allowed", { status: 400 });
  }

  const width = clampNumber(requestUrl.searchParams.get("w"), DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH);
  const quality = clampNumber(requestUrl.searchParams.get("q"), DEFAULT_QUALITY, 50, 92);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const sourceResponse = await fetch(src, {
      signal: controller.signal,
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!sourceResponse.ok) {
      return new Response("Image source unavailable", { status: sourceResponse.status });
    }

    const contentType = sourceResponse.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/")) {
      return new Response("Source is not an image", { status: 415 });
    }

    const contentLength = Number(sourceResponse.headers.get("content-length") ?? 0);

    if (contentLength > MAX_BYTES) {
      return new Response("Image source too large", { status: 413 });
    }

    const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());

    if (sourceBuffer.byteLength > MAX_BYTES) {
      return new Response("Image source too large", { status: 413 });
    }

    const image = await sharp(sourceBuffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    const body = image.buffer.slice(
      image.byteOffset,
      image.byteOffset + image.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response("Image source timed out", { status: 504 });
    }

    return new Response("Image could not be processed", { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
