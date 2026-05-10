import { expect, test } from "@playwright/test";

test.describe("global search", () => {
  test("shows an empty prompt before searching", async ({ page }) => {
    await page.goto("/buscar");

    await expect(page.getByRole("heading", { name: /buscando/i })).toBeVisible();
    await expect(page.getByText(/Escrib/i)).toBeVisible();
  });

  test("groups matching results and syncs the query string", async ({ page }) => {
    await page.goto("/buscar");

    await page.getByRole("searchbox").fill("Belen");

    await expect(page).toHaveURL(/\/buscar\?q=Belen$/);
    await expect(page.getByRole("heading", { name: /Estaciones/i })).toBeVisible();
    await expect(page.locator('a[href="/estaciones/belen-catamarca"]')).toBeVisible();
  });

  test("shows no-results state for unmatched terms", async ({ page }) => {
    await page.goto("/buscar");

    await page.getByRole("searchbox").fill("zzzz-sin-coincidencias");

    await expect(page.getByText(/Sin resultados para/i)).toBeVisible();
    await expect(page.getByText("Sin resultados", { exact: true })).toBeVisible();
  });

  test("clears the query from the URL", async ({ page }) => {
    await page.goto("/buscar?q=telar");

    await expect(page.getByRole("searchbox")).toHaveValue("telar");
    await page.getByRole("button", { name: /Limpiar/i }).click();

    await expect(page).toHaveURL(/\/buscar$/);
    await expect(page.getByRole("searchbox")).toHaveValue("");
  });
});
