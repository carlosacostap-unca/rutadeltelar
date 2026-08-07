import { expect, test } from "@playwright/test";

test.describe("technical SEO files", () => {
  test("serves robots.txt with sitemap and private client routes excluded", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(response.ok()).toBeTruthy();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /buscar");
    expect(body).toContain("Disallow: /favoritos");
    expect(body).toContain("Sitemap: https://rutadeltelar.catamarca.gob.ar/sitemap.xml");
  });

  test("serves sitemap.xml with public route entries", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.ok()).toBeTruthy();
    expect(body).toContain("<loc>https://rutadeltelar.catamarca.gob.ar/</loc>");
    expect(body).toContain(
      "<loc>https://rutadeltelar.catamarca.gob.ar/estaciones/belen-catamarca</loc>",
    );
    expect(body).toContain(
      "<loc>https://rutadeltelar.catamarca.gob.ar/productos/alfombra-lana-cruda</loc>",
    );
    expect(body).not.toContain("/favoritos");
    expect(body).not.toContain("/buscar");
  });

  test("renders an institutional social preview for a detail without a cover", async ({
    page,
  }) => {
    await page.goto("/explorar/camino-del-hilado");

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Camino del hilado",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://rutadeltelar.catamarca.gob.ar/images/social/ruta-del-telar-social.png",
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      "Camino del hilado",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      "https://rutadeltelar.catamarca.gob.ar/images/social/ruta-del-telar-social.png",
    );
  });
});
