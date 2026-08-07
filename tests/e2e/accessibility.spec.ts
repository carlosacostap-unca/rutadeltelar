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
        name: /Buscar productos por nombre, técnica, material o localidad/i,
      })
      .fill("alfombra");

    await expect(page.getByRole("status")).toContainText("1 producto");
  });

  test("exposes selected filter state and keeps map controls minimal", async ({ page }) => {
    await page.goto("/explorar");

    const filtersButton = page.getByRole("button", { name: "Filtros" });

    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      const dialog = page.getByRole("dialog", { name: "Filtros" });
      const duration = dialog.getByRole("combobox", { name: "Duración" });

      await expect(duration).toHaveValue("todas");
      await duration.selectOption({ label: "2 h" });
      await dialog.getByRole("button", { name: /Ver \d+ resultados?/ }).click();
      await expect(dialog).toBeHidden();
    } else {
      const duration = page.getByRole("combobox", { name: "Duración" });

      await expect(duration).toHaveValue("todas");
      await duration.selectOption({ label: "2 h" });
      await expect(duration).toHaveValue("2 h");
    }

    await expect(
      page.getByRole("button", { name: "Quitar filtro: 2 h" }),
    ).toBeVisible();

    await page.goto("/mapa");

    await expect(page.getByText("Capas del mapa")).toHaveCount(0);
    await expect(
      page.getByRole("tablist", { name: /Tipo de contenido para navegar/i }),
    ).toHaveCount(0);
  });

  test("marks the current mobile navigation item", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/estaciones");

    await expect(
      page.getByRole("banner").getByRole("link", { name: "Ir al inicio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Buscar en la ruta" }),
    ).toBeVisible();
    const mobileNavigation = page.getByRole("navigation", {
      name: /Navegacion principal/i,
    });

    await expect(mobileNavigation).toBeVisible();
    await expect(page.getByRole("link", { name: "Estaciones" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      mobileNavigation.getByText("Imperdibles", { exact: true }),
    ).toBeVisible();
  });
});
