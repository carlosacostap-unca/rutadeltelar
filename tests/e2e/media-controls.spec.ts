import { expect, test } from "@playwright/test";

test.describe("media controls", () => {
  test("shows directional controls on public carousels", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Mover carrusel a la izquierda" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mover carrusel a la derecha" }).first(),
    ).toBeVisible();
  });
});
