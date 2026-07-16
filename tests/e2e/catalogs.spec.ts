import { expect, test } from "@playwright/test";

test.describe("public catalogs", () => {
  test("filters stations by locality search", async ({ page }) => {
    await page.goto("/estaciones");

    await expect(
      page.getByRole("heading", { name: /Todas las estaciones/i }),
    ).toBeVisible();

    await page
      .getByRole("searchbox", {
        name: /Buscar una estación/i,
      })
      .fill("Belen");

    await expect(page.locator('a[href="/estaciones/belen-catamarca"]')).toBeVisible();
    await expect(page.locator('a[href="/estaciones/laguna-blanca"]')).toHaveCount(0);
  });

  test("communicates the active station department filter", async ({ page }) => {
    await page.goto("/estaciones");

    const departmentFilters = page.getByRole("group", {
      name: /Filtrar estaciones por departamento/i,
    });

    await departmentFilters.getByRole("button", { name: "Belen" }).click();

    await expect(page).toHaveURL(/departamento=Belen/);
    await expect(page.getByText("2 estaciones en Belen", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Quitar filtro" })).toBeVisible();
  });

  test("starts the station map with only the scoped station layer", async ({
    page,
  }) => {
    await page.goto("/estaciones?departamento=Belen");

    await page.getByRole("button", { name: "Mapa" }).click();

    await expect(
      page.getByText("Estaciones de Belen", { exact: true }),
    ).toBeVisible();

    const actorsLayer = page.getByRole("button", { name: "Actores", exact: true });
    const highlightsLayer = page.getByRole("button", {
      name: "Imperdibles",
      exact: true,
    });

    await expect(actorsLayer).toHaveAttribute("aria-pressed", "false");
    await expect(highlightsLayer).toHaveAttribute("aria-pressed", "false");
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
