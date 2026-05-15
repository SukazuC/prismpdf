import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE = "reports/visual/pass4-audit";
const FILES = [
  "contact-mobile-375.html",
  "contact-mobile-430.html",
  "contact-tablet-768.html",
  "contact-desktop-1440.html",
  "contact-all.html",
];

for (const file of FILES) {
  test(`contact-sheet ${file}`, async ({ page }) => {
    test.setTimeout(60000);
    const filePath = path.resolve(BASE, file);
    if (!fs.existsSync(filePath)) {
      test.skip(true, `File not found: ${filePath}`);
      return;
    }
    await page.goto(`file://${filePath}`, { waitUntil: "networkidle", timeout: 15000 });
    // Wait for images to load
    await page.waitForTimeout(2000);
    const pngPath = path.resolve(BASE, file.replace(".html", ".png"));
    await page.screenshot({ path: pngPath, fullPage: true });
    console.log(`  Created ${path.basename(pngPath)}`);
  });
}
