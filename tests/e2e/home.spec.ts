import { expect, test } from "@playwright/test";

test("renders the public home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Ruta del Telar/);
  await expect(
    page.getByRole("heading", { name: /Ruta del Telar/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Estaciones" }).first()).toBeVisible();
});

test("shows the stations hero slide", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Ver hero anterior" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver hero siguiente" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ver hero 2" }).click();

  const activeHero = page.locator(
    'section[aria-label="Presentacion principal"] [aria-hidden="false"]',
  );

  await expect(
    activeHero.getByRole("heading", { name: "Estaciones" }),
  ).toBeVisible();
  await expect(activeHero.getByText(/Departamento Santa Mar/i)).toBeVisible();
});

test("shows the actors hero slide", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Ver hero 3" }).click();

  const activeHero = page.locator(
    'section[aria-label="Presentacion principal"] [aria-hidden="false"]',
  );

  await expect(
    activeHero.getByRole("heading", { name: "Actores" }),
  ).toBeVisible();
  await expect(activeHero.getByText(/experiencia inolvidable/i)).toBeVisible();
});

test("shows the highlights hero slide", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Ver hero 4" }).click();

  const activeHero = page.locator(
    'section[aria-label="Presentacion principal"] [aria-hidden="false"]',
  );

  await expect(
    activeHero.getByRole("heading", { name: "Imperdibles" }),
  ).toBeVisible();
  await expect(
    activeHero.getByText(/Descubr/i),
  ).toBeVisible();
  await expect(activeHero.getByText(/legado prehisp/i)).toBeVisible();
});

test("navigates from home to a main public section", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Estaciones" }).first().click();

  await expect(page).toHaveURL(/\/estaciones$/);
  await expect(
    page.getByRole("heading", { name: /Nodos territoriales/i }),
  ).toBeVisible();
});
