import { expect, test } from "@playwright/test";

test.describe("media controls", () => {
  test("shows hero controls only when a slide exists in that direction", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Ver hero anterior" }),
    ).toHaveCount(0);

    const rightButton = page.getByRole("button", {
      name: "Ver hero siguiente",
    });
    await expect(rightButton).toBeVisible();

    await rightButton.click();
    await expect(
      page.getByRole("button", { name: "Ver hero anterior" }),
    ).toBeVisible();
  });
});
