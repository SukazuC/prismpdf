import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const REPORT_DIR = "reports/visual/latest";
const WINDOWS_LOCK_ERRORS = new Set(["EBUSY", "EACCES", "EPERM"]);
const SCREENSHOT_WRITE_ATTEMPTS = 5;
const SCREENSHOT_WRITE_DELAY_MS = 75;

const routes: [string, string][] = [
  ["home", "/"],
  ["upload", "/upload"],
  ["tools", "/tools"],
  ["merge", "/merge-pdf"],
  ["compress", "/compress-pdf"],
  ["convert", "/convert-pdf"],
  ["cut", "/cut-pdf"],
  ["organize", "/organize-pages"],
  ["processing", "/processing"],
  ["success", "/success"],
];

const viewports: [string, number, number][] = [
  ["desktop", 1586, 992],
  ["mobile", 390, 844],
];

function isWindowsLockError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    WINDOWS_LOCK_ERRORS.has(error.code)
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function writeFileWithRetry(filePath: string, buffer: Buffer) {
  for (let attempt = 1; attempt <= SCREENSHOT_WRITE_ATTEMPTS; attempt += 1) {
    try {
      await fs.promises.writeFile(filePath, buffer);
      return;
    } catch (error) {
      if (!isWindowsLockError(error) || attempt === SCREENSHOT_WRITE_ATTEMPTS) {
        throw error;
      }

      await delay(SCREENSHOT_WRITE_DELAY_MS * attempt);
    }
  }
}

async function writeScreenshot(stablePath: string, buffer: Buffer) {
  try {
    await writeFileWithRetry(stablePath, buffer);
    return stablePath;
  } catch (error) {
    if (!isWindowsLockError(error)) {
      throw error;
    }

    const parsedPath = path.parse(stablePath);
    const fallbackPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}-${Date.now()}${parsedPath.ext}`,
    );

    await writeFileWithRetry(fallbackPath, buffer);
    return fallbackPath;
  }
}

test.describe("visual smoke tests", () => {
  test.beforeAll(() => {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  });

  for (const [name, route] of routes) {
    for (const [viewportName, width, height] of viewports) {
      test(`${name} ${viewportName}`, async ({ page }) => {
        test.setTimeout(30000);

        await page.setViewportSize({ width, height });
        await page.goto(route, { waitUntil: "networkidle", timeout: 15000 });

        await page.waitForTimeout(1000);

        const screenshotPath = path.join(REPORT_DIR, `${name}-${viewportName}.png`);
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        const writtenScreenshotPath = await writeScreenshot(
          screenshotPath,
          screenshotBuffer,
        );

        expect(
          fs.existsSync(screenshotPath) || fs.existsSync(writtenScreenshotPath),
        ).toBeTruthy();
      });
    }
  }
});
