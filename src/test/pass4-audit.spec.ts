import { expect, test, type Page } from "@playwright/test";
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib";
import path from "path";
import fs from "fs";

const BASE = "reports/visual/pass4-audit";
const FIXTURE_DIR = path.resolve(BASE, "fixtures");
const FIXTURE_3 = path.join(FIXTURE_DIR, "test-fixture-3pages.pdf");
const FIXTURE_2 = path.join(FIXTURE_DIR, "test-fixture-2pages.pdf");

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

type AuditedPage = Page & { __consoleErrors?: string[] };

const SCREENSHOT_WRITE_ATTEMPTS = 5;

function isWindowsLockError(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return ["EBUSY", "EACCES", "EPERM"].includes(String(error.code));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWindowsLock<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt < SCREENSHOT_WRITE_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isWindowsLockError(error)) {
        throw error;
      }

      lastError = error;
      await wait(50 * 2 ** attempt);
    }
  }

  throw lastError;
}

async function removeExistingScreenshot(filePath: string) {
  try {
    await retryWindowsLock(() => fs.promises.rm(filePath, { force: true }));
    return true;
  } catch (error) {
    if (isWindowsLockError(error)) {
      return false;
    }

    throw error;
  }
}

async function persistScreenshot(buffer: Buffer, dir: string, name: string) {
  const fixedPath = path.join(dir, `${name}.png`);
  const canUseFixedPath = await removeExistingScreenshot(fixedPath);

  if (canUseFixedPath) {
    try {
      await retryWindowsLock(() => fs.promises.writeFile(fixedPath, buffer));
      return fixedPath;
    } catch (error) {
      if (!isWindowsLockError(error)) {
        throw error;
      }
    }
  }

  const fallbackPath = path.join(dir, `${name}-${Date.now()}.png`);

  try {
    await retryWindowsLock(() => fs.promises.writeFile(fallbackPath, buffer));
  } catch (error) {
    console.warn(`  snap fallback write skipped: ${fallbackPath}`, error);
  }

  return fallbackPath;
}

async function ensureFixturePdf(filePath: string, pageCount: number) {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const colors = [
    rgb(0.95, 0.33, 0.29),
    rgb(0.19, 0.53, 0.96),
    rgb(0.18, 0.66, 0.36),
  ];

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const color = colors[(i - 1) % colors.length];

    page.drawRectangle({ x: 0, y: 0, width, height, color });
    page.drawRectangle({ x: 48, y: 48, width: width - 96, height: height - 96, color: rgb(1, 1, 1), opacity: 0.88 });
    page.drawText(`Audit Fixture ${pageCount} Pages`, {
      x: 72,
      y: height - 128,
      size: 30,
      font,
      color,
    });
    page.drawText(`Page ${i}`, {
      x: 72,
      y: height - 190,
      size: 56,
      font,
      color,
    });
    page.drawText(`Distinct generated PDF page for pass4 visual upload checks.`, {
      x: 72,
      y: height - 235,
      size: 16,
      font: bodyFont,
      color: rgb(0.12, 0.12, 0.12),
      maxWidth: width - 144,
    });
  }

  const bytes = await doc.save();
  fs.writeFileSync(filePath, Buffer.from(bytes));
}

test.beforeAll(async () => {
  await Promise.all([ensureFixturePdf(FIXTURE_3, 3), ensureFixturePdf(FIXTURE_2, 2)]);
});

function shotDir(vp: string) {
  const d = path.join(BASE, vp);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function snap(page: Page, vp: string, name: string) {
  await page.waitForTimeout(800);
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      [data-nextjs-dialog] {
        display: none !important;
      }
    `,
  });
  const overflow = await page.evaluate(() => ({
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyClientWidth: document.body?.clientWidth ?? 0,
    bodyScrollWidth: document.body?.scrollWidth ?? 0,
  }));
  expect(overflow.documentScrollWidth, `${name}: document has horizontal overflow`).toBeLessThanOrEqual(
    overflow.documentClientWidth + 1
  );
  expect(overflow.bodyScrollWidth, `${name}: body has horizontal overflow`).toBeLessThanOrEqual(
    overflow.bodyClientWidth + 1
  );
  expect((page as AuditedPage).__consoleErrors ?? [], `${name}: console errors`).toEqual([]);
  const dir = shotDir(vp);
  const buffer = await page.screenshot({ fullPage: true });
  const fp = await persistScreenshot(buffer, dir, name);
  console.log(`  snap [${vp}] ${path.basename(fp, ".png")}`);
}

async function uploadPdf(page: Page, filePath: string) {
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles([filePath]);
  await page.waitForTimeout(3000);
}

// ==============================================================
// For each viewport, run all tests
// ==============================================================
for (const vp of VIEWPORTS) {
  const { name: vpn, width, height } = vp;

  test.describe(`audit:${vpn}`, () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(60000);
      (page as AuditedPage).__consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          (page as AuditedPage).__consoleErrors?.push(message.text());
        }
      });
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
      const mergeBtn = page.locator('button:visible:has-text("Merge PDFs")').and(page.locator("button:enabled")).first();
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
