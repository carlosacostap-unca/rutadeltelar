import { expect, test } from "@playwright/test";

test.describe("basic accessibility", () => {
  test("offers a keyboard skip link to the content container", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: /Saltar al contenido/i });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#contenido")).toBeFocused();
  });

  test("labels catalog search and announces product result counts", async ({ page }) => {
    await page.goto("/productos");

    await page
      .getByRole("searchbox", {
        name: /Buscar productos por nombre, tecnica o descripcion/i,
      })
      .fill("alfombra");

    await expect(page.getByRole("status")).toContainText("1 producto");
  });

  test("exposes pressed state on filter and map layer toggles", async ({ page }) => {
    await page.goto("/explorar");

    const duration = page.getByRole("button", { name: "2 h" });
    await expect(duration).toHaveAttribute("aria-pressed", "false");

    await duration.click();
    await expect(duration).toHaveAttribute("aria-pressed", "true");

    await page.goto("/mapa");

    const actorsLayer = page.getByRole("button", { name: "Actores", exact: true });
    await expect(actorsLayer).toHaveAttribute("aria-pressed", "true");

    await actorsLayer.click();
    await expect(actorsLayer).toHaveAttribute("aria-pressed", "false");
  });

  test("marks the current mobile navigation item", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/estaciones");

    await expect(
      page.getByRole("navigation", { name: /Navegacion principal/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Estaciones" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
