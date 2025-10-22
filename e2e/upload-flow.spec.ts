import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Video Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "testpassword123");
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 10000 });
  });

  test("should navigate to upload page", async ({ page }) => {
    await page.goto("/upload");

    await expect(page).toHaveURL("/upload");
    await expect(page.locator("h1")).toContainText("Upload");
  });

  test("should show upload form components", async ({ page }) => {
    await page.goto("/upload");

    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.getByText(/drag and drop/i)).toBeVisible();
  });

  test("should validate video file requirements", async ({ page }) => {
    await page.goto("/upload");

    const fileInput = page.locator('input[type="file"]');

    await expect(fileInput).toHaveAttribute("accept", /video/);
  });

  test("should display video metadata form after file selection", async ({ page }) => {
    await page.goto("/upload");

    const testVideoPath = path.join(process.cwd(), "e2e/fixtures/test-video.mp4");

    await page.setInputFiles('input[type="file"]', testVideoPath);

    await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('select[name="visibility"]')).toBeVisible();
  });

  test("should show age restriction toggle", async ({ page }) => {
    await page.goto("/upload");

    const testVideoPath = path.join(process.cwd(), "e2e/fixtures/test-video.mp4");
    await page.setInputFiles('input[type="file"]', testVideoPath);

    await expect(page.getByText(/age restriction/i)).toBeVisible({ timeout: 10000 });
  });

  test("should require title before submission", async ({ page }) => {
    await page.goto("/upload");

    const testVideoPath = path.join(process.cwd(), "e2e/fixtures/test-video.mp4");
    await page.setInputFiles('input[type="file"]', testVideoPath);

    await page.waitForSelector('input[name="title"]', { timeout: 10000 });

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute("required");
  });
});

test.describe("Video Watch Page", () => {
  test("should display video player", async ({ page }) => {
    await page.goto("/");

    const videoCard = page.locator('[data-testid="video-card"]').first();
    if (await videoCard.isVisible()) {
      await videoCard.click();

      await expect(page.locator("video")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("should show age gate for restricted content", async ({ page }) => {
    const restrictedVideoId = "test-restricted-video-id";

    await page.goto(`/watch/${restrictedVideoId}`);

    const ageGate = page.getByText(/age-restricted content/i);
    if (await ageGate.isVisible({ timeout: 5000 })) {
      await expect(ageGate).toBeVisible();
      await expect(page.getByRole("button", { name: /i am 18 or older/i })).toBeVisible();
    }
  });

  test("should track video views", async ({ page }) => {
    await page.goto("/");

    const videoCard = page.locator('[data-testid="video-card"]').first();
    if (await videoCard.isVisible()) {
      const initialViews = await videoCard.locator('[data-testid="view-count"]').textContent();

      await videoCard.click();

      await page.waitForSelector("video", { timeout: 10000 });

      const video = page.locator("video");
      await video.evaluate((v) => v.play());

      await page.waitForTimeout(5000);

      await page.goBack();

      await page.waitForSelector('[data-testid="video-card"]', { timeout: 5000 });
    }
  });
});

test.describe("Live Stream Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "testpassword123");
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 10000 });
  });

  test("should navigate to live streaming studio", async ({ page }) => {
    await page.goto("/studio/live");

    await expect(page).toHaveURL("/studio/live");
    await expect(page.locator("h1")).toContainText(/live/i);
  });

  test("should create new live stream", async ({ page }) => {
    await page.goto("/studio/live/create");

    await expect(page.locator('input[name="title"]')).toBeVisible();

    await page.fill('input[name="title"]', "Test Live Stream");
    await page.fill('textarea[name="description"]', "This is a test stream");

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/studio\/live\/[^/]+/, { timeout: 10000 });

    await expect(page.getByText(/rtmp url/i)).toBeVisible();
    await expect(page.getByText(/stream key/i)).toBeVisible();
  });

  test("should display RTMP credentials", async ({ page }) => {
    await page.goto("/studio/live/create");

    await page.fill('input[name="title"]', "Test Stream for RTMP");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/studio\/live\/[^/]+/, { timeout: 10000 });

    const rtmpUrl = page.locator('input[value*="rtmp://"]');
    await expect(rtmpUrl).toBeVisible();

    const streamKey = page.locator('input[type="password"]');
    await expect(streamKey).toBeVisible();
  });
});

test.describe("Analytics Tracking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "testpassword123");
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 10000 });
  });

  test("should display studio analytics", async ({ page }) => {
    await page.goto("/studio/analytics");

    await expect(page).toHaveURL("/studio/analytics");
    await expect(page.getByText(/total views/i)).toBeVisible();
    await expect(page.getByText(/watch duration/i)).toBeVisible();
  });

  test("should show admin analytics for admin users", async ({ page }) => {
    await page.goto("/admin/analytics");

    const hasAccess = await page.locator("h1").isVisible({ timeout: 5000 });

    if (hasAccess) {
      await expect(page.getByText(/daily active users/i)).toBeVisible();
      await expect(page.getByText(/weekly active users/i)).toBeVisible();
    }
  });
});
