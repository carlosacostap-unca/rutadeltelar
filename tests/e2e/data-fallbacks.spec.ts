import { expect, test } from "@playwright/test";

test.describe("incomplete data fallbacks", () => {
  test("shows a useful product media fallback when no image is available", async ({
    page,
  }) => {
    await page.goto("/productos/alfombra-lana-cruda");

    await expect(page.getByRole("heading", { name: /Alfombra de lana cruda/i })).toBeVisible();
    await expect(page.getByText("Producto", { exact: true })).toHaveCount(2);
  });

  test("keeps station details useful without coordinates", async ({ page }) => {
    await page.goto("/estaciones/belen-catamarca");

    await expect(page.getByText(/Coordenadas no disponibles/i)).toBeVisible();
  });

  test("explains when visible map records have no coordinates", async ({ page }) => {
    await page.goto("/mapa");

    await expect(page.getByText("Sin coordenadas visibles")).toBeVisible();
    await expect(
      page.getByText("Ninguno de los registros visibles tiene coordenadas cargadas."),
    ).toBeVisible();
  });
});
