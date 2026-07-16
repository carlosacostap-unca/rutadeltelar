import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { isExpoOffline } from "@/app/lib/expo-config";

const pbUrl = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "").replace(/\/$/, "");
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
const metricsCollection = process.env.POCKETBASE_COLLECTION_METRICS_VIEWS || "metricas_visitas";
const visitorCookieName = "rdt_visitor";
const allowedEntityTypes = new Set([
  "estaciones",
  "actores",
  "productos",
  "experiencias",
  "imperdibles",
]);

export const runtime = "nodejs";

type ViewPayload = {
  entityType?: unknown;
  entityId?: unknown;
  entitySlug?: unknown;
  entityTitle?: unknown;
  path?: unknown;
};

export async function POST(request: Request) {
  if (isExpoOffline()) {
    return Response.json({ ok: true, skipped: "expo_offline" });
  }

  if (!pbUrl || !adminEmail || !adminPassword) {
    return Response.json({ ok: false, skipped: "missing_pocketbase_credentials" }, { status: 202 });
  }

  let payload: ViewPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const entityType = readString(payload.entityType, 32);
  const entityId = readString(payload.entityId, 80);
  const entitySlug = readString(payload.entitySlug, 160);
  const entityTitle = readString(payload.entityTitle, 220);
  const path = readString(payload.path, 240);

  if (!allowedEntityTypes.has(entityType) || !entityId || !entitySlug || !entityTitle) {
    return Response.json({ error: "Invalid metrics payload." }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const existingVisitorKey = cookieStore.get(visitorCookieName)?.value;
    const visitorKey = existingVisitorKey || randomUUID();
    const visitorHash = hashVisitor(visitorKey);
    const viewedAt = new Date();
    const viewedOn = formatArgentinaDate(viewedAt);
    const token = await authenticateAdmin();
    const isUniqueDaily = !(await hasDailyUniqueView({
      token,
      entityType,
      entityId,
      visitorHash,
      viewedOn,
    }));

    await pb(`/api/collections/${encodeURIComponent(metricsCollection)}/records`, {
      method: "POST",
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        entity_slug: entitySlug,
        entity_title: entityTitle,
        path,
        viewed_at: viewedAt.toISOString(),
        viewed_on: viewedOn,
        visitor_hash: visitorHash,
        is_unique_daily: isUniqueDaily,
        referrer_host: readReferrerHost(await headers()),
      }),
      token,
    });

    if (!existingVisitorKey) {
      cookieStore.set(visitorCookieName, visitorKey, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 180,
        path: "/",
      });
    }

    return Response.json({ ok: true, isUniqueDaily });
  } catch (error) {
    console.error("Could not register metrics view:", error);
    return Response.json({ ok: false }, { status: 202 });
  }
}

async function hasDailyUniqueView({
  token,
  entityType,
  entityId,
  visitorHash,
  viewedOn,
}: {
  token: string;
  entityType: string;
  entityId: string;
  visitorHash: string;
  viewedOn: string;
}) {
  const query = new URLSearchParams({
    page: "1",
    perPage: "1",
    filter: [
      `entity_type = "${escapeFilter(entityType)}"`,
      `entity_id = "${escapeFilter(entityId)}"`,
      `visitor_hash = "${escapeFilter(visitorHash)}"`,
      `viewed_on = "${escapeFilter(viewedOn)}"`,
      "is_unique_daily = true",
    ].join(" && "),
  });

  const result = await pb(
    `/api/collections/${encodeURIComponent(metricsCollection)}/records?${query.toString()}`,
    { token },
  );

  return Number(result.totalItems || 0) > 0;
}

async function authenticateAdmin() {
  const body = JSON.stringify({ identity: adminEmail, password: adminPassword });
  const adminResponse = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (adminResponse.ok) return (await adminResponse.json()).token as string;

  const superuserResponse = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (superuserResponse.ok) return (await superuserResponse.json()).token as string;

  throw new Error(`PocketBase auth failed: admins=${adminResponse.status}, superusers=${superuserResponse.status}`);
}

async function pb(path: string, options: RequestInit & { token: string }) {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${pbUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`PocketBase ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function hashVisitor(value: string) {
  const salt = process.env.METRICS_HASH_SALT || "ruta-del-telar";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function formatArgentinaDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function readReferrerHost(headerStore: Headers) {
  const referrer = headerStore.get("referer");
  if (!referrer) return "";

  try {
    const url = new URL(referrer);
    return url.host.slice(0, 120);
  } catch {
    return "";
  }
}

function escapeFilter(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
