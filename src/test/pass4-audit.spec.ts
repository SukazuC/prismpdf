import { test, type Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE = "reports/visual/pass4-audit";
const FIXTURE_3 = path.resolve("test-fixture-3pages.pdf");
const FIXTURE_2 = path.resolve("test-fixture-2pages.pdf");

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

function shotDir(vp: string) {
  const d = path.join(BASE, vp);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function snap(page: Page, vp: string, name: string) {
  await page.waitForTimeout(800);
  const fp = path.join(shotDir(vp), `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`  snap [${vp}] ${name}`);
}

async function uploadPdf(page: Page, filePath: string) {
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles([filePath]);
  await page.waitForTimeout(3000);
}

async function clickText(page: Page, text: string) {
  await page.locator(`text="${text}"`).first().click();
  await page.waitForTimeout(400);
}

// ==============================================================
// For each viewport, run all tests
// ==============================================================
for (const vp of VIEWPORTS) {
  const { name: vpn, width, height } = vp;

  test.describe(`audit:${vpn}`, () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height });
    });

    // ---- Static routes (10) ----
    const routes: [string, string][] = [
      ["/", "home"],
      ["/upload", "upload"],
      ["/tools", "tools"],
      ["/merge-pdf", "merge"],
      ["/compress-pdf", "compress"],
      ["/convert-pdf", "convert"],
      ["/cut-pdf", "cut"],
      ["/organize-pages", "organize"],
      ["/processing", "processing"],
      ["/success", "success"],
    ];

    for (const [route, label] of routes) {
      test(`${label}-initial`, async ({ page }) => {
        await page.goto(route, { waitUntil: "networkidle", timeout: 20000 });
        await snap(page, vpn, `${label}-initial`);
      });
    }

    // ---- Home upload ----
    test("home-after-upload", async ({ page }) => {
      test.setTimeout(30000);
      await page.goto("/", { waitUntil: "networkidle", timeout: 15000 });
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "home-after-upload");
    });

    // ---- Merge flow (single serial-ish test) ----
    test("merge-flow", async ({ page }) => {
      test.setTimeout(90000);
      await page.goto("/merge-pdf", { waitUntil: "networkidle", timeout: 15000 });

      // Upload first file
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "merge-one-file");

      // Upload second file
      await uploadPdf(page, FIXTURE_2);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "merge-two-files");

      // Click Merge PDFs button
      const mergeBtn = page.locator('button:has-text("Merge PDFs")').first();
      await mergeBtn.click();
      await page.waitForURL("**/processing", { timeout: 10000 });
      await page.waitForTimeout(1500);
      await snap(page, vpn, "merge-processing");

      // Wait for task to complete and auto-navigate to /success
      await page.waitForURL("**/success", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);
      await snap(page, vpn, "merge-success");
    });

    // ---- Compress flow ----
    test("compress-flow", async ({ page }) => {
      test.setTimeout(30000);
      await page.goto("/compress-pdf", { waitUntil: "networkidle", timeout: 15000 });
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "compress-one-file");
      await snap(page, vpn, "compress-settings");
    });

    // ---- Convert flow ----
    test("convert-flow", async ({ page }) => {
      test.setTimeout(45000);
      await page.goto("/convert-pdf", { waitUntil: "networkidle", timeout: 15000 });
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "convert-one-file");

      // Click individual format buttons
      for (const fmt of ["JPG", "TXT"]) {
        const btn = page.locator(`button:has-text("${fmt}")`).first();
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(400);
          await snap(page, vpn, `convert-${fmt.toLowerCase()}-selected`);
        }
      }

      // Click DOCX (worker-required)
      const docxBtn = page.locator('button:has-text("DOCX")').first();
      if (await docxBtn.isVisible()) {
        await docxBtn.click();
        await page.waitForTimeout(400);
        await snap(page, vpn, "convert-docx-selected");
      }

      // Click Start over
      const startOver = page.locator('button:has-text("Start over")').first();
      if (await startOver.isVisible()) {
        await startOver.click();
        await page.waitForTimeout(600);
        await snap(page, vpn, "convert-start-over");
      }
    });

    // ---- Cut flow ----
    test("cut-flow", async ({ page }) => {
      test.setTimeout(40000);
      await page.goto("/cut-pdf", { waitUntil: "networkidle", timeout: 15000 });
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "cut-one-file");

      // Fill range input "1-3"
      const rangeInput = page.locator('input[type="text"]').first();
      await rangeInput.fill("1-3");
      await page.waitForTimeout(500);
      await snap(page, vpn, "cut-range-1-3");

      // Invalid range "999"
      await rangeInput.fill("999");
      await page.waitForTimeout(500);
      await snap(page, vpn, "cut-invalid-range");
    });

    // ---- Organize flow ----
    test("organize-flow", async ({ page }) => {
      test.setTimeout(40000);
      await page.goto("/organize-pages", { waitUntil: "networkidle", timeout: 15000 });
      await uploadPdf(page, FIXTURE_3);
      await page.waitForTimeout(2000);
      await snap(page, vpn, "organize-one-file");

      // Try to select the first page card
      const card = page.locator('[role="button"]').first();
      if (await card.isVisible()) {
        await card.click();
        await page.waitForTimeout(400);
        await snap(page, vpn, "organize-pages-selected");
      }

      await snap(page, vpn, "organize-toolbar");
    });

    // ---- Processing + Success empty states ----
    test("processing-empty", async ({ page }) => {
      await page.goto("/processing", { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(500);
      await snap(page, vpn, "processing-empty");
    });

    test("success-empty", async ({ page }) => {
      await page.goto("/success", { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(500);
      await snap(page, vpn, "success-empty");
    });
  });
}
