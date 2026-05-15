import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const REPORT_DIR = "reports/visual/latest";

const routes: [string, string][] = [
  ["home", "/"],
  ["upload", "/upload"],
  ["tools", "/tools"],
  ["merge", "/merge-pdf"],
  ["compress", "/compress-pdf"],
  ["convert", "/convert-pdf"],
  ["cut", "/cut-pdf"],
  ["organize", "/organize-pages"],
  ["processing", "/processing?operation=merge&fileName=test.pdf&next=/success"],
  ["success", "/success?fileName=test.pdf&operation=merge"],
];

const viewports: [string, number, number][] = [
  ["desktop", 1586, 992],
  ["mobile", 390, 844],
];

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
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        expect(fs.existsSync(screenshotPath)).toBeTruthy();
      });
    }
  }
});
