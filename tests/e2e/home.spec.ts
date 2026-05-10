import { expect, test } from "@playwright/test";

test("renders the public home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Ruta del Telar/);
  await expect(page.getByRole("heading", { name: /El tejido/i })).toBeVisible();
  await expect(page.locator('a[href="/estaciones"]').first()).toBeVisible();
});

test("navigates from home to a main public section", async ({ page }) => {
  await page.goto("/");

  await page.locator('a[href="/estaciones"]').first().click();

  await expect(page).toHaveURL(/\/estaciones$/);
  await expect(
    page.getByRole("heading", { name: /Nodos territoriales/i }),
  ).toBeVisible();
});
