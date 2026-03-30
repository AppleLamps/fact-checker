import { expect, test } from "@playwright/test";

test("submit pasted text and receive a completed result", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Paste text" }).fill(
    "This post claims the city banned gas stoves overnight."
  );
  await page.getByRole("button", { name: "Analyze post" }).click();

  await expect(page).toHaveURL(/\/check\//);
  await expect(
    page.getByRole("heading", { name: "Fact Check" }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Reply Draft" })
  ).toBeVisible();
});

test("submit url and see queued state", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "X link" }).fill(
    "https://x.com/example/status/123"
  );
  await page.getByRole("button", { name: "Analyze post" }).click();

  await expect(page).toHaveURL(/\/check\//);
  await expect(
    page.getByRole("heading", { name: /fact check is still running/i })
  ).toBeVisible();
});

test("render mixed-evidence result", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Paste text" }).fill(
    "Mixed evidence: the policy partly supports the claim but omits context."
  );
  await page.getByRole("button", { name: "Analyze post" }).click();

  await expect(page).toHaveURL(/\/check\//);
  await expect(
    page.getByRole("heading", {
      name: /mixed evidence: the policy partly supports the claim but omits context/i
    })
  ).toBeVisible();
  await expect(page.getByText(/missing denominator/i)).toBeVisible();
});
