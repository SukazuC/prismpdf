# PrismPDF Second-Pass Functional Remediation Plan

## Executive verdict

The first pass produced a coherent visual shell, but it did **not** produce a working PDF product. It produced a static/demonstration implementation with some useful primitives. The core failure is architectural: the app has no real document session, no real operation runner, no result store, no real download pipeline, and no tool page owns user-uploaded files.

The second pass must stop polishing mock screens and replace the demo architecture with a real file-processing architecture.

The brutally honest constraint is this:

- **Merge, cut/extract/split, organize/reorder/rotate/delete/duplicate, PDF-to-JPG, PDF-to-PNG, and selectable-text extraction can work client-side with high confidence.**
- **Real compression and DOCX/PPTX conversion cannot be honestly guaranteed as robust browser-only features.** A reliable implementation needs a server-side worker with Ghostscript/qpdf/PyMuPDF/pdf2docx/python-pptx/LibreOffice-class tooling. If a backend worker is not allowed, those features must be removed or clearly marked unavailable. Keeping them as fake UI is unacceptable.

Recommended second-pass target: **hybrid architecture**.

1. Browser-only for PDF-native operations where this is strong and privacy-positive.
2. A small containerized PDF worker for compression and Office-style conversions.
3. No account system, no ads, no pricing, no persistent storage.
4. Files processed transiently; client object URLs are revoked; worker temp files are deleted at the end of each request.

---

## What I inspected

Repository inspected from `firstpass.zip`.

Important files and directories reviewed:

```txt
package.json
next.config.ts
playwright.config.ts
src/app/layout.tsx
src/app/page.tsx
src/app/upload/page.tsx
src/app/tools/page.tsx
src/app/merge-pdf/page.tsx
src/app/compress-pdf/page.tsx
src/app/convert-pdf/page.tsx
src/app/cut-pdf/page.tsx
src/app/organize-pages/page.tsx
src/app/processing/page.tsx
src/app/success/page.tsx
src/components/**
src/lib/pdf/**
src/lib/ranges/parse-ranges.ts
src/lib/files/validate-files.ts
src/lib/demo-data.ts
src/test/**
public/assets/**
reference-images/**
```

Validation I ran locally:

```txt
npm ci:          success
npm run lint:   success, 7 warnings
npm typecheck:  success
npm test:       success, 25 tests
npm run build:  failed in the sandbox because next/font/google attempted to fetch Geist/Geist Mono from Google Fonts
```

The agent report claimed 20 Playwright screenshots were generated, but `firstpass.zip` did **not** include `reports/visual/latest`. I regenerated static visual screenshots from the rendered HTML/CSS for all 10 routes and 2 viewports using local Chromium. This was enough to audit layout direction, but it is not a substitute for hydrated Playwright screenshots. The local Playwright test itself failed because the Playwright browser binary was not installed in the zip environment.

---

## First-pass shortcomings to account for

### 1. The app is demo-driven, not file-driven

Current evidence:

```txt
src/app/merge-pdf/page.tsx imports demoFiles and demoPages
src/app/compress-pdf/page.tsx imports demoPages and uses hardcoded 4.2 MB
src/app/convert-pdf/page.tsx imports demoPages and hardcodes Annual Report 2024.pdf
src/app/cut-pdf/page.tsx imports demoPages
src/app/organize-pages/page.tsx imports demoPages
src/app/success/page.tsx uses mockResult and downloadUrl="#"
```

Impact:

- Uploading a file does not create a real editable document workspace.
- Tool pages do not use the user's file.
- The success page cannot download the processed output.
- The app can look complete while being functionally empty.

### 2. PDF utilities exist as isolated library functions but are not wired

Current evidence:

```txt
src/lib/pdf/client-operations.ts exports mergePdfFiles, extractPages, organizePdf
src/lib/pdf/render-thumbnails.ts exports renderThumbnails and renderPageToImage
No route page imports mergePdfFiles, extractPages, organizePdf, renderThumbnails, or renderPageToImage
```

Impact:

- The core PDF logic is dead code.
- Buttons route to fake processing instead of executing operations.
- Tests do not prove end-to-end utility behavior.

### 3. Processing and success pages are fake

Current behavior:

```txt
/processing increments a timer for 4 seconds
/success reads fileName and operation from query params
/success renders downloadUrl="#"
```

Impact:

- The user cannot download the generated file.
- The app can claim success without doing work.
- Cancelling only redirects; no task cleanup exists.

### 4. Drag-and-drop is missing

Current evidence:

```txt
package.json has no @dnd-kit dependency
src/components/editor/PdfPageGrid.tsx maps pages normally
No sortable context, sensors, arrayMove, keyboard reordering, or order mutation exists
```

Impact:

- Merge and Organize do not satisfy core editor behavior.
- Visual drag handles are misleading.

### 5. pdf.js worker config is brittle

Current evidence:

```ts
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
```

Problems:

- Installed `pdfjs-dist` is `^5.7.284`, but the worker URL points to `3.11.174`.
- It depends on a public CDN.
- It breaks offline/dev environments and is version-mismatched.

### 6. The privacy copy is not coherent

Current pages claim variations of:

```txt
Your files stay in your browser.
Encrypted in transit.
All uploads use TLS encryption.
Cloud Processing.
```

Those claims cannot all be true for every operation. The product must distinguish:

- Browser-local operations.
- Worker-processed operations.
- Future unsupported operations.

### 7. Build is not robust offline/CI

Current `src/app/layout.tsx` imports fonts from `next/font/google`. In the sandbox, `npm run build` failed because it attempted a Google Fonts fetch. This must be removed or replaced by self-hosted fonts or CSS font stacks.

### 8. Visual implementation is acceptable as a base, but weaker than reference

Regenerated static screenshots show:

- Current desktop pages are more sparse and flatter than the references.
- The reference screenshots have stronger neon atmospheric bands, more dimensional document previews, tighter editor chrome, and more premium information density.
- Current editor page thumbnails become generic white page slabs when image assets are missing or when real thumbnails are not wired.
- The first pass visually overfits demo thumbnails but does not transition to real uploaded PDFs.

This pass should prioritize functionality, but real thumbnails and real uploaded file state will also improve visual credibility.

---

## Non-negotiable second-pass goals

### Goal A: Remove fake document state from all functional pages

Functional pages must not initialize from `demoFiles` or `demoPages`.

Allowed use of demo/mock assets:

- Marketing hero decoration.
- Empty-state example illustrations if clearly decorative.
- Test fixtures.

Not allowed:

- Tool pages pretending `Annual Report 2024.pdf` is the user's file.
- Success page pretending an output exists.
- Processing page completing without an operation result.

Success criteria:

```txt
grep -R "demoFiles\|demoPages\|mockResult\|Annual Report 2024" src/app src/components
```

must return no hits in functional tool pages except explicitly named visual demo components or test-only files.

### Goal B: Add a real workspace/session model

A selected file must flow from Upload/Dropzone into the actual editor page, then into processing, then into success/download.

Success criteria:

- Upload a PDF on `/upload` or a tool page.
- The target editor renders real thumbnails from that PDF.
- The page count and file size match the uploaded file.
- The selected operation consumes the uploaded file object, not a placeholder.

### Goal C: Make every exposed primary feature produce a real downloadable output

Primary features:

```txt
Merge PDF
Cut PDF
Organize pages
Compress PDF
Convert PDF to JPG
Convert PDF to PNG
Convert PDF to TXT
Convert PDF to DOCX
Convert PDF to PPTX
```

Success criteria:

- Every enabled primary CTA triggers real processing.
- The success page has a real `blob:` or worker-returned URL.
- Clicking download saves a non-empty file with the correct extension.
- The output file opens with a normal viewer or has verifiable structure in tests.

### Goal D: Use the right execution target per operation

Client-side operations:

```txt
merge
cut/extract/split
organize export
PDF to JPG
PDF to PNG
PDF to TXT for selectable text
```

Worker-side operations:

```txt
compress
PDF to DOCX
PDF to PPTX
optional OCR later
```

Success criteria:

- Browser-local operations do not upload files anywhere.
- Worker operations clearly state transient server processing.
- If `NEXT_PUBLIC_PDF_WORKER_URL` is missing, worker-required CTAs are disabled with a clear message rather than faked.

### Goal E: Add end-to-end proof

The project must include tests that upload fixture PDFs and verify actual downloads/results.

Success criteria:

- Unit tests cover range parsing, validation, and PDF operation functions.
- Playwright tests cover real user flows with fixture PDFs.
- `npm run build` must pass without network fetches.
- Playwright screenshots are written to `reports/visual/latest` and included in handoff artifacts.

---

## Refined architecture

## 1. Frontend stack

Keep the existing stack with targeted changes:

```txt
Next.js App Router
React
TypeScript
Tailwind CSS / CSS variables
pdfjs-dist
pdf-lib
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
jszip
```

Do not add a global state library unless needed. A React context with `useReducer` is sufficient and easier for a coding agent to reason about.

Add dependencies:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities jszip
```

Optional, only if wanted:

```bash
npm install clsx
```

## 2. Backend worker stack

Add a minimal containerized worker under:

```txt
worker/
  Dockerfile
  requirements.txt
  app/main.py
  app/operations/compress.py
  app/operations/convert_docx.py
  app/operations/convert_pptx.py
  app/utils/tempfiles.py
  app/utils/filenames.py
```

Recommended worker tools:

```txt
FastAPI
Uvicorn
PyMuPDF / fitz
pikepdf
python-pptx
pdf2docx
Ghostscript CLI
qpdf CLI
LibreOffice CLI if available and needed for fallback conversions
```

Worker API:

```txt
GET  /health
POST /compress
POST /convert/docx
POST /convert/pptx
```

Keep it synchronous for MVP. Do not build a queue unless large-file timeouts force it. Simpler is more reliable for this stage.

Worker behavior:

1. Accept `multipart/form-data`.
2. Write to a request-scoped temp directory.
3. Run operation.
4. Return binary file response.
5. Delete temp directory in `finally`.

Security and privacy constraints:

```txt
No persistent uploads.
No account IDs.
No third-party file APIs.
No logs containing filenames unless development mode explicitly enabled.
Max file size enforced at worker and frontend.
Temp directory cleanup guaranteed.
```

## 3. Shared workspace provider

Add:

```txt
src/app/providers.tsx
src/lib/workspace/workspace-context.tsx
src/lib/workspace/workspace-reducer.ts
src/lib/workspace/workspace-types.ts
src/lib/workspace/workspace-actions.ts
src/lib/workspace/result-store.ts
```

Wire provider into `src/app/layout.tsx`.

Target state model:

```ts
export type WorkspaceFile = {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  mimeType: string;
  pageCount: number;
  status: "queued" | "reading" | "ready" | "error";
  error?: string;
};

export type WorkspacePage = {
  id: string;
  fileId: string;
  sourceFileName: string;
  sourcePageIndex: number; // 1-based
  outputIndex: number;     // 0-based current order
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  rotation: 0 | 90 | 180 | 270;
  deleted?: boolean;
};

export type PendingTask = {
  id: string;
  operation: "merge" | "cut" | "organize" | "compress" | "convert";
  settings: Record<string, unknown>;
  createdAt: number;
};

export type ResultArtifact = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  objectUrl: string;
  operation: string;
  createdAt: number;
};

export type WorkspaceState = {
  files: WorkspaceFile[];
  pages: WorkspacePage[];
  selectedPageIds: string[];
  activeFileId?: string;
  pendingTask?: PendingTask;
  result?: ResultArtifact;
  errors: string[];
};
```

Object URL rules:

- Thumbnail URLs are revoked when a file is removed or workspace resets.
- Result object URL is revoked when starting a new task or leaving the success state.
- Do not put `File`, `Blob`, or object URLs into localStorage.
- Persist only recoverable metadata in sessionStorage if needed.

## 4. Intake pipeline

Add:

```txt
src/components/pdf/DocumentIntake.tsx
src/lib/pdf/read-pdf-document.ts
src/lib/pdf/page-model.ts
src/lib/pdf/thumbnail-cache.ts
```

`DocumentIntake` responsibilities:

1. Accept operation-specific constraints.
2. Validate file extension, MIME, size, and count.
3. Read page count via pdf.js.
4. Render thumbnails progressively.
5. Dispatch `filesReady` and `pagesReady` into workspace state.
6. Surface per-file errors.

Operation constraints:

```ts
const operationConstraints = {
  merge: { accept: [".pdf"], multiple: true, minFiles: 2 },
  compress: { accept: [".pdf"], multiple: false, minFiles: 1 },
  convert: { accept: [".pdf"], multiple: false, minFiles: 1 },
  cut: { accept: [".pdf"], multiple: false, minFiles: 1 },
  organize: { accept: [".pdf"], multiple: false, minFiles: 1 },
};
```

Upload flow:

```txt
/upload
  user uploads file(s)
  if user has not picked a tool, show operation selector
  user picks operation
  workspace stores files/pages
  route to editor

/tool page directly
  if workspace has valid files for operation, show editor
  else show operation-specific upload empty state
```

No page should require a demo file to render.

---

## Operation implementation plan

## 1. Merge PDF

Current state:

- Uses `demoFiles` and `demoPages`.
- Upload handler ignores accepted files.
- Merge button routes to fake processing.
- Page drag handles are visual-only.

Required changes:

1. Replace initial state with workspace state.
2. If no files, render `DocumentIntake` configured for merge.
3. After upload, render file rows and page grid from workspace pages.
4. Add sortable page grid using dnd-kit.
5. Add file-level reordering and page-level reordering if feasible. Minimum: page-level order must work.
6. On merge CTA, create pending task with ordered non-deleted pages.
7. Navigate to `/processing`.
8. `/processing` calls the real merge runner.
9. Store result blob and object URL.
10. Navigate to `/success`.

Implementation details:

```txt
src/lib/pdf/operations/merge-client.ts
```

Pseudo-flow:

```ts
export async function mergeWorkspacePages(files, pages): Promise<Blob> {
  const byFileId = new Map(files.map(f => [f.id, f.file]));
  const loaded = new Map<string, PDFDocument>();
  const out = await PDFDocument.create();

  for (const page of pages.filter(p => !p.deleted).sort(by outputIndex)) {
    let sourceDoc = loaded.get(page.fileId);
    if (!sourceDoc) {
      sourceDoc = await PDFDocument.load(await byFileId.get(page.fileId)!.arrayBuffer(), { ignoreEncryption: true });
      loaded.set(page.fileId, sourceDoc);
    }
    const [copied] = await out.copyPages(sourceDoc, [page.sourcePageIndex - 1]);
    if (page.rotation) copied.setRotation(degrees(page.rotation));
    out.addPage(copied);
  }

  return new Blob([await out.save()], { type: "application/pdf" });
}
```

Success criteria:

- Upload two fixture PDFs.
- Thumbnails appear grouped by source or in merged order.
- Drag page 2 before page 1.
- Click merge.
- Downloaded PDF page count equals selected output page count.
- Output page order matches UI order in test fixtures.

## 2. Cut PDF

Current state:

- Uses 12 demo pages.
- Range parser is tested and mostly useful.
- Cut button routes to fake processing.
- `extract selected pages` and `split every N pages` are UI modes but incomplete.

Required changes:

1. Replace demo pages with uploaded workspace pages.
2. If no PDF, show `DocumentIntake` for one PDF.
3. Support all three methods:

```txt
Split by range:           each range becomes a separate PDF, returned as ZIP if multiple ranges
Extract selected pages:   selected pages become one PDF
Split every N pages:      chunks become separate PDFs, returned as ZIP
```

4. Range timeline and text input must stay synchronized.
5. CTA disabled until a valid method-specific selection exists.
6. Processing produces real file(s).

Add:

```txt
src/lib/pdf/operations/cut-client.ts
src/lib/files/zip-results.ts
```

Output naming:

```txt
source-name-pages-1-3.pdf
source-name-pages-6-8.pdf
source-name-extracted.pdf
source-name-split-001.pdf
source-name-split-002.pdf
```

Success criteria:

- Upload a 6-page fixture PDF.
- Input `1-2, 5`.
- Output ZIP contains two PDFs: 2 pages and 1 page.
- Extract selected pages produces one PDF with exact selected page count.
- Split every 2 pages produces 3 PDFs from a 6-page input.

## 3. Organize Pages

Current state:

- Uses demo annual report pages.
- Selection, delete, rotate, duplicate, undo/redo are partially local-state functional.
- Reordering is absent.
- Export routes to fake processing.

Required changes:

1. Replace demo pages with uploaded workspace pages.
2. Add `DocumentIntake` if no active file.
3. Keep existing rotate/delete/duplicate/undo-redo logic, but move it onto workspace pages or a local editor reducer that exports to workspace at task start.
4. Add dnd-kit reordering.
5. Export with `organizeWorkspacePdf` using current page order, rotation, deletion, duplicates.

Dnd-kit implementation target:

```txt
src/components/editor/SortablePdfPageGrid.tsx
src/components/editor/SortablePdfPageCard.tsx
```

Sensors:

```ts
useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)
```

On drag end:

```ts
if (active.id !== over.id) {
  const oldIndex = pages.findIndex(p => p.id === active.id);
  const newIndex = pages.findIndex(p => p.id === over.id);
  dispatch({ type: "pagesReordered", pages: arrayMove(pages, oldIndex, newIndex) });
}
```

Success criteria:

- Upload a fixture PDF.
- Drag last page to first.
- Rotate a selected page.
- Delete one page.
- Duplicate one page.
- Export.
- Output page count and order match editor state.
- Undo/redo works after delete and reorder.

## 4. Convert PDF

Current state:

- Source file is hardcoded.
- JPG/PNG are labeled ready but do not process anything.
- TXT/DOCX are preview/demo.
- PPTX is coming soon.

Required changes:

1. Replace source with uploaded PDF.
2. Define conversion formats honestly:

```txt
JPG:  client-side, each page rendered through pdf.js, ZIP when multiple pages
PNG:  client-side, each page rendered through pdf.js, ZIP when multiple pages
TXT:  client-side selectable text extraction through pdf.js; no OCR claim
DOCX: worker-side best-effort layout/text conversion
PPTX: worker-side page-as-slide image conversion for reliable visual fidelity
```

3. Remove all "preview mode" fake statuses from primary UX. Instead:

```txt
Browser-local: shown as Local
Worker-required: shown as Server processed
Unavailable worker: disabled with configuration message
```

4. Add page range support for conversion.
5. Use `JSZip` for multi-image outputs.

Client conversion files:

```txt
src/lib/pdf/operations/convert-images-client.ts
src/lib/pdf/operations/extract-text-client.ts
```

Worker conversion files:

```txt
src/lib/worker/worker-client.ts
worker/app/operations/convert_docx.py
worker/app/operations/convert_pptx.py
```

PPTX implementation recommendation:

- Render each PDF page to a PNG using PyMuPDF.
- Create one slide per page using `python-pptx`.
- Match slide dimensions to page aspect ratio.
- This is reliable visually, but not editable text. UI copy must say `Visual slide deck`.

DOCX implementation recommendation:

- Use `pdf2docx` for best-effort editable document output.
- If conversion fails, return a clear error rather than a fake result.

TXT implementation caveat:

- Works only for PDFs with extractable text.
- If no text is found, return an empty-state message: `No selectable text found. OCR is not available yet.`

Success criteria:

- JPG conversion downloads image for one-page fixture and ZIP for multi-page fixture.
- PNG conversion does the same.
- TXT conversion outputs actual text from a text fixture PDF.
- DOCX endpoint returns a non-empty `.docx` from worker.
- PPTX endpoint returns a non-empty `.pptx` from worker.

## 5. Compress PDF

Current state:

- Entirely simulated with hardcoded `4.2 MB` and estimated percentages.
- Preview uses demo thumbnail.
- No compression occurs.

Required changes:

1. Require one uploaded PDF.
2. Replace hardcoded stats with real file size.
3. Add worker-backed compression.
4. Use honest result reporting:

```txt
Original size: actual input bytes
Output size: actual result bytes
Savings: computed from actual result
If output is larger: show "No meaningful reduction was possible" and offer original/rebuilt output appropriately
```

Worker compression strategy:

- First attempt qpdf structural optimization:

```bash
qpdf --object-streams=generate --stream-data=compress input.pdf qpdf-output.pdf
```

- For balanced/strong modes, use Ghostscript with PDF settings:

```txt
low:      /printer or conservative settings
balanced: /ebook
strong:   /screen
```

- Strip metadata with pikepdf if requested.
- Choose the smallest successful output that does not fail validation.
- Return result plus metadata headers:

```txt
X-Original-Size
X-Output-Size
X-Compression-Method
```

Success criteria:

- Upload a real PDF.
- Compress returns a real PDF.
- Output opens.
- UI displays actual savings, not estimates.
- If savings <= 0, UI says so honestly.

---

## Processing and success redesign

## Current problem

`/processing` is an animation page detached from work. `/success` is a mock result page.

## Required model

Add:

```txt
src/lib/tasks/run-task.ts
src/lib/tasks/task-types.ts
src/lib/tasks/task-errors.ts
```

`runTask` dispatches by operation:

```ts
export async function runTask(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  switch (task.operation) {
    case "merge": return runMergeClient(state, task.settings);
    case "cut": return runCutClient(state, task.settings);
    case "organize": return runOrganizeClient(state, task.settings);
    case "convert": return runConvert(state, task.settings);
    case "compress": return runCompressWorker(state, task.settings);
  }
}
```

`/processing` behavior:

1. Read `pendingTask` from workspace.
2. If no pending task, redirect to `/upload` with message.
3. Start `runTask` exactly once using a ref guard.
4. Show real task status:

```txt
Preparing
Reading PDF
Processing
Creating download
Complete
```

5. On success:

```txt
dispatch({ type: "resultReady", result })
router.push("/success")
```

6. On failure:

```txt
show error panel
allow retry
allow go back to editor
```

`/success` behavior:

1. Read `result` from workspace.
2. If no result, redirect to `/upload`.
3. Download button uses `result.objectUrl`.
4. Show actual size, format, operation, generated-at.
5. Provide `Start another task`, which resets workspace and revokes URLs.

Success criteria:

- There is no successful route without a real result artifact.
- Download works.
- Re-running an operation revokes old result URLs.

---

## Visual remediation within functional pass

Functionality is the priority, but do these targeted visual fixes because they directly affect trust.

### 1. Empty states must be first-class

Every functional page must have a polished upload empty state, not a fake loaded document.

Template:

```txt
Title + concise tool promise
Glass upload vault
Operation-specific constraints
Privacy mode badge: Local or Worker processed
Small example strip below, clearly decorative
```

### 2. Real thumbnails must replace mock thumbnails

Once real thumbnail rendering is wired, editor pages will automatically feel more credible.

Rules:

- Show skeleton cards while thumbnails render.
- Show page count immediately after pdf.js loads the document.
- Render thumbnails progressively; do not block editor for a 300-page PDF.
- If thumbnail rendering fails for a page, show a branded fallback card with page number, not a blank white rectangle.

### 3. Keep the first-pass glass system, but avoid visual dishonesty

Do not show a full editor canvas with fake pages before upload. It trains the user not to trust the app.

### 4. Fix offline/build font issue

Replace `next/font/google` with CSS stack or self-hosted font assets.

Minimum fix:

```ts
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

In `globals.css`:

```css
:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

body { font-family: var(--font-sans); }
```

No external network dependency in build.

---

## Structural changes by file

### Delete or quarantine demo state

Move demo files out of runtime pages:

```txt
src/lib/demo-data.ts -> src/lib/dev/demo-data.ts
```

Rule:

- Runtime pages cannot import from `src/lib/dev/demo-data.ts`.
- Tests and decorative marketing-only components may import it if necessary.

### Add workspace files

```txt
src/app/providers.tsx
src/lib/workspace/workspace-context.tsx
src/lib/workspace/workspace-reducer.ts
src/lib/workspace/workspace-types.ts
src/lib/workspace/workspace-selectors.ts
src/lib/workspace/workspace-cleanup.ts
```

### Add operation runners

```txt
src/lib/pdf/operations/merge-client.ts
src/lib/pdf/operations/cut-client.ts
src/lib/pdf/operations/organize-client.ts
src/lib/pdf/operations/convert-images-client.ts
src/lib/pdf/operations/extract-text-client.ts
src/lib/pdf/operations/shared.ts
src/lib/files/zip-results.ts
src/lib/files/download.ts
src/lib/tasks/run-task.ts
```

### Replace fragile pdf.js worker

Preferred local worker setup:

```txt
public/pdf.worker.min.mjs
scripts/copy-pdf-worker.mjs
```

Package script:

```json
{
  "scripts": {
    "postinstall": "node scripts/copy-pdf-worker.mjs"
  }
}
```

`copy-pdf-worker.mjs` copies the worker from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.min.mjs`.

Then:

```ts
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

### Add sortable components

```txt
src/components/editor/SortablePdfPageGrid.tsx
src/components/editor/SortablePdfPageCard.tsx
```

Deprecate direct use of `PdfPageGrid` in merge/organize once sortable mode is needed.

### Add worker client

```txt
src/lib/worker/worker-client.ts
src/lib/worker/worker-errors.ts
```

Worker client shape:

```ts
export async function postWorkerFile(endpoint: string, formData: FormData): Promise<Blob> {
  const base = process.env.NEXT_PUBLIC_PDF_WORKER_URL;
  if (!base) throw new WorkerUnavailableError();
  const response = await fetch(`${base}${endpoint}`, { method: "POST", body: formData });
  if (!response.ok) throw await parseWorkerError(response);
  return await response.blob();
}
```

---

## Step-by-step execution plan

## Phase 0 - Stop the bleeding

Purpose: make the project honest and buildable before adding features.

Tasks:

1. Remove `next/font/google` from `src/app/layout.tsx`.
2. Add local/system font CSS in `globals.css`.
3. Add `npm run visual` script that actually generates screenshots using Playwright.
4. Add Playwright browser install note to README.
5. Move `src/lib/demo-data.ts` to `src/lib/dev/demo-data.ts`.
6. Remove demo imports from functional pages. Temporarily show upload empty states instead.
7. Ensure `npm run build` passes with no internet.

Acceptance:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

All pass.

## Phase 1 - Workspace and upload pipeline

Purpose: uploaded files become real editor state.

Tasks:

1. Add workspace provider and reducer.
2. Add `DocumentIntake`.
3. Replace upload page handler with real workspace dispatch.
4. Add page count extraction through pdf.js.
5. Add thumbnail rendering queue.
6. Add thumbnail fallback UI.
7. Add cleanup for object URLs.

Acceptance:

- Upload a PDF on `/upload`.
- Choose a tool.
- Route receives real workspace state.
- Editor page renders real filename, file size, page count, and thumbnails.

## Phase 2 - Real merge

Tasks:

1. Wire merge page to workspace.
2. Add sortable page grid.
3. Wire merge task.
4. Generate real merged PDF blob.
5. Success page downloads real result.

Acceptance:

- Two uploaded PDFs merge into one downloaded PDF.
- Page count is correct.
- Reordering changes output order.

## Phase 3 - Real cut/split

Tasks:

1. Wire cut page to workspace.
2. Complete all three modes.
3. Add ZIP output for multi-file results.
4. Wire task and success download.

Acceptance:

- Range extraction works.
- Split every N works.
- Output files contain correct page counts.

## Phase 4 - Real organize

Tasks:

1. Wire organize page to workspace.
2. Add dnd-kit reorder.
3. Ensure select/delete/rotate/duplicate update editor state.
4. Export actual organized PDF.
5. Add undo/redo for reorder and page actions.

Acceptance:

- Reorder, rotate, delete, duplicate, export all work.
- Output matches editor state.

## Phase 5 - Real JPG/PNG/TXT conversion

Tasks:

1. Wire convert page to workspace.
2. Add image conversion via pdf.js.
3. Add ZIP output for multiple images.
4. Add selectable text extraction.
5. Add page range support.

Acceptance:

- JPG download works.
- PNG download works.
- TXT download contains actual text for text-based fixture PDF.
- No OCR claim is made.

## Phase 6 - Worker service for compression and Office conversions

Tasks:

1. Add `worker/` FastAPI service.
2. Add Dockerfile and health endpoint.
3. Add `/compress` with qpdf/Ghostscript pipeline.
4. Add `/convert/docx` with pdf2docx.
5. Add `/convert/pptx` with PyMuPDF + python-pptx page-image slides.
6. Add frontend worker client.
7. Wire compress page to worker.
8. Wire DOCX/PPTX convert options to worker.
9. Add clear disabled/error states if worker is unavailable.

Acceptance:

- `docker compose up` starts frontend + worker.
- Compression returns a valid PDF.
- DOCX returns a valid `.docx`.
- PPTX returns a valid `.pptx`.
- Worker temp files are deleted after requests.

## Phase 7 - Processing/success real state

Tasks:

1. Replace query-param fake task with workspace pending task.
2. Replace timer-only progress with task execution lifecycle.
3. Add real error state and retry.
4. Replace success `mockResult` with workspace result.
5. Add preview/open/download/copy filename actions using actual artifact.

Acceptance:

- Success is unreachable without a result.
- Download is real.
- Failed operation does not route to success.

## Phase 8 - Tests and visual QA

Tasks:

1. Add test fixture generator using pdf-lib.
2. Add unit tests for each PDF operation.
3. Add Playwright tests that upload fixtures and verify downloads.
4. Generate hydrated screenshots for all routes after real upload flows.
5. Compare against references and tune only after functionality passes.

Acceptance:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
npm run visual
```

All pass. `reports/visual/latest` exists and contains 20 screenshots.

---

## Edge cases the second pass must handle

### File intake

- Empty file.
- Non-PDF renamed as `.pdf`.
- Password-protected/encrypted PDF.
- Corrupted PDF.
- PDF with zero readable pages.
- Very large PDF.
- Many-page PDF where thumbnail rendering must be progressive.
- Same file selected twice.
- Same file re-selected after removal.

### Workspace lifecycle

- Direct navigation to `/merge-pdf` with no files.
- Refresh editor page after selecting files. Files cannot be restored; show re-upload state honestly.
- Navigating back from processing to editor.
- Starting a new task after success.
- Removing a file revokes thumbnails.
- Failed operation leaves workspace recoverable.

### PDF operations

- Mixed page sizes.
- Rotated source pages.
- User-applied rotations.
- Duplicate pages.
- Deleted pages.
- Reordered pages across multiple files.
- Ranges that overlap.
- Ranges in reverse order, e.g. `8-3`.
- Split every N where final chunk is smaller.

### Downloads

- Single output PDF downloads as `.pdf`.
- Multi-output cut downloads as `.zip`.
- Multi-page image conversion downloads as `.zip`.
- One-page image conversion downloads as `.jpg` or `.png`.
- Success page download remains valid until workspace reset.

### Worker operations

- Worker unreachable.
- Worker returns error JSON.
- Worker returns oversized output.
- Compression output larger than input.
- DOCX/PPTX conversion failure.
- Temp cleanup after failure.

---

## Updated success criteria checklist

### Product-level

- [ ] No ads.
- [ ] No account requirement.
- [ ] No pricing prompts.
- [ ] Every enabled CTA does real work.
- [ ] No functional page uses fake PDF samples as active user documents.
- [ ] Privacy copy matches execution mode.
- [ ] User can download a real output file.

### Merge

- [ ] Upload multiple PDFs.
- [ ] Render real thumbnails.
- [ ] Reorder pages.
- [ ] Merge into real PDF.
- [ ] Download works.

### Cut

- [ ] Upload one PDF.
- [ ] Parse ranges.
- [ ] Timeline syncs with input.
- [ ] Extract selected pages.
- [ ] Split by ranges.
- [ ] Split every N pages.
- [ ] Download PDF or ZIP works.

### Organize

- [ ] Upload one PDF.
- [ ] Select pages.
- [ ] Reorder pages.
- [ ] Rotate pages.
- [ ] Delete pages.
- [ ] Duplicate pages.
- [ ] Undo/redo.
- [ ] Export real PDF.

### Compress

- [ ] Upload one PDF.
- [ ] Run worker compression.
- [ ] Show actual original/output sizes.
- [ ] Download real compressed PDF.
- [ ] Show honest no-savings state if applicable.

### Convert

- [ ] Upload one PDF.
- [ ] Convert to JPG.
- [ ] Convert to PNG.
- [ ] Extract TXT for selectable-text PDFs.
- [ ] Worker DOCX conversion.
- [ ] Worker PPTX conversion.
- [ ] Multi-file outputs ZIP correctly.

### Engineering

- [ ] `npm run build` works without internet.
- [ ] pdf.js worker is local and version-aligned.
- [ ] dnd-kit is installed and used where drag handles appear.
- [ ] Object URLs are revoked.
- [ ] Worker temp files are deleted.
- [ ] Tests include real fixture uploads and downloads.
- [ ] Playwright screenshots are generated and stored.

---

## Direct instructions for the coding agent

1. Do not add more mock screens.
2. Do not route to `/processing` unless a real `pendingTask` exists.
3. Do not route to `/success` unless a real `ResultArtifact` exists.
4. Do not use `demoFiles`, `demoPages`, or `mockResult` in functional pages.
5. Do not claim browser-local privacy for worker operations.
6. Do not keep visual drag handles unless actual reordering works.
7. Do not use a CDN pdf.js worker.
8. Do not leave `downloadUrl="#"` anywhere.
9. Do not mark DOCX/PPTX/compress as working without the worker path.
10. After each phase, run validation before moving on.

Phase validation command set:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After Playwright is wired:

```bash
npm run e2e
npm run visual
```

If a phase cannot meet its acceptance criteria, stop and report the exact blocker. Do not paper over it with UI copy or demo data.

---

## Final recommendation

Proceed with the second pass only if the project accepts a small worker service for compression and DOCX/PPTX. Without that, I would reduce the public feature set to browser-local tools:

```txt
Merge PDF
Cut PDF
Organize pages
PDF to JPG
PDF to PNG
PDF to TXT
```

That reduced browser-only product can be made highly reliable. The full advertised product requires the hybrid worker architecture above.
