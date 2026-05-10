import { expect, test, type Page } from "@playwright/test";

async function expectNoDocumentOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("visual layout smoke", () => {
  for (const path of ["/", "/estaciones", "/mapa", "/productos", "/favoritos"]) {
    test(`keeps ${path} within the viewport width`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator("main")).toBeVisible();
      await expectNoDocumentOverflow(page);
    });
  }

  test("keeps detail actions visible without horizontal overflow", async ({ page }) => {
    await page.goto("/productos/alfombra-lana-cruda");

    await expect(
      page.getByRole("button", { name: "Guardar favorito: Alfombra de lana cruda" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Compartir: Alfombra de lana cruda" }),
    ).toBeVisible();
    await expectNoDocumentOverflow(page);
  });
});
