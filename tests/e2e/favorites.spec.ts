import { expect, test } from "@playwright/test";

test.describe("local favorites", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("saves a detail page and shows it in favorites", async ({ page }) => {
    await page.goto("/estaciones/belen-catamarca");

    await page
      .getByRole("button", { name: "Guardar favorito: Estacion Belen" })
      .click();

    await page.goto("/favoritos");

    await expect(page.getByRole("heading", { name: "Favoritos", exact: true })).toBeVisible();
    await expect(page.getByText("1 favorito")).toBeVisible();
    await expect(page.locator('a[href="/estaciones/belen-catamarca"]')).toContainText(
      "Estacion Belen",
    );
  });

  test("removes a saved favorite", async ({ page }) => {
    await page.goto("/productos/alfombra-lana-cruda");

    await page
      .getByRole("button", { name: "Guardar favorito: Alfombra de lana cruda" })
      .click();
    await page.goto("/favoritos");

    await expect(page.getByText("1 favorito")).toBeVisible();

    await page.getByRole("button", { name: "Quitar" }).click();

    await expect(
      page.getByRole("heading", { name: "Todavia no guardaste favoritos" }),
    ).toBeVisible();
  });

  test("clears all saved favorites", async ({ page }) => {
    await page.goto("/estaciones/belen-catamarca");
    await page
      .getByRole("button", { name: "Guardar favorito: Estacion Belen" })
      .click();

    await page.goto("/explorar/tarde-de-telar-vivo");
    await page
      .getByRole("button", { name: "Guardar favorito: Tarde de telar vivo" })
      .click();

    await page.goto("/favoritos");
    await expect(page.getByText("2 favoritos")).toBeVisible();

    await page.getByRole("button", { name: "Limpiar" }).click();

    await expect(
      page.getByRole("heading", { name: "Todavia no guardaste favoritos" }),
    ).toBeVisible();
  });
});
