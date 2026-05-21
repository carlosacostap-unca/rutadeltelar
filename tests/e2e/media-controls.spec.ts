import { expect, test } from "@playwright/test";

test.describe("media controls", () => {
  test("shows carousel controls only when content exists in that direction", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Mover carrusel a la izquierda" }),
    ).toHaveCount(0);

    const rightButton = page.getByRole("button", {
      name: "Mover carrusel a la derecha",
    }).first();
    await expect(rightButton).toBeVisible();

    await rightButton.click();
    await expect(
      page.getByRole("button", { name: "Mover carrusel a la izquierda" }).first(),
    ).toBeVisible();
  });
});
