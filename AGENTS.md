# PrismPDF — AGENTS.md

## Project identity

PrismPDF is a client-first PDF tool with a small FastAPI worker for compression and Office conversions. The frontend runs on Vercel, the worker on Render. No account system, no ads, no persistent storage.

**Live URLs:**
- Frontend: https://prispdf.vercel.app
- Worker: https://prismpdf.onrender.com
- GitHub: https://github.com/SukazuC/prismpdf

## Quick commands

```bash
npm run lint         # ESLint flat config (eslint.config.mjs)
npm run typecheck    # tsc --noEmit (separate from build)
npm run test         # Vitest — tests in src/test/*.test.ts
npm run build        # next build — must pass all the above first
npm run dev          # next dev on port 3000
npm run visual       # Playwright visual screenshots (20 routes × viewports)
npm run e2e          # Full Playwright test suite
npm run install-browsers  # npx playwright install chromium
```

**Required order:** `lint → typecheck → test → build`. Each must pass before the next.

## Framework quirks

- **Tailwind v4 CSS-first.** No `tailwind.config.ts`. Design tokens live in `src/app/globals.css` under `@theme inline {}`. Use `@import "tailwindcss"`. Utility classes work as expected.
- **No `next/font/google`.** Fonts are a CSS stack (`Inter, ui-sans-serif, ...`). Builds fully offline.
- **Next.js 16.2.6 / React 19.2.4.** App Router. The version is not a problem — standard APIs work.
- **`@/*` path alias** maps to `src/*` (configured in tsconfig.json and vitest.config.ts).

## Architecture

### Client-side operations (browser-only, no upload)

| Operation | Library | Entry |
|-----------|---------|-------|
| Merge PDF | pdf-lib | `src/lib/pdf/operations/merge-client.ts` |
| Cut/Extract/Split | pdf-lib | `src/lib/pdf/operations/cut-client.ts` |
| Organize Pages | pdf-lib | `src/lib/pdf/operations/organize-client.ts` |
| PDF → JPG/PNG | pdf.js canvas | `src/lib/pdf/operations/convert-images-client.ts` |
| PDF → TXT | pdf.js text layer | `src/lib/pdf/operations/extract-text-client.ts` |

### Worker-dependent operations (require `NEXT_PUBLIC_PDF_WORKER_URL`)

| Operation | Backend tooling | Worker file |
|-----------|----------------|-------------|
| Compress PDF | qpdf + Ghostscript | `worker/app/operations/compress.py` |
| PDF → DOCX | pdf2docx | `worker/app/operations/convert_docx.py` |
| PDF → PPTX | PyMuPDF + python-pptx | `worker/app/operations/convert_pptx.py` |

### Route map

```
/                → home (server component, embeds SmartPdfIntakeDropzone)
/upload          → universal upload hub (SmartPdfIntakeDropzone + tool cards)
/tools           → all tools directory
/merge-pdf       → merge editor (sortable, multi-file)
/compress-pdf    → compression (worker-gated)
/convert-pdf     → conversion (JPG/PNG/TXT local, DOCX/PPTX worker-gated)
/cut-pdf         → cut/split editor (range/extract/split modes)
/organize-pages  → organize editor (dnd-kit, undo/redo)
/processing      → task runner (real result, no fake timer)
/success         → result download (real blob URL)
```

### State model

Workspace is React context + useReducer in `src/lib/workspace/`:

```
workspace-types.ts   → WorkspaceFile, WorkspacePage, PendingTask, ResultArtifact
workspace-reducer.ts → 15 action types (filesAdded, pagesReordered, resultReady, etc.)
workspace-context.tsx → WorkspaceProvider + useWorkspace() hook
workspace-selectors.ts → getVisiblePages(), getActiveFile(), etc.
```

Task dispatch via `run-task.ts` routes operations to the correct client or worker runner.

## pdf.js worker

- **Version:** 5.7.284 (installed via npm, matches pdfjs-dist)
- **Worker file:** `public/pdf.worker.min.mjs` (copied from `node_modules/` by `scripts/copy-pdf-worker.mjs`)
- **Trigger:** `npm run postinstall` runs automatically after `npm install`
- **Usage:** `pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`
- **No CDN dependency.** All PDF.js rendering is local.

## Tests

- **Framework:** Vitest (config in `vitest.config.ts`)
- **Environment:** `node` (not jsdom — no browser DOM needed)
- **Location:** `src/test/*.test.ts`
- **Count:** 34 tests across 3 files:
  - `ranges.test.ts` — page range parser (15 tests)
  - `files.test.ts` — file validation (10 tests)
  - `operations.test.ts` — PDF merge/cut/organize on fixture PDFs (9 tests)
- **Fixture generator:** `src/lib/test-utils/create-fixture.ts` (creates PDFs with pdf-lib at test time)

Run a single file: `npx vitest run src/test/operations.test.ts`

### Playwright visual tests

- Config: `playwright.config.ts`
- Test file: `src/test/visual.spec.ts`
- Requires: Chromium installed (`npm run install-browsers`) and `npm run build` first
- Uses: `npm run start` as web server (production build, not dev)
- Generates: 20 screenshots in `reports/visual/latest/` (10 routes × desktop/mobile)

## Worker service

Docker-based FastAPI service at `worker/`:

```bash
docker build -t prismpdf-worker ./worker
docker run --rm -p 8000:8000 -e ALLOWED_ORIGINS="http://localhost:3000,https://prispdf.vercel.app" prismpdf-worker
```

Or via Docker Compose at repo root: `docker compose up`

### Worker API

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/health` | GET | — | `{"status":"ok"}` |
| `/compress` | POST | `file` (multipart), `level` (low/balanced/strong) | PDF |
| `/convert/docx` | POST | `file` (multipart) | DOCX |
| `/convert/pptx` | POST | `file` (multipart) | PPTX |

### CORS

Set `ALLOWED_ORIGINS` as a comma-separated env var. Default: `http://localhost:3000,https://prispdf.vercel.app`.

### Known worker pitfalls

- PPTX conversion saves page count BEFORE closing the document: `page_count = len(doc)` then `doc.close()`. Calling `len(doc)` after `close()` silently returns 0.
- Compression uses two-pass (qpdf then Ghostscript), picks the smallest result. If output > input, returns the qpdf restructured file.
- All responses include `Content-Disposition: attachment; filename="..."` headers.
- Max input size: 50 MB.

## ESLint

- Flat config (`eslint.config.mjs`). Not `.eslintrc`.
- Ignores: `.next/`, `out/`, `build/`, `public/`, `scripts/`, `next-env.d.ts`.
- Typical warnings: `@next/next/no-img-element` (prefer `<Image />` but `<img>` is tolerated for canvas-generated URLs).

## Deployment

- **Frontend:** Vercel. `vercel deploy --prod --yes`
- **Worker:** Render. Connects to GitHub, `worker/` root directory, Docker deployment, health check at `/health`.
- **Environment:** `NEXT_PUBLIC_PDF_WORKER_URL` must be set on Vercel for compress/DOCX/PPTX to work.
- **No database, no object storage.** Files are processed per-request and discarded.

## Key files map

| Purpose | Path |
|---------|------|
| Root layout | `src/app/layout.tsx` |
| Global CSS + design tokens | `src/app/globals.css` |
| Route pages | `src/app/<route>/page.tsx` |
| Workspace state | `src/lib/workspace/` |
| Task runner | `src/lib/tasks/run-task.ts` |
| PDF ops (client) | `src/lib/pdf/operations/` |
| Worker client | `src/lib/worker/worker-client.ts` |
| Shared components | `src/components/` (11 subdirectories) |
| Fixture PDF generator | `src/lib/test-utils/create-fixture.ts` |
| Vitest config | `vitest.config.ts` |
| Playwright config | `playwright.config.ts` |
| ESLint config | `eslint.config.mjs` |
| TypeScript config | `tsconfig.json` |
| Docker Compose | `docker-compose.yml` |
| Worker service | `worker/Dockerfile` + `worker/app/main.py` |
| pdf.js worker copy script | `scripts/copy-pdf-worker.mjs` |
