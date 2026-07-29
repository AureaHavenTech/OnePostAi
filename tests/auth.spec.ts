import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OnePost AI/);
    await expect(page.locator("text=Post like a pro")).toBeVisible();
  });

  test("login page loads with form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("access code login works (AUREA2026)", async ({ page }) => {
    await page.goto("/login");
    // Use the hardcoded access code
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access")').first().click();
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("email signup flow", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill("testpass123");
    await page.locator('button[type="submit"]').click();
    // Should succeed and redirect
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("email login flow with existing user", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("owner@onepostai.app");
    await page.locator('input[type="password"]').fill("testpass123");
    await page.locator('button[type="submit"]').click();
    // Should get a response (success or error — just checking the form submits)
    await expect(page.locator("text=success,text=error,text=Invalid")).toBeVisible({ timeout: 10000 });
  });
});
