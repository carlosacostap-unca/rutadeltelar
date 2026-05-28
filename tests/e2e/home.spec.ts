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
  ).toHaveCount(0);
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

test("supports swiping the hero carousel", async ({ page }) => {
  await page.goto("/");

  const hero = page.locator('section[aria-label="Presentacion principal"]');
  const track = page.getByTestId("home-hero-track");
  const heroBox = await hero.boundingBox();

  expect(heroBox).not.toBeNull();
  await expect(track).toHaveAttribute("style", /translateX/);

  if (!heroBox) {
    return;
  }

  const startX = heroBox.x + heroBox.width * 0.75;
  const endX = heroBox.x + heroBox.width * 0.2;
  const y = heroBox.y + heroBox.height * 0.48;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 8 });
  await page.mouse.up();

  const activeHero = page.locator(
    'section[aria-label="Presentacion principal"] [aria-hidden="false"]',
  );

  await expect(
    activeHero.getByRole("heading", { name: "Estaciones" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver hero 2" }),
  ).toHaveAttribute("aria-current", "true");
});

test("keeps hero swipe navigation within the first and last slides", async ({
  page,
}) => {
  await page.goto("/");

  const hero = page.locator('section[aria-label="Presentacion principal"]');
  const heroBox = await hero.boundingBox();

  expect(heroBox).not.toBeNull();

  if (!heroBox) {
    return;
  }

  const y = heroBox.y + heroBox.height * 0.48;

  await expect(
    page.getByRole("button", { name: "Ver hero anterior" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ver hero siguiente" }),
  ).toBeVisible();

  await page.mouse.move(heroBox.x + heroBox.width * 0.25, y);
  await page.mouse.down();
  await page.mouse.move(heroBox.x + heroBox.width * 0.8, y, { steps: 8 });
  await page.mouse.up();

  await expect(
    page.getByRole("button", { name: "Ver hero 1" }),
  ).toHaveAttribute("aria-current", "true");

  await page.getByRole("button", { name: "Ver hero 4" }).click();
  await expect(
    page.getByRole("button", { name: "Ver hero anterior" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver hero siguiente" }),
  ).toHaveCount(0);

  await page.mouse.move(heroBox.x + heroBox.width * 0.8, y);
  await page.mouse.down();
  await page.mouse.move(heroBox.x + heroBox.width * 0.25, y, { steps: 8 });
  await page.mouse.up();

  await expect(
    page.getByRole("button", { name: "Ver hero 4" }),
  ).toHaveAttribute("aria-current", "true");
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

test("shows institutional sponsor logos at the end of the home page", async ({
  page,
}) => {
  await page.goto("/");

  const sponsors = page.getByRole("region", {
    name: "Aliados institucionales",
  });

  await expect(sponsors).toBeVisible();
  await expect(
    sponsors.getByRole("img", { name: /Catamarca Gobierno/i }),
  ).toBeVisible();
  await expect(
    sponsors.getByRole("img", { name: "Consejo Federal de Inversiones" }),
  ).toBeVisible();
  await expect(
    sponsors.getByRole("img", { name: "Alwaleed Philanthropies" }),
  ).toBeVisible();
  await expect(sponsors.getByRole("img", { name: "Unesco" })).toBeVisible();
  await expect(
    sponsors.getByRole("img", { name: "Ruta del Telar" }),
  ).toBeVisible();
});

test("shows the institutional footer with QR and social icons", async ({
  page,
}) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo", {
    name: "Informacion institucional",
  });

  await expect(footer).toBeVisible();
  await expect(footer.getByRole("img", { name: /Vicuna/i })).toBeVisible();
  await expect(footer.getByText("Direccion")).toBeVisible();
  await expect(
    footer.getByText(/Ministerio de Trabajo, Planificacion/i),
  ).toBeVisible();
  await expect(
    footer.getByRole("img", { name: /QR para acceder/i }),
  ).toBeVisible();
  await expect(footer.getByText("Ruta del Telar")).toBeVisible();
  await expect(footer.getByRole("img", { name: "Facebook" })).toBeVisible();
  await expect(footer.getByRole("img", { name: "Instagram" })).toBeVisible();
  await expect(footer.getByRole("img", { name: "YouTube" })).toBeVisible();
});
