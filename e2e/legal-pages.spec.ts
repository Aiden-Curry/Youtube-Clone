import { test, expect } from "@playwright/test";

test.describe("Legal Pages", () => {
  test("should display Terms of Service", async ({ page }) => {
    await page.goto("/legal/terms");

    await expect(page).toHaveURL("/legal/terms");
    await expect(page.locator("h1")).toContainText(/terms of service/i);
    await expect(page.getByText(/acceptance of terms/i)).toBeVisible();
  });

  test("should display Privacy Policy", async ({ page }) => {
    await page.goto("/legal/privacy");

    await expect(page).toHaveURL("/legal/privacy");
    await expect(page.locator("h1")).toContainText(/privacy policy/i);
    await expect(page.getByText(/information we collect/i)).toBeVisible();
    await expect(page.getByText(/gdpr/i)).toBeVisible();
  });

  test("should display Community Guidelines", async ({ page }) => {
    await page.goto("/legal/guidelines");

    await expect(page).toHaveURL("/legal/guidelines");
    await expect(page.locator("h1")).toContainText(/community guidelines/i);
    await expect(page.getByText(/respect and civility/i)).toBeVisible();
  });

  test("should show cookie consent banner", async ({ page }) => {
    await page.goto("/");

    const cookieBanner = page.getByText(/cookie consent/i);
    const isVisible = await cookieBanner.isVisible({ timeout: 5000 });

    if (isVisible) {
      await expect(cookieBanner).toBeVisible();
      await expect(page.getByRole("button", { name: /accept all/i })).toBeVisible();
    }
  });

  test("should link to legal pages from cookie banner", async ({ page }) => {
    await page.goto("/");

    const cookieBanner = page.getByText(/cookie consent/i);
    const isVisible = await cookieBanner.isVisible({ timeout: 5000 });

    if (isVisible) {
      const privacyLink = page.getByRole("link", { name: /privacy policy/i }).first();
      await expect(privacyLink).toBeVisible();
      await expect(privacyLink).toHaveAttribute("href", "/legal/privacy");
    }
  });
});
