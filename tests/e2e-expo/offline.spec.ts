import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("core exhibition paths work without outbound requests", async ({ page, request }) => {
  test.setTimeout(120_000);
  const outbound = new Set<string>();
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const local = ["127.0.0.1", "localhost"].includes(url.hostname) || ["data:", "blob:"].includes(url.protocol);
    if (!local) {
      outbound.add(`${route.request().method()} ${url.origin}${url.pathname}`);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });

  const paths = [
    "/", "/estaciones", "/actores", "/productos", "/explorar", "/imperdibles",
    "/buscar?q=telar", "/favoritos", "/agenda", "/mapa", "/recorridos",
  ];
  const snapshot = JSON.parse(await readFile(path.join(process.cwd(), "public", "expo", "snapshot.json"), "utf8"));
  paths.push(
    `/estaciones/${snapshot.data.stations[0].slug}`,
    `/actores/${snapshot.data.artisans[0].slug}`,
    `/productos/${snapshot.data.products[0].slug}`,
    `/explorar/${snapshot.data.experiences[0].slug}`,
    `/imperdibles/${snapshot.data.highlightSpots[0].slug}`,
  );
  const journeyStation = snapshot.data.stations.find((station: { recordId?: string; slug: string }) =>
    [...snapshot.data.artisans, ...snapshot.data.experiences, ...snapshot.data.highlightSpots]
      .some((item: { stationRecordId?: string }) => item.stationRecordId && item.stationRecordId === station.recordId),
  );
  if (journeyStation) paths.push(`/recorridos/recorrido-${journeyStation.slug}`);

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should respond successfully`).toBeTruthy();
  }

  for (const path of ["/", "/mapa", journeyStation ? `/recorridos/recorrido-${journeyStation.slug}` : "/recorridos"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${path} should render in a browser`).toBeTruthy();
    await expect(page.locator("body")).toContainText(/Ruta del Telar|Mapa|Recorrido/i);
    if (path === "/mapa") {
      const map = page.locator(".leaflet-container").first();
      await expect.poll(() => map.getAttribute("data-expo-map-source")).toBe("pmtiles");
      const vectorCanvas = page.locator(".expo-vector-basemap canvas.leaflet-tile").first();
      await expect(vectorCanvas).toBeVisible();
      await expect.poll(() => vectorCanvas.evaluate((canvas) => {
        if (!(canvas instanceof HTMLCanvasElement) || canvas.width === 0 || canvas.height === 0) {
          return false;
        }
        const context = canvas.getContext("2d");
        if (!context) return false;
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] > 0) return true;
        }
        return false;
      })).toBe(true);
      await expect(page.getByText(/OpenStreetMap/).first()).toBeVisible();
    }
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const departmentImages = page.locator('img[alt^="Departamento "]');
  await expect(departmentImages).toHaveCount(3);
  await expect.poll(async () => departmentImages.evaluateAll((images) =>
    images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
  )).toBe(true);
  expect([...outbound], `outbound requests detected: ${[...outbound].join(", ")}`).toEqual([]);
});

test("packaged PMTiles supports HTTP range requests", async ({ request }) => {
  const response = await request.get("/expo/map/ruta-del-telar.pmtiles", {
    headers: { range: "bytes=0-16383" },
  });
  expect(response.status()).toBe(206);
  expect(response.headers()["accept-ranges"]).toBe("bytes");
  expect(response.headers()["content-range"]).toMatch(/^bytes 0-16383\/\d+$/);
  expect((await response.body()).byteLength).toBe(16_384);
});

test("map retains the schematic fallback when PMTiles is unavailable", async ({ page }) => {
  await page.route("**/expo/map/ruta-del-telar.pmtiles", (route) => route.abort("failed"));
  const response = await page.goto("/mapa", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  const map = page.locator(".leaflet-container").first();
  await expect(map).toHaveAttribute("data-expo-map-source", "schematic");
  await expect(page.locator('img.leaflet-image-layer[src$="/expo/map/ruta-del-telar.svg"]').first()).toBeVisible();
});

test("expo health reports the validated local snapshot", async ({ request }) => {
  const response = await request.get("/api/expo/health");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ ok: true, mode: "expo-offline" });
});
