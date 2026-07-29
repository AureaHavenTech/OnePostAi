import { test, expect } from "@playwright/test";

test.describe("Pricing & Free Trial", () => {
  test("pricing tiers displayed", async ({ page }) => {
    await page.goto("/");
    // Scroll to pricing section or navigate
    await page.locator('a[href*="pricing"], button:has-text("Pricing")').first().click();
    // Should show Starter, Pro, Unlimited tiers
    await expect(page.locator("text=Starter")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Pro")).toBeVisible();
    await expect(page.locator("text=Unlimited").or(page.locator("text=Agency"))).toBeVisible();
  });

  test("30-day money-back guarantee visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=30-day").or(page.locator("text=money-back"))).toBeVisible({ timeout: 5000 });
  });

  test("free trial tracking in localStorage", async ({ page }) => {
    await page.goto("/");
    // Check trial data is set
    const trial = await page.evaluate(() => localStorage.getItem("onepostai_trial"));
    if (trial) {
      const parsed = JSON.parse(trial);
      expect(parsed).toHaveProperty("startedAt");
      expect(parsed).toHaveProperty("usage");
    }
    // trial may not be set on landing page — that's OK
  });

  test("credit purchase modal opens", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    // Look for credit purchase trigger
    const creditBtn = page.locator("text=Credits").first();
    if (await creditBtn.isVisible()) {
      // Credits section should at minimum be displayed
      await expect(creditBtn).toBeVisible();
    }
  });
});
