import { expect, test, type Page } from "@playwright/test";

async function expectNoDocumentOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("visual layout smoke", () => {
  for (const path of ["/", "/estaciones", "/artesanas", "/mapa", "/productos", "/favoritos"]) {
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

  test("shows compact station cards and complete department filters on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/estaciones");

    const departmentFilters = page.getByRole("group", {
      name: /Filtrar estaciones por departamento/i,
    });

    for (const label of [
      "Todas",
      "Antofagasta de la Sierra",
      "Belen",
    ]) {
      await expect(
        departmentFilters.getByRole("button", { name: label }),
      ).toBeVisible();
    }

    const firstCard = page.locator("article").first();
    const cardBox = await firstCard.boundingBox();

    expect(cardBox).not.toBeNull();

    if (cardBox) {
      expect(cardBox.width).toBeGreaterThan(cardBox.height * 1.8);
      expect(cardBox.y).toBeLessThan(700);
    }

    await expectNoDocumentOverflow(page);
  });

  test("shows compact actor cards and the first results above the mobile fold", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/artesanas");

    const firstCard = page.locator("article").first();
    const cardBox = await firstCard.boundingBox();

    expect(cardBox).not.toBeNull();

    if (cardBox) {
      expect(cardBox.width).toBeGreaterThan(cardBox.height * 1.35);
      expect(cardBox.y).toBeLessThan(760);
    }

    await expect(page.getByText("Ver perfil").first()).toBeVisible();
    await expectNoDocumentOverflow(page);
  });

  test("keeps actor catalog images compact on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/artesanas");

    const firstCard = page.locator("article").first();
    const mediaBox = await firstCard.getByTestId("actor-media").boundingBox();

    expect(mediaBox).not.toBeNull();

    if (mediaBox) {
      expect(mediaBox.width).toBeGreaterThan(mediaBox.height * 1.2);
    }

    await expect(firstCard.getByRole("heading")).toBeVisible();
    await expect(firstCard.getByText("Ver perfil")).toBeVisible();
  });
});
