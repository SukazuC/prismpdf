import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const dest = resolve(__dirname, "../public/pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.error("pdf.worker.min.mjs not found at", src);
  process.exit(1);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("Copied pdf worker to", dest);
