import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/auth/signin");

  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@example.com");
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword123");

  await page.click('button[type="submit"]');

  await page.waitForURL("/");

  await page.context().storageState({ path: authFile });
});
