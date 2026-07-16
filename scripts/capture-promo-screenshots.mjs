import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.PROMO_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(process.cwd(), "public", "video", "screenshots");

const pages = [
  { name: "home.png", path: "/" },
  { name: "estaciones.png", path: "/estaciones" },
  { name: "productos.png", path: "/productos" },
  { name: "artesanas.png", path: "/artesanas" },
  { name: "experiencias.png", path: "/explorar" },
  { name: "imperdibles.png", path: "/imperdibles" },
  { name: "imperdibles-destacados.png", path: "/imperdibles?view=destacados", fullPage: true },
  { name: "recorridos.png", path: "/recorridos" },
  { name: "buscar.png", path: "/buscar" },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

await page.addInitScript(() => {
  window.__PROMO_CAPTURE_EAGER_RENDER__ = true;
  window.IntersectionObserver = class ImmediateIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      window.setTimeout(() => {
        const rect = target.getBoundingClientRect();
        this.callback(
          [
            {
              boundingClientRect: rect,
              intersectionRatio: 1,
              intersectionRect: rect,
              isIntersecting: true,
              rootBounds: null,
              target,
              time: performance.now(),
            },
          ],
          this,
        );
      }, 0);
    }

    takeRecords() {
      return [];
    }

    unobserve() {}

    disconnect() {}
  };
});

async function waitForPage() {
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
  await page.waitForTimeout(1600);
  await waitForImages();
}

async function waitForImages() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.evaluate(async () => {
        const images = Array.from(document.images);
        const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
        await Promise.all(
          images.map((image) => {
            if (image.complete && image.naturalWidth > 0) {
              return Promise.resolve();
            }

            return Promise.race([
              new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              }),
              wait(7000),
            ]);
          }),
        );

        await Promise.race([
          Promise.all(images.map((image) => image.decode?.().catch(() => undefined))),
          wait(4000),
        ]);
      });
      return;
    } catch (error) {
      if (!String(error).includes("Execution context was destroyed") || attempt === 2) {
        throw error;
      }
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => undefined);
      await page.waitForTimeout(800);
    }
  }
}

async function warmFullPageImages() {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.75, 480);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 260));
    }

    window.scrollTo(0, maxScroll);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    window.scrollTo(0, 0);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  });

  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => undefined);
  await waitForImages();
  await page.waitForTimeout(800);
}

async function waitForLeafletMap() {
  const mapSelector = ".leaflet-container, [data-promo-static-map]";
  const map = page.locator(mapSelector).first();
  const hasMap = await map.count();

  if (!hasMap) {
    await page.waitForSelector(mapSelector, { timeout: 20000 }).catch(async () => {
      console.warn("Map container did not appear before timeout; waiting a little longer.");
      await page.waitForTimeout(5000);
    });
  }

  await page
    .waitForFunction(
      () => {
        const staticMap = document.querySelector("[data-promo-static-map]");
        if (staticMap) {
          return true;
        }

        const container = document.querySelector(".leaflet-container");
        if (!container) {
          return false;
        }

        const tiles = Array.from(container.querySelectorAll("img.leaflet-tile"));
        if (!tiles.length) {
          return true;
        }

        return tiles.some((tile) => tile.complete && tile.naturalWidth > 0);
      },
      { timeout: 20000 },
    )
    .catch(async () => {
      console.warn("Map images did not finish before timeout; keeping the latest loaded state.");
      await page.waitForTimeout(3000);
    });

  await waitForImages();
  await page.waitForTimeout(1800);
}

async function capture(name) {
  await page.screenshot({
    path: path.join(outputDir, name),
    fullPage: false,
  });
}

async function captureFullPage(name, options = {}) {
  await warmFullPageImages();
  if (options.waitForMap) {
    await waitForLeafletMap();
  }
  if (options.settleMs) {
    await page.waitForTimeout(options.settleMs);
  }
  await page.screenshot({
    path: path.join(outputDir, name),
    fullPage: true,
  });
}

async function captureRoute(name, route) {
  const url = new URL(route, baseUrl);
  console.log(`Capturing ${url.href}`);
  await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
  await waitForPage();
  if (name === "mapa.png") {
    await page.waitForSelector(".leaflet-container", { timeout: 30000 }).catch(async () => {
      console.warn("Leaflet map container did not appear before timeout; waiting a little longer.");
      await page.waitForTimeout(6000);
    });
    await page.waitForTimeout(3000);
  }
  await capture(name);
}

async function isNotFoundPage() {
  const bodyText = await page.locator("body").innerText().catch(() => "");
  return bodyText.includes("This page could not be found") || bodyText.includes("404");
}

async function captureFirstDetail({
  linkSelector,
  fallbackPath,
  outputName,
  notFoundFallbackPath,
  promoCapture = false,
}) {
  const href = await page.locator(linkSelector).first().getAttribute("href").catch(() => null);
  const detailUrl = new URL(href ?? fallbackPath, baseUrl);
  if (promoCapture) {
    detailUrl.searchParams.set("promoCapture", "1");
  }
  console.log(`Capturing ${detailUrl.href}`);
  await page.goto(detailUrl.href, { waitUntil: "networkidle", timeout: 60000 });
  await waitForPage();

  if (notFoundFallbackPath && (await isNotFoundPage())) {
    const fallbackUrl = new URL(notFoundFallbackPath, baseUrl);
    console.warn(`Detail looked like 404; retrying ${fallbackUrl.href}`);
    await page.goto(fallbackUrl.href, { waitUntil: "networkidle", timeout: 60000 });
    await waitForPage();
  }

  await captureFullPage(outputName);
}

for (const item of pages) {
  const url = new URL(item.path, baseUrl);
  console.log(`Capturing ${url.href}`);
  await page.goto(url.href, { waitUntil: "networkidle", timeout: 60000 });
  await waitForPage();
  if (item.fullPage || ["/estaciones", "/artesanas", "/productos", "/explorar", "/imperdibles"].includes(item.path)) {
    await captureFullPage(item.name);
  } else {
    await capture(item.name);
  }

  if (item.path === "/") {
    await capture("nav.png");
    await captureFullPage("home-full.png");
  }

  if (item.path === "/estaciones") {
    const stationLinks = await page
      .locator('a[href^="/estaciones/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter(Boolean))
      .catch(() => []);
    const stationHref = stationLinks.find((href) => href?.includes("santa-maria")) ?? stationLinks[0] ?? null;

    if (stationHref) {
      const stationUrl = new URL(stationHref, baseUrl);
      stationUrl.searchParams.set("promoCapture", "1");
      console.log(`Capturing ${stationUrl.href}`);
      await page.goto(stationUrl.href, { waitUntil: "networkidle", timeout: 60000 });
      await waitForPage();
      await captureFullPage("estacion.png", { waitForMap: true, settleMs: 2500 });
    } else {
      console.warn("No station detail link found; reusing estaciones.png as estacion.png");
      await capture("estacion.png");
    }
  }

  if (item.path === "/productos") {
    await captureFirstDetail({
      linkSelector: 'a[href^="/productos/"]',
      fallbackPath: "/productos/cartera",
      outputName: "producto.png",
      notFoundFallbackPath: "/productos/manta-guarda-belen",
    });
  }

  if (item.path === "/artesanas") {
    await captureFirstDetail({
      linkSelector: 'a[href^="/artesanas/"]',
      fallbackPath: "/artesanas/tapices-ocampo",
      outputName: "actor.png",
      promoCapture: true,
    });
  }

  if (item.path === "/explorar") {
    await captureFirstDetail({
      linkSelector: 'a[href^="/explorar/"]',
      fallbackPath: "/explorar/visita-cooperativa-tinku-kamayu",
      outputName: "experiencia.png",
    });
  }
}

await captureRoute("mapa.png", "/mapa");
await captureRoute("favoritos.png", "/favoritos");

await browser.close();
