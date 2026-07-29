import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Quick login via access code
    await page.goto("/login");
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("dashboard loads with sidebar navigation", async ({ page }) => {
    await expect(page.locator("aside, nav")).toBeVisible();
    // Check key nav items
    await expect(page.locator("text=Dashboard").or(page.locator("text=Create"))).toBeVisible();
  });

  test("navigate to settings page", async ({ page }) => {
    await page.locator('a[href*="settings"], button:has-text("Settings")').first().click();
    await expect(page).toHaveURL(/settings/, { timeout: 5000 });
    await expect(page.locator("text=Account Connections").or(page.locator("text=Profile"))).toBeVisible();
  });

  test("navigate to create page", async ({ page }) => {
    await page.locator('a[href*="create"], button:has-text("Create")').first().click();
    await expect(page).toHaveURL(/create/, { timeout: 5000 });
  });

  test("sidebar toggle on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Menu button should be visible on mobile
    const menuBtn = page.locator('button:has(svg)').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      // Sidebar should appear
      await expect(page.locator("aside, nav[role='navigation']")).toBeVisible();
    }
  });

  test("credit display visible", async ({ page }) => {
    await expect(page.locator("text=Credits")).toBeVisible();
  });
});
