import { expect, test } from "@playwright/test";

test.describe("public catalogs", () => {
  test("filters stations by locality search", async ({ page }) => {
    await page.goto("/estaciones");

    await expect(
      page.getByRole("heading", { name: /Nodos territoriales/i }),
    ).toBeVisible();

    await page.getByPlaceholder(/Buscar por nombre/i).fill("Belen");

    await expect(page.locator('a[href="/estaciones/belen-catamarca"]')).toBeVisible();
    await expect(page.locator('a[href="/estaciones/laguna-blanca"]')).toHaveCount(0);
  });

  test("filters actors by craft or name", async ({ page }) => {
    await page.goto("/artesanas");

    await expect(page.getByRole("heading", { name: /Actores de la ruta/i })).toBeVisible();

    await page.getByPlaceholder(/Buscar por nombre/i).fill("Juana");

    await expect(page.locator('a[href="/artesanas/juana-mamani"]')).toBeVisible();
    await expect(page.locator('a[href="/artesanas/rosa-chaile"]')).toHaveCount(0);
  });

  test("filters products by text and keeps detail links reachable", async ({ page }) => {
    await page.goto("/productos");

    await expect(
      page.getByRole("heading", { name: /Piezas y productos/i }),
    ).toBeVisible();

    await page.getByPlaceholder(/Buscar por nombre/i).fill("alfombra");

    await expect(page.locator('a[href="/productos/alfombra-lana-cruda"]')).toBeVisible();
    await expect(page.locator('a[href="/productos/chal-fibra-natural"]')).toHaveCount(0);
  });

  test("filters experiences by duration", async ({ page }) => {
    await page.goto("/explorar");

    await expect(page.getByRole("heading", { name: /Quiero hacer algo/i })).toBeVisible();

    await page.getByRole("button", { name: "2 h" }).click();

    await expect(page.locator('a[href="/explorar/tarde-de-telar-vivo"]')).toBeVisible();
    await expect(page.locator('a[href="/explorar/camino-del-hilado"]')).toHaveCount(0);
  });
});
