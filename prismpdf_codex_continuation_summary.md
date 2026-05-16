# PrismPDF Project Summary / Codex Continuation Context

This document summarizes the PrismPDF discussion and current project state so development can continue in Codex.

---

## 1. Product definition

PrismPDF is a premium PDF utility web app for workflows such as:

- Merge PDF
- Cut / extract PDF pages
- Organize PDF pages
- Compress PDF
- Convert PDF to JPG, PNG, TXT, DOCX, and PPTX

The product should be a clean, stylish, no-ads, no-account, no-paid-plan PDF website. The intended experience is substantially more polished than typical PDF utility websites.

Core positioning:

```txt
No ads
No signup
No pricing noise
Fast task completion
Clean premium interface
Strong privacy reassurance
Real functionality, not fake demo screens
```

Design language:

```txt
Dark glassmorphism
Deep navy/black background
Cyan, blue, violet, magenta neon prism accents
Luminous primary CTAs
Glass panels with gradient borders
Realistic PDF thumbnails
Premium spacing
Subtle animation
No generic dark SaaS look
```

The original front-end architecture handoff established these product and visual principles, including the need for reusable primitives, real thumbnails, intentional mobile adaptation, and strong upload UX.

---

## 2. Original architecture direction

The initial architecture plan recommended:

```txt
Framework: Next.js App Router
Language: TypeScript
Styling: Tailwind CSS + global CSS variables/classes
Client PDF reading/previews: pdf.js
Client PDF structural operations: pdf-lib
Drag/drop: @dnd-kit/core + @dnd-kit/sortable
Worker/backend: FastAPI Docker worker for compression and DOCX/PPTX
Frontend hosting: Vercel
Worker hosting: Render
```

Core routes:

```txt
/
/upload
/tools
/merge-pdf
/compress-pdf
/convert-pdf
/cut-pdf
/organize-pages
/processing
/success
```

Reusable UI primitives:

```txt
NeonBackdrop
GlassPanel
GradientButton
Dropzone
ToolCard
PdfThumbnailCard
EditorToolbar
StatCard
ProgressRing
```

The product should avoid page-specific one-off components where possible.

---

## 3. Pass 1 result and audit

Pass 1 created a visually coherent shell but was functionally weak.

Major problems found:

```txt
Tool pages used demo/mock PDFs.
Upload state was not connected to real editor workflows.
PDF operation functions existed but were mostly dead code.
Processing page was fake timer-based.
Success page had fake downloadUrl="#".
Drag handles were visual-only.
No real multi-file merge flow.
No real result artifact lifecycle.
```

Conclusion: Pass 1 looked promising but behaved like a visual prototype.

---

## 4. Pass 2 result and audit

Pass 2 improved the architecture substantially.

Improvements:

```txt
Workspace/state model added.
Client PDF operation modules added.
Real PDF reading/thumbnails introduced.
pdf-lib operation path created.
dnd-kit structure introduced.
FastAPI worker skeleton added.
Processing/success model improved.
Worker client added.
```

However, user testing exposed major issues:

```txt
Home page showed a dropzone but did not really upload.
Merge page could not add multiple PDFs properly.
Preview quality was poor.
Convert worked best but could not remove/replace uploaded file.
Cut partially worked but preview quality and file lifecycle were weak.
Tools page usefulness was questionable.
Navbar logo was too small.
Processing/success flow made the app look like it went back to upload before completion.
Duplicate download buttons existed.
```

Conclusion: Pass 2 moved the project toward real architecture but still had poor product coherence.

---

## 5. Server / worker decision

Features split into two categories.

### Browser-local features

These can work reliably in browser:

```txt
Merge PDF
Cut / extract pages
Organize pages
PDF to JPG
PDF to PNG
PDF to TXT for selectable-text PDFs
```

### Worker-required features

These should not be faked client-side:

```txt
Compress PDF
PDF to DOCX
PDF to PPTX
```

Chosen deployment model:

```txt
Frontend: Vercel
PDF worker: Render Web Service
Storage: none for now
Database: none for now
```

Reasoning:

```txt
Vercel is simple for the Next.js frontend.
Render can run a Docker/FastAPI worker with native tools.
No database or persistent storage is needed for a small project.
Files should be processed transiently and deleted after each request.
```

Important truthfulness constraints:

```txt
Compression may not always reduce file size.
DOCX conversion is best-effort.
PPTX conversion should be described as a visual slide deck if pages become slide images.
```

---

## 6. Pass 3 plan

Pass 3 was planned around real workflow repair.

Goals:

```txt
Fix fake home upload.
Make /upload a smart optional hub, not mandatory route.
Add real intake everywhere.
Add remove/replace/add-more file controls.
Fix merge multi-file behavior.
Improve processing/success flow.
Gate worker-only features honestly.
Keep /tools but demote it.
Increase navbar logo size.
```

---

## 7. Pass 3 reported result

The agent reported these updates.

### Worker fixes

```txt
worker/app/main.py:
- Added CORSMiddleware.
- Added ALLOWED_ORIGINS env var support.
- Added Content-Disposition headers.

worker/Dockerfile:
- Uses ${PORT:-8000}.

worker/app/operations/convert_pptx.py:
- Fixed page-count bug by moving len(doc) before doc.close().
```

### Architecture

```txt
activeOperation added to WorkspaceState.
operationChanged reducer action added.
formatBytes moved to src/lib/files/format-bytes.ts.
Remaining demo-data imports migrated.
```

### Intake

```txt
SmartPdfIntakeDropzone added.
Home fake Link dropzone replaced with real intake.
Upload page redefined with SmartPdfIntakeDropzone.
Merge add-more dropzone wired.
Merge button disabled with fewer than 2 ready files.
```

### Processing / success

```txt
Processing page no longer redirects to /upload if no task.
Success page no longer redirects to /upload if no result.
Duplicate download CTA removed from ResultFileCard.
ResultArtifact enriched with pageCount, fileCount, sourceSummary, workerUsed.
```

### Tool pages

```txt
Convert page got Start over.
Cut page got Start over.
Organize page got Start over.
Compress page got Start over and source display/remove.
Logo increased from h-7 to h-9.
```

### Deployment

```txt
GitHub repo: https://github.com/SukazuC/prismpdf
Render worker: https://prismpdf.onrender.com
Vercel frontend: https://prispdf.vercel.app
NEXT_PUBLIC_PDF_WORKER_URL set on Vercel.
Worker health reportedly verified.
CORS reportedly verified for https://prispdf.vercel.app.
Compress endpoint reportedly tested with HTTP 200.
```

---

## 8. Audit after Pass 3

After inspecting the Pass 3 zip, assessment was mixed.

### Resolved or improved

```txt
Home dropzone is mostly real now.
Merge multi-upload is much better.
Worker setup is structurally correct.
Processing/success no longer hard-redirect to /upload.
Duplicate success download CTA mostly resolved.
Logo size improved.
```

### Not fully resolved

```txt
Home still has some routing/intake awkwardness.
Single PDF auto-routes to organize-pages, which may be surprising.
Tools page upload banner still behaves more like a link than a true intake surface.
Convert has Start over but not true remove/replace file lifecycle.
Cut has Start over but not true remove/replace file lifecycle.
Preview quality remains poor.
Pages after first 8 may not have thumbnails.
Processing/success state is memory-only; refresh loses state/result.
activeOperation exists but appears underused.
```

### Important technical concerns

```txt
Thumbnail renderer still used low scale:
THUMBNAIL_SCALE = 0.3
MAX_INITIAL_PAGES = 8

Compression worker may still return larger file if qpdf output is bigger than original.

Frontend file limit and worker file limit may disagree:
Frontend often says 200 MB.
Worker uses about 50 MB.

Worker logs may include user filenames, which is not ideal for privacy.

Tests are real but shallow.
They do not fully prove drag/drop output order, worker behavior, CORS, downloaded content, visual quality, or mobile UX.
```

---

## 9. Docker / Render clarification

For the deployed production website:

```txt
Docker does NOT need to run on the user's PC.
Vercel hosts the frontend.
Render hosts the worker.
The user's PC can be off.
```

Docker is only needed locally if testing the worker on the developer machine.

Running the worker from a personal PC is possible but not recommended for public use because:

```txt
PC must stay on.
Internet must be stable.
Upload speed becomes server bandwidth.
Sleep/restart breaks service.
Public tunneling required.
Security becomes the user's responsibility.
CORS/HTTPS/tunnel URLs become annoying.
```

Render remains the recommended setup for this small-scale project.

---

## 10. Current major issue: mobile responsiveness

User checked mobile and found it very poor.

Current priority before Pass 4:

```txt
Do not break desktop, which user mostly likes.
Make mobile responsive properly.
Do not just squeeze desktop editors.
Use mobile-specific layouts.
```

Original design direction for mobile:

```txt
Header nav collapses.
Upload CTA remains visible.
Hero becomes single-column.
Floating docs hidden/reduced.
Tool cards one column.
Sidebars become drawers or stacked panels.
Editor pages split into settings step and editing step.
Dense grids use smaller cards or horizontal scroll.
Primary CTA can become sticky at the bottom when useful.
Avoid horizontal overflow.
```

---

## 11. Screenshot audit requested before Pass 4

Before making the final Pass 4 plan, a screenshot audit package was requested from the agent.

Requested viewports:

```txt
Mobile small: 375x812
Mobile large: 430x932
Tablet portrait: 768x1024
Desktop regression: 1440x1000
```

Requested routes:

```txt
/
/upload
/tools
/merge-pdf
/compress-pdf
/convert-pdf
/cut-pdf
/organize-pages
/processing
/success
```

Requested states:

```txt
Home initial
Home after PDF upload/routing
Upload initial/after upload
Merge empty, 1 file, 2 files, add-more, remove one, scrolled grid
Compress empty, file loaded, settings, worker state
Convert empty, file loaded, JPG, TXT, DOCX/PPTX, start-over
Cut empty, file loaded, range 1-3, range 1-3,5-6, invalid 999, selected pages
Organize empty, file loaded, selected pages, toolbar, actions if possible
Processing and success empty states
```

Agent reported completion of audit package:

```txt
reports/visual/pass4-audit/
├── mobile-375/         31 screenshots
├── mobile-430/         30 screenshots
├── tablet-768/         30 screenshots
├── desktop-1440/       30 screenshots
├── contact-mobile-375.png
├── contact-mobile-430.png
├── contact-tablet-768.png
├── contact-desktop-1440.png
├── contact-all.png
├── contact-*.html
└── NOTES.md
```

Agent reported:

```txt
121 screenshots
72 Playwright tests passed
zero console errors
real fixture PDFs used
worker-gated features correctly disabled
```

These screenshots have not yet been inspected in the conversation. The next step is to upload the repo/screenshot package containing:

```txt
reports/visual/pass4-audit/
```

---

## 12. Current Pass 4 direction

Pass 4 should be the final hardening and polish pass.

Main goals:

```txt
1. Audit mobile screenshots carefully.
2. Make mobile layouts intentionally responsive.
3. Preserve desktop visual style.
4. Fix preview quality.
5. Fix remaining workflow/file lifecycle issues.
6. Fix worker truthfulness and compression bug.
7. Tighten tests so they prove real behavior.
8. Final visual polish.
9. Final copy/privacy cleanup.
```

Pass 4 should not be a rewrite. It should be surgical.

---

## 13. Known Pass 4 issue list

### Mobile

Needs full audit from screenshots.

Expected likely fixes:

```txt
Header mobile menu / compact nav.
Home hero single-column.
Upload dropzone sizing.
Tool cards stacked.
Editor pages need mobile-specific flows.
Sidebars should become collapsible panels/drawers.
Toolbar should wrap or become sticky horizontal scroll.
Page grids need smaller cards or horizontal scrolling.
Primary CTA should be sticky at bottom when useful.
Avoid horizontal overflow.
```

### Preview quality

Need to replace fixed low thumbnail scale.

Current bad pattern:

```ts
THUMBNAIL_SCALE = 0.3
MAX_INITIAL_PAGES = 8
```

Need quality tiers:

```txt
grid thumbnail
large preview
export render
```

Need progressive/lazy rendering beyond first 8 pages.

### Merge

Check:

```txt
Add more PDFs from sidebar.
Remove PDF updates pages.
Merge disabled when fewer than 2 ready files.
Output order respects drag/drop.
```

### Convert

Needs:

```txt
True remove/replace file control, not only Start over.
JPG/PNG/TXT local outputs verified.
DOCX/PPTX worker-gated copy.
Output preview should reflect real output where possible.
```

### Cut

Needs:

```txt
Better preview quality.
Remove/replace controls.
Range invalid/valid states.
ZIP output for multiple ranges.
```

### Organize

Needs:

```txt
Mobile layout.
Replace/start-over.
Verify reorder/delete/rotate/duplicate affect output.
```

### Compress

Needs:

```txt
Compression truth bug fixed.
If output is larger, report no savings or return original.
Frontend/worker file-size limits aligned.
Actual output size shown.
Worker errors handled cleanly.
```

### Processing / success

Needs:

```txt
Memory-only state UX clarified.
No weird redirects.
One primary download CTA.
Refresh empty states are clear.
```

### Privacy / copy

Need to remove or adjust:

```txt
“encrypted and never stored” if not strictly true.
“deleted in 24 hours” unless implemented.
Filename logging in worker.
```

Use:

```txt
Browser-local operations: “Processed locally in your browser.”
Worker operations: “Processed securely by the PrismPDF worker and deleted after processing.”
```

Only say the second if temp cleanup is actually implemented.

### Tests

Need stronger tests:

```txt
Real UI upload flows.
Real downloads.
Downloaded file page counts.
Merge output order.
Cut output ranges.
Worker endpoint smoke test if env available.
Mobile screenshot coverage.
No horizontal overflow assertions.
No console errors.
```

---

## 14. User role / useful QA process

The user is novice but can help most by doing product QA, not coding.

Recommended fake test PDFs:

```txt
1-page PDF
3-5 page PDF
12-30 page PDF
image-heavy PDF
scanned PDF with no selectable text
landscape PDF
rotated-page PDF
near-50 MB PDF
password-protected PDF
weird filename PDF, e.g. "invoice final (copy) #2.pdf"
```

Manual test flows:

```txt
Home upload 1 PDF
Home upload 2 PDFs
Merge add/remove/reorder/download
Convert JPG/PNG/TXT/DOCX/PPTX
Cut valid/invalid ranges
Organize rotate/delete/reorder/export
Compress low/balanced/strong
Mobile layouts
Refresh processing/success
```

Bug report template:

```txt
Route:
Viewport:
File used:
Action:
Expected:
Actual:
Screenshot:
Downloaded output attached? yes/no
Console error? yes/no
```

Do not use sensitive PDFs yet.

---

## 15. Next immediate action

Upload the Pass 4 audit screenshot package or updated repo containing:

```txt
reports/visual/pass4-audit/
```

Then inspect first:

```txt
contact-mobile-375.png
contact-mobile-430.png
contact-tablet-768.png
contact-desktop-1440.png
NOTES.md
```

After inspecting screenshots, create the final Pass 4 plan in extreme detail, with:

```txt
Each issue
Proposed fix
Critical assessment
Risk
Fallback if not reliable
Exact agent instructions
Mobile-specific layout instructions
Desktop regression protection
Required tests/screenshots
Acceptance criteria
```

The final pass should be judged by real evidence, not summary claims.
