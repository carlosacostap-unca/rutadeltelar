import { expect, test } from "@playwright/test";

test.describe("planning flows", () => {
  test("shows imperdibles agenda and destacados views", async ({ page }) => {
    await page.goto("/imperdibles");

    await expect(
      page.getByRole("heading", { name: /Atractivos, actividades y eventos/i }),
    ).toBeVisible();

    const viewSwitcher = page.getByRole("group", {
      name: "Vista de imperdibles",
    });
    const viewButtons = viewSwitcher.getByRole("button");
    const destacadosButton = viewSwitcher.getByRole("button", {
      name: "Destacados",
    });
    const agendaButton = viewSwitcher.getByRole("button", { name: /Agenda/i });

    await expect(viewButtons.nth(0)).toHaveText("Destacados");
    await expect(viewButtons.nth(1)).toContainText("Agenda");
    await expect(destacadosButton).toHaveAttribute("aria-pressed", "true");

    await expect(page.locator('a[href="/imperdibles/feria-textil-central"]')).toBeVisible();
    await expect(page.locator('a[href="/imperdibles/mirador-del-telar"]')).toBeVisible();

    await agendaButton.click();

    await expect(agendaButton).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('a[href="/imperdibles/demostracion-de-tintes"]')).toBeVisible();
  });

  test("opens a suggested journey from the journeys catalog", async ({ page }) => {
    await page.goto("/recorridos");

    await expect(page.getByRole("heading", { name: /Itinerarios sugeridos/i })).toBeVisible();

    await page.locator('a[href="/recorridos/recorrido-belen-catamarca"]').click();

    await expect(page).toHaveURL(/\/recorridos\/recorrido-belen-catamarca$/);
    await expect(
      page.getByRole("heading", { name: /Recorrido sugerido por Belen/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Momentos del recorrido/i })).toBeVisible();
  });

  test("allows toggling map layers", async ({ page }) => {
    await page.goto("/mapa");

    await expect(page.getByRole("heading", { name: /La ruta en el territorio/i })).toBeVisible();

    const actorsLayer = page.getByRole("button", { name: "Actores", exact: true });
    await expect(actorsLayer).toBeVisible();

    await actorsLayer.click();

    await expect(actorsLayer).not.toHaveClass(/bg-\[color:var\(--accent\)\]/);
  });
});
