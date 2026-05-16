# Pass 4 Audit — Screenshot Notes

## Method

All screenshots were captured using **Playwright** (`@playwright/test`) running against the production-built Next.js server (`npm run start`). The test script is `src/test/pass4-audit.spec.ts`, executed with:

```
npx playwright test src/test/pass4-audit.spec.ts --reporter=list --retries=0
```

## Viewports captured

| Label | Width | Height | Device target |
|---|---|---|---|
| mobile-375 | 375 | 812 | iPhone small |
| mobile-430 | 430 | 932 | iPhone large / modern Android |
| tablet-768 | 768 | 1024 | iPad portrait |
| desktop-1440 | 1440 | 1000 | Desktop regression |

## Routes and states captured per viewport

### Static routes (empty/initial state — 10 per viewport)
- `/` (home)
- `/upload` (upload hub)
- `/tools` (all tools)
- `/merge-pdf` (merge editor)
- `/compress-pdf` (compression editor)
- `/convert-pdf` (conversion editor)
- `/cut-pdf` (cut/split editor)
- `/organize-pages` (organize editor)
- `/processing` (task runner — empty state)
- `/success` (result download — empty state)

### Interactive states with real uploaded PDFs

Created `test-fixture-3pages.pdf` and `test-fixture-2pages.pdf` using pdf-lib (3 and 2 pages respectively, with colored rectangles and text). Uploaded via Playwright `setInputFiles` on the app's file input elements.

#### Home
- `home-initial` — landing page hero + tool cards
- `home-after-upload` — after dropping 1 PDF (routes to /organize-pages)

#### Upload page
- `upload-initial` — upload hub with dropzone
- `upload-after-upload` — after dropping 1 PDF (routes to /organize-pages)

#### Merge
- `merge-one-file` — DocumentIntake after uploading 1 PDF (merge button disabled, < 2)
- `merge-two-files` — editor with 2 PDFs loaded, sortable page grid visible
- `merge-processing` — real merge running (processed via pdf-lib in-browser)
- `merge-success` — real result with download CTA

#### Compress
- `compress-one-file` — editor with 1 PDF loaded, original size shown
- `compress-settings` — compression levels (Low/Balanced/Strong) visible

#### Convert
- `convert-one-file` — editor with 1 PDF, source preview
- `convert-jpg-selected` — JPG format selected
- `convert-txt-selected` — TXT format selected
- `convert-docx-selected` — DOCX format selected (worker-required badge visible)
- `convert-start-over` — after clicking "Start over" (returns to empty intake)

#### Cut
- `cut-one-file` — editor with 1 PDF
- `cut-range-1-3` — range input "1-3" entered, timeline + output summary
- `cut-invalid-range` — range input "999" entered, inline error shown

#### Organize
- `organize-one-file` — editor with 1 PDF, 3 page cards
- `organize-pages-selected` — first page card selected (highlighted)
- `organize-toolbar` — toolbar with zoom/undo/redo visible

#### Processing/Success empty states
- `processing-empty` — "No active task" card with CTA buttons
- `success-empty` — "No completed file found" card with CTA buttons

## Routes/states that could not be captured

| State | Reason |
|---|---|
| Upload page after 2 PDFs uploaded | Home/upload pages auto-route single PDFs to /organize-pages. Capturing the multi-file upload requires the merge page (done in merge-flow). |
| Drag-over/drag-hover state | Playwright `setInputFiles` bypasses drag events. Capturing drag-over requires custom drag simulation which is fragile and not worth the risk of false positives. |
| Compress after processing | Compress is worker-gated (`NEXT_PUBLIC_PDF_WORKER_URL`). With no worker available in the Playwright local test env, the compress button is disabled. |
| Convert JPG/PNG after processing | These run in-browser but would route to /processing then /success, which is already covered by the merge-flow test. |
| Cut after processing | Same as convert — the actual processing flow is identical to merge (just different operation). Covered by merge-flow. |
| Merge drag-reorder visual | dnd-kit drag simulation in Playwright is non-trivial. The static page grid ordering is captured in merge-two-files. |
| Organize after rotate/delete | Page-level rotation and deletion modify workspace state but the visual difference is small. The organize-pages-selected screenshot shows selection state which is the visual prerequisite for these actions. |

## Console errors observed during capture

None. All pages loaded without JavaScript console errors.

## Worker/network errors

None — the Playwright server runs locally. No worker URL was configured (`NEXT_PUBLIC_PDF_WORKER_URL` not set in test env), so worker-dependent features correctly showed disabled states.

## Screenshot summary

| Viewport | Screenshots | Interactive states | Status |
|---|---|---|---|
| mobile-375 | 31 | Yes (merge, compress, convert, cut, organize) | ✅ All captured |
| mobile-430 | 30 | Yes | ✅ All captured |
| tablet-768 | 30 | Yes | ✅ All captured |
| desktop-1440 | 30 | Yes | ✅ All captured |
| **Total** | **121** | **20 distinct functional states** | |

## Deliverables

```
reports/visual/pass4-audit/
  mobile-375/          (31 PNGs)
  mobile-430/          (30 PNGs)
  tablet-768/          (30 PNGs)
  desktop-1440/        (30 PNGs)
  contact-mobile-375.html
  contact-mobile-430.html
  contact-tablet-768.html
  contact-desktop-1440.html
  contact-all.html
  contact-mobile-375.png
  contact-mobile-430.png
  contact-tablet-768.png
  contact-desktop-1440.png
  contact-all.png
  NOTES.md             (this file)
```
