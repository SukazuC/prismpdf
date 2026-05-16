# PrismPDF Pass 3: Server Walkthrough + Pre-Worker Agent Plan

## Executive assessment

The second-pass repo is substantially better than the first pass because it now has a workspace state layer, client-side PDF operation modules, dnd-kit support in organize, and a FastAPI worker skeleton. However, the app still feels unreliable because the user-facing workflows are not consistently wired to those foundations.

The highest-priority issue is not visual polish. It is flow integrity:

- A visible upload target must actually accept files.
- A tool page must let the user add, remove, and replace files without escaping to a generic upload page.
- A processing state must look and behave like the current operation is running, not like the app navigated away and lost context.
- Success must show one primary download action, not two competing download CTAs.
- Demo and mock assets must never be used inside real tool workflows once a user file exists.

The current app is close enough that pass 3 should not restart from scratch. It should harden the existing architecture and remove the remaining fake or awkward behavior.

---

## Brutal truth: what will work and what will not

### Can be made reliable before any server exists

These should be treated as the immediate product scope:

1. Merge PDF
2. Cut / extract pages
3. Organize pages
4. Convert PDF to JPG
5. Convert PDF to PNG
6. Extract PDF text to TXT
7. Real upload / remove / replace / add-more flows
8. Real processing and success flows for local operations
9. Better thumbnail and preview quality
10. Better home-page upload behavior

These are feasible because the browser can run `pdf.js` for reading/rendering previews and `pdf-lib` for many PDF-native operations.

### Cannot honestly be complete client-only

These should stay behind a worker requirement:

1. Compress PDF
2. Convert PDF to DOCX
3. Convert PDF to PPTX

The worker skeleton exists, but it is not production-ready yet. The browser client cannot reliably do Ghostscript/qpdf compression or high-fidelity DOCX/PPTX conversion. The correct answer is not to fake them. The correct answer is to disable them or label them as unavailable until the worker URL is configured and health-checked.

### Worker-result honesty

Even with the worker:

- Compression cannot guarantee every input becomes smaller. Some PDFs are already optimized. The app must report actual output size and savings after processing.
- DOCX conversion is best-effort. Complex layouts can degrade.
- PPTX conversion should be positioned as a visual slide deck conversion unless a much deeper editable-object conversion pipeline is added.

---

# Part 1: Server / Worker Walkthrough for a Novice

## Recommended deployment model

Use:

- Vercel for the Next.js frontend.
- Render for the FastAPI PDF worker.

Why:

- Vercel is simple and free for the frontend.
- Render can run a Docker-based service with system packages like Ghostscript and qpdf.
- The existing repo already has a `worker/` folder with a Dockerfile and FastAPI app.
- No database is needed.
- No object storage is needed for the first real version.
- Files can be processed per request and discarded.

## Why not put everything on Vercel?

The frontend belongs on Vercel. The PDF worker does not.

The worker needs native binaries and potentially CPU-heavy operations. It should live in a Docker-capable web service. Vercel is excellent for the Next.js app, but the worker should be a separate service.

## Render vs Railway

Render is the recommended beginner option for this project.

Railway is also viable, but its model is more usage-billing oriented after the trial. It is not complicated, but Render is simpler to reason about for a tiny PDF worker.

## Expected cost

Start with Render Free.

If cold starts or slow processing become annoying, upgrade only the worker to Render Starter. That is the likely first paid step.

For 10 users and small PDFs, this is enough. For large PDFs, heavy compression, or repeated conversions, Render Free may be too slow.

## What you need before deployment

Accounts:

1. GitHub account.
2. Vercel account.
3. Render account.

Local tools:

1. Node.js.
2. npm.
3. Docker Desktop.
4. Git.

Repo requirements:

1. The repo must be pushed to GitHub.
2. The frontend must build on Vercel.
3. The worker must build from `worker/Dockerfile` on Render.

---

## Step 0: Fix the worker before deploying it

The current worker is a useful skeleton but needs these changes before deployment.

### 0.1 Add CORS

The browser frontend and the worker are on different origins. The worker must explicitly allow the frontend domain.

In `worker/app/main.py`, add:

```py
import os
from fastapi.middleware.cors import CORSMiddleware

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length", "Content-Type"],
)
```

Why: without this, the browser may block requests even if the worker itself is healthy.

### 0.2 Bind to Render's port

Change `worker/Dockerfile` from a hardcoded port command to a command that respects Render's `PORT` variable.

Use:

```dockerfile
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

### 0.3 Keep `/health`

Render should use `/health` as the health check path.

Expected response:

```json
{"status":"ok"}
```

### 0.4 Fix compression fallback logic

Compression should compare output size against input size.

Rules:

- If compressed output is smaller: return compressed output.
- If compressed output is not smaller: return original or return a clear response saying no savings were possible.
- The frontend must show actual savings, not estimated savings.

### 0.5 Fix PPTX conversion page-count handling

Store the document page count before closing the PyMuPDF document.

Bad pattern:

```py
doc.close()
logger.info(len(doc))
```

Better pattern:

```py
page_count = len(doc)
doc.close()
logger.info(page_count)
```

### 0.6 Add clear output filenames

Every worker response should include a `Content-Disposition` header:

```txt
attachment; filename="compressed.pdf"
```

or:

```txt
attachment; filename="converted.docx"
```

The frontend can then infer the download name.

### 0.7 Keep file size limits conservative

Start with 50 MB max input size.

This avoids memory spikes. For a small free worker, that is enough.

---

## Step 1: Test the worker locally

From the repo root:

```bash
docker build -t prismpdf-worker ./worker
```

Then run it:

```bash
docker run --rm -p 8000:8000 \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  prismpdf-worker
```

Open this in your browser:

```txt
http://localhost:8000/health
```

You should see:

```json
{"status":"ok"}
```

If this fails, do not continue to Render yet.

---

## Step 2: Point the local frontend at the local worker

Create or edit `.env.local` in the repo root:

```env
NEXT_PUBLIC_PDF_WORKER_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Test:

1. Compress a small PDF.
2. Convert a small PDF to DOCX.
3. Convert a small PDF to PPTX.

Expected behavior:

- The browser should call `localhost:8000`.
- No CORS error should appear in the browser console.
- The download should produce a real file.
- The frontend should show actual output size after the worker returns.

---

## Step 3: Deploy the worker on Render

In Render:

1. Click **New**.
2. Choose **Web Service**.
3. Connect the GitHub repo.
4. Select the repo.
5. Set the service name, for example:

```txt
prismpdf-worker
```

6. Set the root directory:

```txt
worker
```

7. Use Docker deployment.
8. Select the Free instance type first.
9. Set the health check path:

```txt
/health
```

10. Add environment variable:

```env
ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app,http://localhost:3000
```

Later, when you add a custom domain, append it:

```env
ALLOWED_ORIGINS=https://YOUR-DOMAIN.com,https://YOUR-VERCEL-DOMAIN.vercel.app,http://localhost:3000
```

11. Deploy.

After it finishes, Render gives you a URL like:

```txt
https://prismpdf-worker.onrender.com
```

Open:

```txt
https://prismpdf-worker.onrender.com/health
```

You should see:

```json
{"status":"ok"}
```

Render Free can cold start after idle time. If the first request is slow, that is expected.

---

## Step 4: Deploy the frontend on Vercel

In Vercel:

1. Click **Add New Project**.
2. Import the GitHub repo.
3. Framework preset: Next.js.
4. Add environment variable:

```env
NEXT_PUBLIC_PDF_WORKER_URL=https://prismpdf-worker.onrender.com
```

Use your actual Render worker URL.

5. Deploy.

After deployment, open the Vercel app and test:

1. Home upload.
2. Merge local operation.
3. Cut local operation.
4. Organize local operation.
5. Convert to PNG/JPG/TXT local operation.
6. Compress worker operation.
7. Convert DOCX/PPTX worker operation.

---

## Step 5: What to do if something fails

### If the worker URL opens but the frontend cannot call it

Likely CORS.

Check:

- `ALLOWED_ORIGINS` contains the exact Vercel domain.
- No trailing slash in origins.
- The frontend is using `https://`, not `http://`.

### If Render deploy fails

Likely port or Docker build.

Check:

- Dockerfile CMD uses `${PORT:-8000}`.
- App binds to `0.0.0.0`.
- Render root directory is `worker`.
- `worker/requirements.txt` is correct.

### If compression times out or is too slow

Likely Free instance limits.

Options:

1. Reduce max file size.
2. Keep compression disabled for large files.
3. Upgrade worker to Render Starter.

### If DOCX looks imperfect

Expected. PDF to editable Word is inherently lossy. The UI should say "best-effort Word conversion".

### If PPTX is not editable

Expected if using image-per-slide conversion. The UI should say "visual PowerPoint deck".

---

# Part 2: What the Agent Can Fix Before the Server Exists

This is the work that should be done now, before pass 3 worker deployment.

## Pass 3 goal

Make the application feel real and reliable for all browser-supported features, while clearly gating worker-only features.

The app should no longer feel like a mockup. It should feel like a working PDF tool with some advanced conversions temporarily unavailable until the worker is configured.

---

## Success criteria for pre-worker pass 3

### Global success criteria

1. Every visible upload/drop area accepts files or is visually not presented as a drop area.
2. The home page upload can start a real workflow.
3. Tool pages do not force the user back to `/upload` just to change files.
4. Users can remove and replace active files on convert, compress, cut, and organize pages.
5. Users can add more PDFs on merge without leaving the page.
6. Merge requires at least two PDFs before enabling processing.
7. Preview quality is visibly improved.
8. Real uploaded PDFs replace all mock/sample visuals in functional areas.
9. Processing routes do not flash or redirect to `/upload` during normal operation.
10. Success page has one dominant download button.
11. Worker-only features are disabled or labeled honestly when no worker URL exists.
12. Playwright tests prove real file upload, real processing, and real download for local operations.

---

# Phase A: Stabilize the architecture

## A1. Stop treating `/upload` as the mandatory gateway

Current problem:

- Many flows make the user feel like clicking a tool sends them backward to upload.
- `/upload` routes based on file type but does not reliably preserve uploaded file state.
- The user experiences a strange "upload page before success" pattern.

Required fix:

- Tool pages are the primary workflow pages.
- `/merge-pdf` handles merge intake.
- `/cut-pdf` handles cut intake.
- `/convert-pdf` handles convert intake.
- `/compress-pdf` handles compress intake.
- `/organize-pages` handles organize intake.
- `/upload` becomes optional: a universal smart intake hub, not a forced step.

Acceptance:

- Clicking `Merge PDF` in nav goes directly to `/merge-pdf`.
- Clicking `Convert PDF` goes directly to `/convert-pdf`.
- Starting an operation never routes through `/upload` unless the user explicitly chooses universal upload.

## A2. Create operation-scoped workspace behavior

Current problem:

- Workspace state is global.
- Files can leak conceptually from one tool to another.
- Empty states route to `/upload` too aggressively.

Required fix:

Add a concept of `activeOperation`:

```ts
type PdfOperation = "merge" | "compress" | "convert" | "cut" | "organize";
```

Workspace should track:

```ts
type WorkspaceState = {
  activeOperation?: PdfOperation;
  files: UploadedFile[];
  pages: PdfPage[];
  pendingTask?: ProcessingTask;
  result?: ResultFile;
};
```

When switching tools:

- If compatible files exist, ask silently through UI: "Use current PDF" / "Start fresh".
- For pass 3, simplest behavior: show an empty tool intake unless operation was started from a shared upload.

Acceptance:

- Visiting `/cut-pdf` after `/merge-pdf` does not accidentally show merge files unless the user intentionally keeps them.
- Removing the active file returns the same route to an empty state, not `/upload`.

## A3. Move generic utilities out of demo files

Current problem:

- `formatBytes` is imported from `demo-data.ts`.
- This suggests demo architecture is still leaking into production code.

Required fix:

Create:

```txt
src/lib/files/format-bytes.ts
```

Move `formatBytes` there.

Then remove imports from `demo-data.ts` in real components/pages.

Acceptance:

- `demo-data.ts` is not imported by any route or functional component.
- Demo files may exist only for storybook/dev placeholders, not production workflows.

---

# Phase B: Make upload/intake real everywhere

## B1. Replace the fake home dropzone

Current problem:

- The home page shows "Drop your PDF files here" but it is a `Link` to `/upload`.
- That breaks trust immediately.

Required fix:

Create a reusable component:

```tsx
<SmartPdfIntakeDropzone
  source="home"
  acceptedOperations={["merge", "compress", "convert", "cut", "organize"]}
/>
```

Behavior:

- If user drops one PDF:
  - Show a compact action chooser: Organize, Compress, Convert, Cut.
  - Default primary suggestion: Organize PDF.
- If user drops two or more PDFs:
  - Primary suggestion: Merge PDF.
  - Secondary: Organize first file, Compress each, Convert first.
- If user drops non-PDF image(s):
  - Suggest Convert to PDF only if supported. If not supported yet, show unsupported file message.
- If user clicks Choose PDF files:
  - Open file picker directly.
  - Do not route first.

Simpler MVP behavior:

- One PDF dropped: route to `/organize-pages` with file loaded.
- Multiple PDFs dropped: route to `/merge-pdf` with all files loaded.

Acceptance:

- Home page drop works.
- Home page click opens native file picker.
- Uploaded file arrives on destination page with thumbnails rendering.

## B2. Keep `/upload`, but redefine it

Recommendation:

Keep `/upload`, but make it a universal upload hub only.

It should be useful when the user says: "I have files, help me choose the right tool."

It should not be part of every normal tool flow.

Required behavior:

- `/upload` has a real dropzone.
- After upload, it shows available actions based on files.
- It does not auto-route immediately unless the intent is obvious.

Example:

- 1 PDF uploaded: show `Compress`, `Convert`, `Cut`, `Organize` action cards.
- 2+ PDFs uploaded: show `Merge PDF` as primary, plus `Organize first PDF`.

Acceptance:

- The user understands why they are on `/upload`.
- `/upload` is not a confusing intermediate page.

## B3. Create a shared `PdfSourcePanel`

Current problem:

- Convert, cut, compress, and organize do not expose consistent remove/replace controls.
- Merge's add-more control is visually present but dead.

Create:

```tsx
<PdfSourcePanel
  operation="convert"
  files={files}
  allowMultiple={false}
  minFiles={1}
  maxFiles={1}
  onAddFiles={...}
  onRemoveFile={...}
  onReplaceFile={...}
  onClearAll={...}
/>
```

Required controls:

- Remove file.
- Replace file.
- Add more files where allowed.
- Clear all / Start over.
- File metadata.
- Page count.
- Validation errors.

Acceptance:

- Convert has Remove and Replace.
- Compress has Remove and Replace.
- Cut has Remove and Replace.
- Organize has Replace and optional Add pages from PDF.
- Merge has Add PDFs and Remove per file.

## B4. Fix merge multi-upload

Current problem:

- Merge accepts multi-upload in initial intake, but editor state appears with one file and the add-more dropzone does nothing.

Required behavior:

- Initial merge intake allows multiple PDFs.
- If one PDF is uploaded, do not enter final merge-ready state. Show:

```txt
1 PDF uploaded. Add at least one more PDF to merge.
```

- The left sidebar `Add more PDFs` dropzone must call the same ingestion path as initial intake.
- Each source file row must have Remove.
- Merge button disabled until at least two PDFs exist.

Acceptance:

- User can upload one PDF, then add another from the merge page.
- User can upload three PDFs at once.
- User can remove one PDF and page groups update correctly.
- If only one PDF remains, merge button disables.

---

# Phase C: Improve preview quality and thumbnail architecture

## C1. Remove fixed low-quality thumbnail settings

Current problem:

- `THUMBNAIL_SCALE = 0.3`.
- Only first 8 pages are rendered.
- Large previews look unacceptable.

Required fix:

Use quality tiers.

```ts
type ThumbnailQuality = "grid" | "preview" | "export";

const THUMBNAIL_QUALITY = {
  grid: {
    targetCssWidth: 220,
    maxCanvasWidth: 420,
  },
  preview: {
    targetCssWidth: 520,
    maxCanvasWidth: 1200,
  },
  export: {
    scale: 2,
  },
};
```

Instead of a hardcoded PDF.js scale, compute based on desired rendered width and device pixel ratio.

## C2. Progressive rendering

Do not render every page at high quality immediately.

Recommended behavior:

1. Render first visible pages quickly at grid quality.
2. Render active preview page at preview quality.
3. Render additional pages lazily when near viewport.
4. Cache rendered thumbnails by:

```ts
fileId + pageNumber + rotation + quality
```

Acceptance:

- Merge page grid thumbnails look crisp enough at card size.
- Cut page large preview/range editor looks crisp.
- Convert source preview remains sharp.
- Later pages show placeholders until rendered, not broken images.

## C3. Render beyond first 8 pages

Current problem:

- Pages after the initial limit can have empty `thumbnailUrl`.

Required fix:

- Keep page metadata for all pages.
- Lazy-render thumbnails for pages as needed.
- Do not leave `img src=""`.

Acceptance:

- A 24-page PDF shows all pages with either real thumbnail or explicit loading skeleton.
- Scrolling triggers thumbnails to render.

---

# Phase D: Fix processing and success flow

## D1. Stop using `/upload` as a failure fallback during normal operation

Current problem:

- `/processing` redirects to `/upload` if pending task is missing.
- `/success` redirects to `/upload` if result is missing.
- This makes the app look broken when state is lost or transition timing is awkward.

Required behavior:

If no pending task:

- Show a clean empty-state card:

```txt
No active task
Start a new PDF task
```

Buttons:

- Go to tools.
- Upload files.
- Back home.

If no result:

- Show:

```txt
No completed file found
```

Buttons:

- Start another task.
- Go home.

Acceptance:

- No unexpected `/upload` redirect during normal workflows.
- Refreshing `/processing` or `/success` does not create a confusing jump.

## D2. Prefer in-place processing overlay for local operations

Recommended product behavior:

For fast local operations like merge/cut/organize/image conversion:

- Run the task in-place with a modal/overlay.
- Then navigate to `/success` once the result blob is ready.

For slower worker operations:

- `/processing` page can still be used.

Why:

- Local PDF operations often complete quickly.
- A full route transition can feel like the app lost the file.

Acceptance:

- Click Convert to JPG -> overlay says processing -> success page.
- No upload page appears.

## D3. Fix duplicate download actions

Current problem:

- Success page has a top Download button and a ResultFileCard download button.

Recommended UI:

- Keep one dominant primary button in the hero: `Download PDF` / `Download ZIP` / `Download DOCX`.
- In the result card, replace the second primary download with secondary metadata actions:
  - Copy file name.
  - Preview if available.
  - Download again as small text button only if needed.

Acceptance:

- There is one obvious primary download CTA.
- Result card does not compete with hero CTA.

## D4. Create a real `ResultArtifact` model

Current model should include:

```ts
type ResultArtifact = {
  id: string;
  operation: PdfOperation;
  fileName: string;
  mimeType: string;
  blobUrl: string;
  sizeBytes: number;
  pageCount?: number;
  fileCount?: number;
  createdAt: string;
  sourceSummary: string;
  workerUsed: boolean;
};
```

Acceptance:

- Success page renders based on actual result metadata.
- Download uses the actual blob URL.
- Cleanup revokes blob URL on reset.

---

# Phase E: Tool-specific remediation

## E1. Merge PDF

### Current shortcomings

- Cannot add more PDFs after entering editor.
- Merge button can be reached with one PDF.
- Preview quality is too low.
- File remove behavior is incomplete from the user's perspective.

### Required changes

1. Wire the sidebar `Add more PDFs` dropzone.
2. Keep editor visible for one PDF but show incomplete state.
3. Disable Merge until two PDFs are ready.
4. Add remove per file.
5. Remove corresponding pages when a file is removed.
6. Recompute global output index after every add/remove/reorder.
7. Improve preview quality with grid-tier thumbnails.
8. Preserve user page order in merge operation.

### Acceptance

- Upload 1 PDF -> app asks for another PDF.
- Add 2nd PDF -> merge enabled.
- Remove 2nd PDF -> merge disabled again.
- Reorder pages -> output order reflects reordered state.
- Downloaded PDF page count equals selected ordered pages.

## E2. Convert PDF

### Current shortcomings

- Best current workflow, but source file cannot be removed/replaced.
- DOCX/PPTX need worker.
- Output preview is not truly tied to generated output for all formats.

### Required changes

1. Add source panel controls: Remove, Replace, Start over.
2. If file is removed, stay on `/convert-pdf` and show empty intake.
3. Disable DOCX/PPTX if worker URL is missing.
4. Label DOCX/PPTX as worker-powered.
5. JPG/PNG/TXT remain enabled locally.
6. For JPG/PNG, generated output preview should use real rendered page image.
7. For TXT, preview first extracted text chunk.
8. Page range settings should affect actual output.

### Acceptance

- Upload PDF -> remove -> empty convert state.
- Replace PDF -> old pages disappear, new pages render.
- Convert to TXT downloads actual text.
- Convert to JPG/PNG downloads actual output.
- DOCX/PPTX unavailable without worker; available with healthy worker.

## E3. Cut PDF

### Current shortcomings

- Large preview quality is poor.
- No remove/replace/add workflow.
- User must go back to upload page.

### Required changes

1. Add source panel with Remove and Replace.
2. Improve preview quality to preview/grid tier.
3. Keep range input, timeline, selected thumbnails, and output summary synchronized.
4. When file changes, clear ranges and selection.
5. Validate out-of-range pages inline.
6. Generate real output PDFs using selected ranges.
7. If multiple ranges: output ZIP.
8. If one range: output PDF directly.

### Acceptance

- Remove file -> same route empty state.
- Replace file -> ranges reset.
- `1-3, 6-8` creates two outputs or a ZIP.
- Invalid `999` on 24-page document shows inline error.
- Large preview is crisp enough to read basic document structure.

## E4. Organize Pages

### Current state

This is the most structurally advanced page because dnd-kit is present.

### Required changes

1. Add replace file.
2. Add source remove/start-over.
3. Add "Add pages from another PDF" only if this can be implemented reliably.
4. Keep delete/rotate/duplicate actions wired to final output.
5. Add undo/redo for core actions if possible.
6. Improve thumbnails.

### Acceptance

- Drag reorder changes output order.
- Delete removes pages from output.
- Rotate affects output PDF.
- Duplicate duplicates page in output.
- Replacing file resets editor cleanly.

## E5. Compress PDF

### Current state

Should be worker-only.

### Before worker exists

1. Allow upload and preview source file.
2. Show compression settings.
3. Disable primary compress button if no worker URL or worker health check fails.
4. Message:

```txt
Compression requires the PrismPDF worker. Local merge, cut, organize, JPG, PNG, and TXT conversion are available now.
```

5. Do not estimate final output as if guaranteed.

### After worker exists

1. Enable compression.
2. Send file and settings to worker.
3. Download returned PDF.
4. Show actual original size, output size, and savings.
5. If output is not smaller, show honest message.

### Acceptance

- No fake compression success before worker.
- Worker-enabled compression produces a real downloadable file.

## E6. Tools page

### Recommendation

Keep `/tools`, but demote it.

It is useful for:

- SEO.
- Discovery.
- Future tools.
- Users who do not know which operation they need.

It should not be central to the main workflow.

Required changes:

1. Header nav can keep `All tools`, but not make it visually equal to core actions if it clutters.
2. `/tools` should act as a directory and smart upload hub.
3. Tool cards should route directly to tool pages.
4. Do not use `/tools` as a required step.
5. Consider renaming in nav to `Tools` or `All tools` depending on spacing.

Acceptance:

- The page has a clear purpose: browse and discover.
- It is not a confusing extra stop.

## E7. Navbar logo size

Current problem:

- PrismPDF brand appears too small.

Required change:

- Increase logo mark and text size.
- Target desktop brand height around 36-40px.
- Keep header height stable.

Acceptance:

- Logo reads clearly at desktop and tablet sizes.
- Header does not feel cramped.

---

# Phase F: Testing and QA

## F1. Add fixture PDFs

Create:

```txt
tests/fixtures/simple-3-page.pdf
tests/fixtures/simple-5-page.pdf
tests/fixtures/image-heavy.pdf
```

These should be small and committed to the repo.

## F2. Add Playwright upload tests

Required tests:

1. Home upload one PDF routes into a real tool with file loaded.
2. Home upload multiple PDFs routes to merge with all files loaded.
3. Merge two PDFs downloads output with correct page count.
4. Merge add-more PDFs works.
5. Merge remove PDF updates page count and disabled state.
6. Convert PDF to TXT downloads real text file.
7. Convert PDF to PNG/JPG downloads output.
8. Convert remove file returns to empty convert state.
9. Cut `1-2` downloads two-page PDF.
10. Cut invalid range shows inline error.
11. Organize reorder/delete/rotate downloads real PDF.
12. Success page has one primary download button.

## F3. Add visual screenshots with real uploaded PDFs

The current screenshots are not enough if they only show empty/demo states.

Generate screenshots for:

1. Home empty state.
2. Home after file selected/action chooser.
3. Merge with two real PDFs loaded.
4. Merge after add-more.
5. Convert with real PDF loaded.
6. Cut with real PDF and selected ranges.
7. Organize with real PDF pages.
8. Success after real local operation.

## F4. Unit tests

Add tests for:

1. Workspace reducer add/remove/replace files.
2. Page reindexing after remove/reorder.
3. Range parser edge cases.
4. Result artifact creation.
5. Worker availability logic.
6. Thumbnail cache key generation.

---

# Agent instruction summary

The pass 3 agent should not prioritize more decorative visuals until the product is functionally coherent.

The agent should focus in this order:

1. Real intake and file lifecycle.
2. Remove/replace/add controls.
3. High-quality progressive thumbnails.
4. Tool-specific real outputs for local operations.
5. Processing/success flow cleanup.
6. Worker gating and honest messaging.
7. Visual refinement only after the workflows are reliable.

The pass is successful only when a user can stay inside a tool, upload/replace/remove files, process a real document, download a real result, and never wonder whether the app is fake.
