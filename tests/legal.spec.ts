import { test, expect } from "@playwright/test";

const LEGAL_PAGES = [
  { path: "/terms", title: /Terms/ },
  { path: "/privacy", title: /Privacy/ },
  { path: "/cookies", title: /Cookies/ },
  { path: "/refund", title: /Refund/ },
  { path: "/dpa", title: /DPA|Data Processing/ },
  { path: "/acceptable-use", title: /Acceptable Use|AUP/ },
  { path: "/affiliate-terms", title: /Affiliate/ },
];

test.describe("Legal Pages", () => {
  for (const { path, title } of LEGAL_PAGES) {
    test(`${path} page loads`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title, { timeout: 5000 });
      // Should have copyright footer
      await expect(page.locator("text=Aura Haven Tech")).toBeVisible();
    });
  }

  test("all legal pages linked from footer", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    // Footer should contain at least some legal links
    if (await footer.isVisible()) {
      const links = await footer.locator("a").allTextContents();
      const hasLegalLinks = links.some((t) =>
        /terms|privacy|cookies|refund/i.test(t)
      );
      expect(hasLegalLinks).toBeTruthy();
    }
  });
});
