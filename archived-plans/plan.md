# PrismPDF Technical Build Plan

This `plan.md` is the implementation backbone for building PrismPDF with an agentic, text-only coding workflow. It is intentionally explicit because the execution model is assumed to be a non-vision coding agent. The agent must not infer design from screenshots; it must follow this plan, the designer handoff, and the asset mapping below.

Repository reality check: the uploaded repository currently contains a PrismPDF asset pack and ten reference screenshots. It does not contain a complete Next.js application scaffold. The first implementation step is therefore to create the app scaffold without deleting or moving the source assets.

---

## 0. Non-Negotiable Product Positioning

PrismPDF is a premium PDF utility web app. It must feel meaningfully better than ad-heavy PDF utility sites.

Mandatory product constraints:

1. No ads.
2. No account requirement.
3. No pricing prompts.
4. No dark-pattern upload gates.
5. Upload action must be obvious on every relevant page.
6. The interface must feel cinematic, glassy, high-contrast, and precise.
7. Privacy copy must be technically true. Do not claim browser-only processing if files are uploaded to a server. Do not claim deletion after 24 hours unless that retention policy exists.
8. Shared primitives are mandatory. Do not build one-off screenshot-specific components.
9. The first build should prioritize a polished, functional front-end backbone with realistic interactions over a sprawling backend.
10. The app should be clean and memorable, not over-engineered.

---

## 1. Current Repo Inventory

### 1.1 Files present

The zip contains:

```txt
prismpdf_asset_pack/prismpdf_assets/README.md
prismpdf_asset_pack/prismpdf_assets/asset-manifest.json
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/*
prismpdf_asset_pack/prismpdf_assets/assets/mock/*
prismpdf_asset_pack/prismpdf_assets/logo/*
prismpdf_asset_pack/prismpdf_assets/previews/prismpdf-asset-contact-sheet.png
reference-images/*.png
```

There is no `package.json`, no `src/`, no `app/`, and no existing implementation to preserve.

### 1.2 Image inventory inspected

All 38 image files in the repo were inspected. The actual visual meaning is summarized below so a text-only model can execute without opening images.

#### 1.2.1 Runtime illustration assets

Use these as production assets. Prefer WebP for runtime where possible; keep PNG as fallback/source.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-docx.png
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-docx.webp
```

Visual description: a floating dark glass DOCX sheet, tilted slightly left, with cyan label, white document lines, and subtle cyan/magenta glow. Use on upload page right-side atmosphere and convert page accent.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-generic-doc.png
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-generic-doc.webp
```

Visual description: a floating generic dark document sheet with cyan label and small chart line. Use on universal upload page left-side atmosphere and empty states.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pdf-left.png
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pdf-left.webp
```

Visual description: a floating PDF sheet with magenta PDF label, small bar chart and donut chart near bottom. Use as left/background hero accent and processing/success contextual background.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pdf-right.png
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pdf-right.webp
```

Visual description: a floating PDF sheet with magenta PDF label, angled in the opposite direction from `floating-pdf-left`, with charts and dark glass treatment. Use as right/background hero accent.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pptx.png
prismpdf_asset_pack/prismpdf_assets/assets/illustrations/floating-pptx.webp
```

Visual description: a floating PPTX sheet with magenta label, chart blocks, strong purple/magenta glow. Use on universal upload page right-side atmosphere and convert page accent.

Asset dimensions: all floating illustrations are 900x900 with transparency.

#### 1.2.2 Runtime mock PDF thumbnails

Use these as static demo thumbnails before real PDF rendering exists. In production, generate thumbnails from uploaded PDFs with `pdf.js`.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-cover.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-cover.webp
```

Visual description: dark report cover, title `Annual Report 2024`, cyan/magenta arcs. Use as page 1 for Annual Report.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-chart-1.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-chart-1.webp
```

Visual description: white report page with overview metrics and bar chart. Use as Annual Report chart page.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-chart-2.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-chart-2.webp
```

Visual description: white report page with donut chart and regional line chart. Use as Annual Report analytics page.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-table.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/annual-report-page-table.webp
```

Visual description: white report page with financial table, expense donut, profit trend. Use as Annual Report table page.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/financial-overview-page.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/financial-overview-page.webp
```

Visual description: white financial overview page with top metrics, forecast bars, and quarterly summary. Use for Financial Overview document.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/product-guide-cover.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/product-guide-cover.webp
```

Visual description: dark product guide cover with cyan/magenta arcs. Use as Product Guide page 1.

```txt
prismpdf_asset_pack/prismpdf_assets/assets/mock/product-guide-page-phone.png
prismpdf_asset_pack/prismpdf_assets/assets/mock/product-guide-page-phone.webp
```

Visual description: white product overview page with phone mockup and feature cards. Use as Product Guide inner page.

Asset dimensions: all mock thumbnails are 720x1008, portrait ratio 5:7.

#### 1.2.3 Logo assets

```txt
prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-svg.svg
```

Use as the primary horizontal logo lockup. This contains the prism mark plus `PrismPDF` wordmark.

```txt
prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-mark-only.svg
```

Use as icon mark in small spaces, favicon source, loading states, and icon tiles.

```txt
prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-transparent-png.png
```

Large transparent PNG horizontal logo, 2080x600. Use only as fallback if SVG import/rendering is problematic.

#### 1.2.4 Asset contact sheet

```txt
prismpdf_asset_pack/prismpdf_assets/previews/prismpdf-asset-contact-sheet.png
```

This is only a preview of the asset pack. Do not use in runtime UI.

#### 1.2.5 Reference images

These are design references. Do not use these screenshots as runtime assets. Use them only for visual QA.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (1).png
```

Reference page: Home / landing page. Key design: floating pill header, two-column hero, left headline, right luminous upload dropzone, four tool cards, bottom `How it works` and privacy panels, floating document atmosphere at edges.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (2).png
```

Reference page: All PDF tools page. Key design: top title/search, wide upload banner, popular workflows card, primary tools grid, more tools row, privacy band, footer.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (3).png
```

Reference page: Universal upload page. Key design: large centered luminous dropzone, floating docs on left/right, quick-start cards, supported format icons, privacy cards.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (4).png
```

Reference page: Merge PDF editor. Key design: page title and stats top, left workflow sidebar, right glass canvas with grouped page thumbnails, toolbar, bottom workflow strip.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (5).png
```

Reference page: Compress PDF editor. Key design: left compression settings, top savings stats, right before/after preview, bottom estimate and recommendation cards.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (6).png
```

Reference page: Convert PDF editor. Key design: source/settings sidebar, format picker row, source/output preview comparison, supported formats strip.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (7).png
```

Reference page: Cut PDF editor. Key design: left cut method sidebar, top stats, range timeline with neon bars, selected page grid, output summary.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (8).png
```

Reference page: Organize pages editor. Key design: three-column editor, central page grid, toolbar across top, right properties/actions panel, selection state glows.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (9).png
```

Reference page: Processing state. Key design: blurred editor context behind, central progress ring card, stepper, queue card, keep-tab-open card.

```txt
reference-images/ChatGPT Image May 15, 2026, 12_06_34 PM (10).png
```

Reference page: Success / file ready. Key design: large check orb, confetti, centered success headline, download CTA, result card, task summary card, feedback bar.

---

## 2. Context and Constraints

### 2.1 Core problem deconstruction

We are not just building a PDF utility app. We are building a utility app in a category where users already expect clutter, ads, suspicious upload flows, and upsells. The product must differentiate through:

1. Immediate task execution.
2. Visual trust.
3. Absence of monetization noise.
4. Clear privacy posture.
5. Premium polish without sacrificing speed.
6. Reusable implementation that can sustain many PDF tools.

The central engineering challenge is that the same UI must support both marketing-style pages and dense editor-style pages without diverging into unrelated component systems.

The central design challenge is that a normal dark Tailwind dashboard will fail. The reference uses layered depth: dark background, radial glows, glass panels, luminous borders, realistic thumbnails, premium spacing, and neon selection states.

The central product challenge is that real PDF operations have uneven technical difficulty. Merge, cut, reorder, rotate, and raster export can be done reasonably well client-side. True compression and high-fidelity conversion to Word/PowerPoint require heavier tooling. The architecture must avoid false promises while leaving a clear path to production operations.

### 2.2 Hidden edge cases

#### Upload and file handling

- Empty drop.
- User drops folders instead of files.
- Unsupported file type.
- File extension says `.pdf` but MIME/type is empty or wrong.
- Corrupted PDF.
- Password-protected PDF.
- Very large PDF.
- Very high page count PDF.
- PDF with landscape and portrait pages mixed.
- PDF with rotations stored at page metadata level.
- PDF with transparent pages or unusual page boxes.
- Duplicate filenames.
- Multiple PDFs with identical page IDs if generated naively.
- Browser object URL memory leak if URLs are not revoked.
- Mobile Safari memory pressure during thumbnail rendering.
- Drag/drop unsupported or unreliable on touch devices.

#### Editor state

- User reorders pages, then removes source file.
- User selects a page, then changes zoom/grid mode.
- User undo/redo after bulk delete or reorder.
- User changes range text input while dragging range handles.
- Overlapping cut ranges.
- Reversed ranges such as `8-3`.
- Ranges beyond page count.
- Single page expressions such as `5` mixed with ranges such as `1-3, 5, 8-10`.
- Selection should remain stable across reorder operations.
- Page numbers must distinguish source local page number from final global output order.

#### PDF processing

- Merge should preserve page dimensions, not force A4 unless user opts in.
- Cut/extract should preserve original quality.
- Rotate should not rasterize pages.
- Compression estimates must be labeled as estimates until actual output exists.
- PDF to image conversion creates many output files; need ZIP for multiple pages later.
- DOCX/PPTX conversion fidelity is hard; do not claim perfect layout in MVP.
- Processing progress may be simulated for client-side operations, but it should not block or lie.

#### Privacy and trust

- If files never leave browser, say: `Processed locally in your browser.`
- If files upload to backend, say: `Files are encrypted in transit and deleted after processing` only when backend implements deletion.
- Do not show `Everything happens in the cloud` unless the processing backend exists.
- Do not show `never stored` if using temporary object storage unless lifecycle deletion exists.

#### Visual implementation

- Backdrop blur can be expensive on low-end devices.
- Too many glows can crush performance and contrast.
- Transparent PNG/WebP illustrations must not block pointer events.
- Reference screenshots are 1586x992; responsive behavior must not be inferred by shrinking those screenshots.
- Editor pages need their own mobile flow, not just narrow columns.

---

## 3. Multi-Faceted Analysis

### 3.1 Perspective A: Product and UX architecture

The fastest perceived product is not the one with the fewest steps; it is the one where the next step is always obvious. PrismPDF should keep a consistent task model:

```txt
Choose files -> Inspect/edit -> Confirm operation -> Process -> Download result
```

Every tool page should therefore share:

- A clear title and subtitle.
- A visible upload/replace affordance.
- A left or top settings area.
- A central preview/editor area.
- A single primary CTA.
- A processing state.
- A success state.

The marketing pages should not become detached from the tools. The home/upload/tools pages should reuse the same dropzone, tool cards, icons, button system, background, and glass panel primitives used inside the editors.

### 3.2 Perspective B: Technical implementation architecture

The right technical base is a single Next.js App Router application with TypeScript and Tailwind/global CSS primitives. This gives file-based routing, static marketing pages, client-heavy editor pages, and optional API routes later without creating a separate backend prematurely.

The key split:

```txt
UI primitives        -> stable design system
PDF client pipeline  -> thumbnails, merge, cut, organize, image export
Operation state      -> upload files, pages, selected pages, ranges, processing task, result
Backend boundary     -> optional API routes for future compression/conversion
Visual QA workflow   -> Playwright screenshots and manual/vision review by architect
```

Avoid microservices, auth systems, databases, queues, and object storage for the first front-end build. Those belong only when real cloud processing is implemented.

### 3.3 Perspective C: Visual systems engineering

Most of the premium look comes from a small number of primitives:

- `NeonBackdrop`
- `GlassPanel`
- `GradientButton`
- `Dropzone`
- `PdfThumbnailCard`
- `EditorToolbar`
- `StatCard`
- `ProgressRing`

If these primitives are excellent, the pages can be assembled quickly. If they are mediocre, every page fails regardless of layout correctness.

The implementation should rely on CSS variables and shared classes for glass, glow, borders, and focus states. Do not hardcode one-off `bg-slate-900` panels everywhere.

### 3.4 Perspective D: Vibecoding execution risks

A text-only coding agent will tend to:

- Create generic cards.
- Underuse assets.
- Miss exact layout hierarchy.
- Implement happy-path mock data but skip edge states.
- Overbuild backend abstractions.
- Skip accessibility.
- Claim visual fidelity without seeing screenshots.

Countermeasures in this plan:

- Explicit asset paths and visual descriptions.
- Explicit component tree.
- Explicit route list.
- Explicit acceptance criteria.
- Mandatory Playwright screenshot output.
- No self-certification of visual match by a text-only model.

---

## 4. Draft Approach and Critique

### 4.1 Initial draft approach

A naive initial approach would be:

1. Generate a Next.js app.
2. Add Tailwind.
3. Build each page directly from screenshots.
4. Use static mock thumbnails.
5. Add dropzones and buttons.
6. Add basic fake processing.
7. Polish with gradients.

### 4.2 Critique of initial approach

This approach is flawed.

Problem 1: It creates page-specific code. The app needs a reusable system because many pages share panels, cards, thumbnails, headers, buttons, and editor controls.

Problem 2: `Polish with gradients` is too vague. The design depends on exact primitives: glass panels with pseudo-element gradient borders, luminous buttons, layered backdrop, and consistent selection states.

Problem 3: It risks lying about functionality. Merge/cut/organize can be real in browser. Compression/conversion need honest limitations if backend is not built.

Problem 4: It does not protect against visual regression. The agent must produce screenshots every pass for architect review.

Problem 5: It ignores mobile behavior. The designer handoff explicitly requires mobile task simplification, not squeezed desktop editors.

Problem 6: It does not define asset mapping. The assets are not in standard `public/assets` paths yet.

Problem 7: It does not define state models, so editor pages will become ad hoc.

### 4.3 Refined approach

Build in this order:

1. Bootstrap the Next.js app.
2. Copy/map assets into a runtime public asset structure.
3. Implement global CSS tokens and core visual primitives.
4. Implement data models and mock document/page data.
5. Implement shared upload, thumbnail, card, toolbar, form, and progress components.
6. Build marketing pages using shared primitives.
7. Build editor pages using shared primitives and mock data first.
8. Add real client-side thumbnail rendering and PDF operations where feasible.
9. Add processing/success state and task/result routing.
10. Add tests, accessibility, responsive passes, and Playwright screenshots.

---

## 5. Final Synthesis: Architecture Decision

### 5.1 Chosen stack

Use:

```txt
Framework:        Next.js App Router
Language:         TypeScript
Styling:          Tailwind CSS + global CSS variables/classes
UI animation:     CSS transitions first; optional motion library only when needed
Icons:            lucide-react + custom SVG components
Drag/drop:        @dnd-kit/core + @dnd-kit/sortable
PDF thumbnails:   pdfjs-dist
PDF editing:      pdf-lib for merge/cut/reorder/rotate client-side
Testing:          Vitest for pure logic; Playwright for route/screenshot smoke tests
Package manager:  pnpm
```

Rationale:

- Next.js supports marketing pages, client editor pages, and optional server routes in one app.
- TypeScript protects operation state and page models.
- Tailwind is useful for layout, but custom global CSS is required for glass/neon primitives.
- `@dnd-kit` is appropriate for sortable page grids and keyboard-accessible drag patterns.
- `pdfjs-dist` is appropriate for rendering PDF page previews.
- `pdf-lib` handles core structural PDF operations client-side without a backend.
- Avoid a backend until operations require it.

### 5.2 Functional realism by operation

```txt
Merge PDF:       Real client-side implementation with pdf-lib in MVP.
Cut PDF:         Real client-side extract/split with pdf-lib in MVP.
Organize pages:  Real reorder/rotate/delete/duplicate state; export with pdf-lib in MVP.
PDF thumbnails:  Real client-side rendering with pdfjs-dist in MVP.
PDF -> JPG/PNG:  Real raster export with pdf.js canvas can be added after core UI.
PDF -> TXT:      Real text extraction can be added after core UI, with fidelity caveats.
PDF -> DOCX:     UI first; real high-fidelity conversion requires backend/tooling later.
PDF -> PPTX:     UI first; real high-fidelity conversion requires backend/tooling later.
Compress PDF:    UI first with honest estimates; real compression requires backend/WASM later.
```

Do not block the front-end build on hard conversion/compression problems.

### 5.3 Privacy posture decision for MVP

For MVP client-side operations, use copy like:

```txt
Your files stay in your browser for this operation.
```

For UI screens that are mock-only or not fully implemented, use:

```txt
Preview mode. Final processing pipeline will define retention policy before launch.
```

Do not ship `encrypted and never stored` on server-backed workflows until implemented.

---

## 6. Asset Installation Plan

### 6.1 Copy source assets into runtime paths

After app scaffold exists, copy assets into `public/assets`.

Target structure:

```txt
public/assets/brand/prism-logo.svg
public/assets/brand/prism-logo-mark.svg
public/assets/brand/prism-logo-transparent.png
public/assets/illustrations/floating-docx.webp
public/assets/illustrations/floating-generic-doc.webp
public/assets/illustrations/floating-pdf-left.webp
public/assets/illustrations/floating-pdf-right.webp
public/assets/illustrations/floating-pptx.webp
public/assets/illustrations/floating-docx.png
public/assets/illustrations/floating-generic-doc.png
public/assets/illustrations/floating-pdf-left.png
public/assets/illustrations/floating-pdf-right.png
public/assets/illustrations/floating-pptx.png
public/assets/mock/annual-report-cover.webp
public/assets/mock/annual-report-page-chart-1.webp
public/assets/mock/annual-report-page-chart-2.webp
public/assets/mock/annual-report-page-table.webp
public/assets/mock/financial-overview-page.webp
public/assets/mock/product-guide-cover.webp
public/assets/mock/product-guide-page-phone.webp
public/assets/mock/*.png
```

Copy commands:

```bash
mkdir -p public/assets/brand public/assets/illustrations public/assets/mock
cp prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-svg.svg public/assets/brand/prism-logo.svg
cp prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-mark-only.svg public/assets/brand/prism-logo-mark.svg
cp prismpdf_asset_pack/prismpdf_assets/logo/prism-logo-transparent-png.png public/assets/brand/prism-logo-transparent.png
cp prismpdf_asset_pack/prismpdf_assets/assets/illustrations/* public/assets/illustrations/
cp prismpdf_asset_pack/prismpdf_assets/assets/mock/* public/assets/mock/
```

Do not copy reference screenshots into `public` unless used for a private QA page. They should not be bundled into production UI.

### 6.2 Runtime asset constants

Create:

```txt
src/lib/assets.ts
```

With:

```ts
export const assets = {
  brand: {
    logo: "/assets/brand/prism-logo.svg",
    mark: "/assets/brand/prism-logo-mark.svg",
  },
  illustrations: {
    floatingPdfLeft: "/assets/illustrations/floating-pdf-left.webp",
    floatingPdfRight: "/assets/illustrations/floating-pdf-right.webp",
    floatingDocx: "/assets/illustrations/floating-docx.webp",
    floatingPptx: "/assets/illustrations/floating-pptx.webp",
    floatingGenericDoc: "/assets/illustrations/floating-generic-doc.webp",
  },
  mock: {
    annualReportCover: "/assets/mock/annual-report-cover.webp",
    annualReportChart1: "/assets/mock/annual-report-page-chart-1.webp",
    annualReportChart2: "/assets/mock/annual-report-page-chart-2.webp",
    annualReportTable: "/assets/mock/annual-report-page-table.webp",
    financialOverview: "/assets/mock/financial-overview-page.webp",
    productGuideCover: "/assets/mock/product-guide-cover.webp",
    productGuidePhone: "/assets/mock/product-guide-page-phone.webp",
  },
} as const;
```

### 6.3 Missing assets to implement in code

The repo does not include file-format icons for DOCX/XLSX/PPTX/JPG/PNG/TXT/OCR. Implement these as React SVG/Icon components in:

```txt
src/components/icons/FormatIcons.tsx
```

Do not search for random icon images. Use custom SVG rectangles/badges or lucide icons.

The repo does not include `noise.png`. Either create a tiny generated noise texture or implement noise with CSS pseudo-elements. Prefer CSS first.

---

## 7. Application Routes

Use App Router route groups for clarity.

```txt
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx                         # Home / landing
src/app/upload/page.tsx                  # Universal upload
src/app/tools/page.tsx                   # All PDF tools
src/app/merge-pdf/page.tsx               # Merge editor
src/app/compress-pdf/page.tsx            # Compress editor
src/app/convert-pdf/page.tsx             # Convert editor
src/app/cut-pdf/page.tsx                 # Cut editor
src/app/organize-pages/page.tsx          # Organize editor
src/app/processing/page.tsx              # Processing state
src/app/success/page.tsx                 # Success state
```

Optional later API routes:

```txt
src/app/api/tasks/route.ts
src/app/api/tasks/[taskId]/route.ts
src/app/api/compress/route.ts
src/app/api/convert/route.ts
```

Do not implement API routes in the first pass unless a real operation requires them.

---

## 8. Suggested Folder Structure

```txt
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    upload/page.tsx
    tools/page.tsx
    merge-pdf/page.tsx
    compress-pdf/page.tsx
    convert-pdf/page.tsx
    cut-pdf/page.tsx
    organize-pages/page.tsx
    processing/page.tsx
    success/page.tsx
  components/
    buttons/
      GradientButton.tsx
      IconButton.tsx
      SecondaryButton.tsx
    cards/
      StatCard.tsx
      ToolCard.tsx
      WorkflowCard.tsx
      ResultFileCard.tsx
      TaskSummaryCard.tsx
    editor/
      EditorToolbar.tsx
      LeftWorkflowPanel.tsx
      PdfPageGrid.tsx
      PdfThumbnailCard.tsx
      RangeTimeline.tsx
      SelectionBar.tsx
    feedback/
      FeedbackRatingBar.tsx
    forms/
      SearchInput.tsx
      Slider.tsx
      Toggle.tsx
      TextField.tsx
    glass/
      GlassPanel.tsx
    icons/
      BrandLogo.tsx
      FormatIcons.tsx
      ToolIcons.tsx
    layout/
      AppFooter.tsx
      AppHeader.tsx
      AppShell.tsx
      EditorShell.tsx
      NeonBackdrop.tsx
    pdf/
      FileRow.tsx
      FormatBadge.tsx
      FormatPicker.tsx
      PdfPreviewPane.tsx
    progress/
      ProcessingStepper.tsx
      ProgressRing.tsx
      QueueCard.tsx
    upload/
      Dropzone.tsx
      UploadIllustrationStage.tsx
  lib/
    assets.ts
    demo-data.ts
    files/
      format-bytes.ts
      validate-files.ts
    pdf/
      client-operations.ts
      pdfjs.ts
      render-thumbnails.ts
      types.ts
    ranges/
      parse-ranges.ts
      range-utils.ts
    shortcuts/
      use-keyboard-shortcuts.ts
    task/
      task-state.ts
  test/
    ranges.test.ts
    files.test.ts
    pdf-state.test.ts
```

---

## 9. Global Design Tokens and CSS Strategy

### 9.1 CSS rule

Use Tailwind utilities for layout and simple spacing, but implement the visual identity in `globals.css` via CSS variables and reusable classes.

Avoid this:

```tsx
<div className="rounded-2xl border border-slate-700 bg-slate-900" />
```

Prefer this:

```tsx
<GlassPanel className="p-6">...</GlassPanel>
```

### 9.2 Required tokens

Define at minimum:

```css
:root {
  --bg-0: #020617;
  --bg-1: #050b1d;
  --bg-2: #071226;

  --panel-0: rgba(7, 15, 35, 0.68);
  --panel-1: rgba(12, 25, 55, 0.72);
  --panel-2: rgba(20, 35, 75, 0.58);

  --stroke-soft: rgba(148, 163, 184, 0.22);
  --stroke-mid: rgba(148, 163, 184, 0.36);
  --stroke-bright: rgba(191, 219, 254, 0.72);

  --text-strong: #f8fafc;
  --text-main: #dbeafe;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  --blue: #1677ff;
  --cyan: #35d5ff;
  --violet: #7c3cff;
  --purple: #a855f7;
  --magenta: #ec4cff;
  --green: #35f2a6;
  --danger: #fb7185;

  --gradient-primary: linear-gradient(135deg, #28c7ff 0%, #1668ff 42%, #a855f7 72%, #f04cff 100%);
  --gradient-panel: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(168, 85, 247, 0.14));
  --gradient-border: linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(124, 58, 237, 0.75), rgba(236, 72, 153, 0.8));

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --shadow-panel: 0 24px 80px rgba(0, 0, 0, 0.42);
  --shadow-glow-blue: 0 0 40px rgba(56, 189, 248, 0.22);
  --shadow-glow-purple: 0 0 48px rgba(168, 85, 247, 0.26);
  --shadow-button: 0 0 32px rgba(59, 130, 246, 0.42), 0 0 42px rgba(168, 85, 247, 0.28);
}
```

### 9.3 Shell sizes

```css
.page-shell {
  width: min(100% - 96px, 1420px);
  margin-inline: auto;
}

.editor-shell {
  width: min(100% - 72px, 1480px);
  margin-inline: auto;
}

@media (max-width: 1023px) {
  .page-shell,
  .editor-shell {
    width: min(100% - 32px, 100%);
  }
}
```

### 9.4 Typography

Use `Inter` or `Geist`. If using `next/font`, use one font consistently.

Class targets:

```css
.display-title {
  font-size: clamp(48px, 5vw, 76px);
  line-height: 0.98;
  font-weight: 760;
  letter-spacing: -0.055em;
}

.page-title {
  font-size: clamp(42px, 4vw, 58px);
  line-height: 1;
  font-weight: 750;
  letter-spacing: -0.045em;
}

.section-title {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.body-lg {
  font-size: 19px;
  line-height: 1.55;
  color: var(--text-main);
}

.body {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
}

.caption {
  font-size: 13px;
  color: var(--text-dim);
}
```

---

## 10. Core Visual Primitives

### 10.1 AppShell

Every page should use:

```tsx
<AppShell variant="default">
  <PageContent />
</AppShell>
```

`AppShell` renders:

```txt
NeonBackdrop
AppHeader
main
AppFooter
```

Dense editor pages may use `EditorShell` inside `main`, not instead of `AppShell`.

### 10.2 NeonBackdrop

Visual target:

- Deep navy/black base.
- Cyan/violet/magenta radial glows.
- Subtle grain/noise.
- Optional page-specific intensity.
- Pointer-events none.
- Fixed behind everything.

Implementation requirements:

```tsx
export function NeonBackdrop({ variant = "default" }: { variant?: "default" | "editor" | "success" }) {
  return (
    <div className={`neon-backdrop neon-backdrop--${variant}`} aria-hidden="true">
      <div className="glow glow-cyan" />
      <div className="glow glow-violet" />
      <div className="glow glow-magenta" />
      <div className="noise-layer" />
    </div>
  );
}
```

Do not use a single background image.

### 10.3 GlassPanel

This is the most important primitive. All major cards and panels must use it.

Props:

```ts
type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: "soft" | "default" | "strong";
  as?: "section" | "div" | "aside" | "article";
};
```

Requirements:

- Translucent dark fill.
- Gradient panel overlay.
- 1px luminous border via pseudo-element.
- Top highlight line via pseudo-element.
- `backdrop-filter: blur(24px)` on capable browsers.
- Fallback solid panel for browsers with reduced support.

### 10.4 GradientButton

Variants:

```ts
type ButtonVariant = "primaryGlow" | "secondaryGlass" | "ghost" | "danger";
```

Primary must be luminous, with gradient, inner highlight, and hover lift.

### 10.5 Dropzone

Props:

```ts
type DropzoneProps = {
  accept: string[];
  multiple?: boolean;
  maxSizeMB?: number;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  privacyNote?: string;
  onFilesAccepted: (files: File[]) => void;
  state?: "idle" | "drag-over" | "uploading" | "error" | "success" | "disabled";
  errorMessage?: string;
};
```

States:

```txt
idle
hover
drag-over
uploading
error
success
disabled
```

Accessibility:

- Use a real hidden file input.
- Provide `aria-label`.
- Dropzone button is keyboard-operable.
- Error text must be in an accessible live region.

### 10.6 PdfThumbnailCard

Props:

```ts
type PdfThumbnailCardProps = {
  page: PdfPage;
  selected?: boolean;
  draggable?: boolean;
  showDragHandle?: boolean;
  showCheckbox?: boolean;
  isDimmed?: boolean;
  onSelect?: (id: string) => void;
  onRotate?: (id: string, degrees: 90 | -90) => void;
};
```

Visual requirements:

- Realistic page aspect ratio.
- White page surface for light thumbnails.
- Dark cover pages allowed.
- Shadow under page.
- Selected state: cyan/violet border, glow, slight lift, check badge.
- Unselected but selectable state: muted border and hover glow.
- Dimmed state: opacity reduction but still recognizable.
- Drag handle visible on hover and focus.

### 10.7 RangeTimeline

Used on Cut PDF.

Props:

```ts
type RangeTimelineProps = {
  pageCount: number;
  ranges: PageRange[];
  onChange: (ranges: PageRange[]) => void;
};
```

Requirements:

- Render a horizontal track from 1 to `pageCount`.
- Show selected ranges as neon bars.
- Each range has start/end handles.
- Label floats above each bar.
- Dragging handles updates state.
- Text input and timeline must remain synchronized.
- For MVP, pointer dragging can be simplified, but it cannot be a static decoration.

### 10.8 ProgressRing

Props:

```ts
type ProgressRingProps = {
  value: number;
  size?: number;
  label?: string;
};
```

Requirements:

- SVG circle.
- Gradient stroke from cyan to blue to violet to magenta.
- Rounded stroke caps.
- Glow filter.
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Honors reduced motion.

---

## 11. Data Models

Create:

```txt
src/lib/pdf/types.ts
```

```ts
export type UploadedFileStatus = "queued" | "uploading" | "ready" | "error";

export type UploadedFile = {
  id: string;
  file?: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  type: string;
  thumbnails?: PdfPageThumbnail[];
  status: UploadedFileStatus;
  errorMessage?: string;
};

export type PdfPageThumbnail = {
  pageId: string;
  pageNumber: number;
  url: string;
  width?: number;
  height?: number;
};

export type PdfPage = {
  id: string;
  fileId: string;
  sourceFileName: string;
  globalIndex: number;
  localIndex: number;
  thumbnailUrl: string;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
  width?: number;
  height?: number;
};

export type PageRange = {
  id: string;
  start: number;
  end: number;
};

export type OperationType = "merge" | "compress" | "convert" | "cut" | "organize";

export type ProcessingTask = {
  id: string;
  operation: OperationType;
  fileName: string;
  progress: number;
  currentStep: string;
  estimatedSecondsRemaining?: number;
  status: "queued" | "processing" | "success" | "error" | "cancelled";
};

export type ResultFile = {
  id: string;
  name: string;
  operation: OperationType;
  format: "pdf" | "docx" | "jpg" | "png" | "pptx" | "txt";
  sizeBytes: number;
  pageCount?: number;
  downloadUrl: string;
  previewUrl?: string;
  expiresAt?: string;
};
```

---

## 12. Demo Data Strategy

Create:

```txt
src/lib/demo-data.ts
```

Use demo documents:

```ts
export const demoFiles = [
  {
    id: "annual-report-2024",
    name: "Annual Report 2024.pdf",
    sizeBytes: 4200000,
    pageCount: 12,
  },
  {
    id: "product-guide",
    name: "Product Guide.pdf",
    sizeBytes: 2100000,
    pageCount: 8,
  },
  {
    id: "financial-overview",
    name: "Financial Overview.pdf",
    sizeBytes: 1400000,
    pageCount: 4,
  },
];
```

Build 24 demo pages by cycling through mock assets:

```txt
Annual Report pages:
1 annual-report-cover
2 annual-report-page-chart-1
3 annual-report-page-chart-2
4 annual-report-page-table
repeat chart/table pages until 12

Product Guide pages:
1 product-guide-cover
2 product-guide-page-phone
repeat until 8

Financial Overview pages:
1 financial-overview-page
repeat until 4
```

These demo pages power initial visual editor states before upload.

---

## 13. File Validation

Create:

```txt
src/lib/files/validate-files.ts
```

Rules:

- Max default PDF size: 200 MB for UI validation.
- Allow multiple files on merge/upload/tools.
- Allow one primary file on compress/convert/cut/organize unless otherwise stated.
- Accept extension and MIME, but tolerate empty MIME from browsers.
- Reject unsupported files with inline error.
- Do not use alert dialogs.

Validation result:

```ts
export type FileValidationResult =
  | { ok: true; files: File[] }
  | { ok: false; reason: string; rejectedFiles?: string[] };
```

---

## 14. Range Parser

Create:

```txt
src/lib/ranges/parse-ranges.ts
```

Input examples:

```txt
1-3, 6-8, 12-14
5
1, 3, 7-9
8-3
```

Output:

```ts
export type ParseRangeResult =
  | { ok: true; ranges: PageRange[]; selectedPages: number[]; normalizedInput: string }
  | { ok: false; error: string };
```

Rules:

1. Trim whitespace.
2. Split by comma.
3. Accept single page `5`.
4. Accept range `1-3`.
5. Reject zero and negative pages.
6. Reject values beyond `pageCount`.
7. Normalize reversed ranges by default: `8-3` becomes `3-8`, but show a helper message if desired.
8. Merge overlapping ranges for selected page display, but preserve user range segments for output parts unless product decides otherwise.
9. Provide stable IDs: `range-1`, `range-2`, etc.
10. Unit test every rule.

---

## 15. Client PDF Pipeline

### 15.1 Thumbnail rendering with pdf.js

Create:

```txt
src/lib/pdf/pdfjs.ts
src/lib/pdf/render-thumbnails.ts
```

Responsibilities:

- Dynamically import `pdfjs-dist` only on client.
- Configure worker safely for Next.js.
- Load PDF from `File.arrayBuffer()`.
- Render first N thumbnails initially, then lazy render rest.
- Use `canvas.toBlob()` and object URLs.
- Store object URLs and revoke them on cleanup.
- Gracefully handle encrypted/corrupted PDFs.

Pseudo-flow:

```ts
const arrayBuffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
for each page:
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  render to canvas;
  canvas.toBlob -> objectURL;
```

### 15.2 Merge with pdf-lib

Create:

```txt
src/lib/pdf/client-operations.ts
```

Functions:

```ts
export async function mergePdfFiles(files: File[]): Promise<Blob>;
export async function extractPages(file: File, ranges: PageRange[]): Promise<Blob[]>;
export async function organizePdf(file: File, pages: PdfPage[]): Promise<Blob>;
```

Implementation notes:

- Preserve page dimensions.
- Preserve vector content when possible.
- Do not rasterize unless exporting images.
- Use stable output filenames.
- Generate object URL for download result.

### 15.3 Compression limitation

Do not fake actual compression as if it is real.

For MVP:

- UI can show estimated savings based on selected level.
- CTA can route to processing/success mock only if page is explicitly in prototype/demo mode.
- Production compression requires backend or WASM PDF optimizer.

Future backend choices:

```txt
qpdf: structural optimization, linearization, object stream compression.
Ghostscript: stronger raster/image compression but can alter fidelity.
pdfcpu: potential Go-based CLI service.
LibreOffice/Poppler/Tesseract: conversion/OCR-related workflows.
```

Do not add this backend until the front-end is stable.

---

## 16. Page-by-Page Implementation Plan

### 16.1 Home / Landing Page `/`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (1).png`

Layout:

```txt
AppHeader
Hero section
  Left: headline, subtitle, trust pills
  Right: Upload dropzone in glass card
Tool cards row
Bottom row
  How it works panel
  Privacy/security panel
AppFooter
```

Hero copy:

```txt
The new era
of PDF tools

Powerful. Fast. Beautiful. All the tools you need
to work with PDFs, in one seamless experience.
```

Implementation specifics:

- Use `.display-title`.
- Apply gradient text only to `PDF`.
- Use floating document illustrations at edges:
  - left: `/assets/illustrations/floating-pdf-left.webp`
  - right: `/assets/illustrations/floating-pdf-right.webp`
- Hide or greatly reduce floating docs on mobile.
- Dropzone card target desktop width: about 640px.
- Tool cards: Merge PDF, Compress PDF, Convert PDF, Cut PDF.
- Tool cards link to `/merge-pdf`, `/compress-pdf`, `/convert-pdf`, `/cut-pdf`.

Acceptance criteria:

- Upload CTA visible above fold.
- Tool cards have glow hover states.
- Bottom panels use same `GlassPanel` primitive.
- Page does not look like generic SaaS dark mode.

### 16.2 Universal Upload Page `/upload`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (3).png`

Layout:

```txt
Centered large dropzone
Floating docs around it
Quick-start tool cards
Supported formats panel
Privacy cards
```

Implementation specifics:

- Main dropzone target desktop size: about 820x390.
- Left floating assets: `floating-pdf-left.webp`, `floating-generic-doc.webp`.
- Right floating assets: `floating-docx.webp`, `floating-pptx.webp`.
- Supported format icons are code-generated SVGs.
- Keep page lower density than tools page.

Acceptance criteria:

- Dropzone feels like luminous glass vault, not a dashed rectangle.
- Floating documents frame the upload area without stealing focus.

### 16.3 All Tools Page `/tools`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (2).png`

Layout:

```txt
Title/search row
Wide upload banner
Main grid:
  Popular workflows card
  Primary tool cards
More tools row
Privacy feature band
```

Search requirements:

- Client-side filter.
- Cmd/Ctrl+K focuses input.
- Escape clears or blurs.
- Empty state for no results.

Tool data:

```ts
const primaryTools = [
  { title: "Merge PDF", href: "/merge-pdf" },
  { title: "Compress PDF", href: "/compress-pdf" },
  { title: "Convert PDF", href: "/convert-pdf" },
  { title: "Cut PDF", href: "/cut-pdf" },
];

const moreTools = [
  "Reorder pages",
  "Extract images",
  "Protect PDF",
  "Add watermark",
  "Rotate PDF",
  "OCR",
];
```

Acceptance criteria:

- Search field visually matches header glass language.
- Upload banner has obvious CTA and benefit list.
- More tools show `Coming soon` pills.

### 16.4 Merge PDF Page `/merge-pdf`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (4).png`

Layout:

```txt
Page header with title/subtitle/stats
Main grid:
  left workflow sidebar
  right page arrangement canvas
Bottom how-it-works strip
```

Desktop grid:

```css
.merge-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
}
```

Left sidebar sections:

```txt
1. Upload files
2. Merge settings
3. Output file
```

Right canvas:

- Group thumbnails by source file.
- Use `@dnd-kit` for reordering within final output order.
- Show global final page number and local source page number.
- Toolbar includes fit, zoom out, slider, zoom in, grid/list toggle.

MVP functionality:

- Demo pages render first.
- Upload accepts multiple PDFs.
- Real thumbnails generated for uploaded PDFs where possible.
- Real merge with `pdf-lib`.
- Download output from object URL.

Acceptance criteria:

- Drag handles are visible.
- Dragged card lifts with shadow/glow.
- Page thumbnails remain readable.
- Merge CTA is disabled until at least two PDFs or valid pages exist.

### 16.5 Compress PDF Page `/compress-pdf`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (5).png`

Layout:

```txt
Page header with savings stats
Main grid:
  left settings sidebar
  right before/after preview
Bottom cards:
  estimated download size
  recommendation card
```

Compression levels:

```txt
Low:      Best quality, larger file, approx 10% smaller
Balanced: Good quality, good compression, approx 60% smaller
Strong:   Smaller size, lower quality, approx 80% smaller
```

Important implementation rule:

- Label savings as estimated until real compression exists.
- Do not imply actual compression if CTA only simulates processing.

Acceptance criteria:

- Compression level cards do not look like normal radio buttons.
- Selected option has neon border/check.
- Before/after preview uses real mock thumbnails.
- Savings stat uses green accent.

### 16.6 Convert PDF Page `/convert-pdf`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (6).png`

Layout:

```txt
Title block
Main grid:
  left source/settings sidebar
  right conversion workspace
    format picker
    preview comparison
    supported formats strip
```

Format tiles:

```txt
Word (.docx)
JPG (.jpg)
PNG (.png)
PowerPoint (.pptx)
Text (.txt)
```

MVP functionality:

- UI state for selected output format.
- Real PDF -> PNG/JPG optional after core pages.
- Real PDF -> TXT optional after core pages.
- DOCX/PPTX conversion should be marked prototype/demo until backend exists.

Acceptance criteria:

- Format picker is prominent.
- Source/output preview panes look credible.
- Unsupported real conversion paths are honest.

### 16.7 Cut PDF Page `/cut-pdf`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (7).png`

Layout:

```txt
Page title + stats
Main grid:
  left method/settings sidebar
  right range editor
```

Methods:

```txt
Split by range
Extract selected pages
Split every N pages
```

Range input:

```txt
1-3, 6-8, 12-14
```

Right editor:

- Document header.
- Toolbar.
- Range timeline.
- Page grid.
- Output summary.

MVP functionality:

- Fully working range parser.
- Text input updates selected thumbnails.
- Timeline updates selected thumbnails.
- Extract with `pdf-lib`.

Acceptance criteria:

- Selected ranges are visually obvious.
- Output summary updates as ranges change.
- Invalid input gives inline error.

### 16.8 Organize Pages Page `/organize-pages`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (8).png`

Layout:

```txt
Breadcrumb
Title
Three-column editor:
  left document sidebar
  center page grid
  right properties/actions sidebar
```

Desktop grid:

```css
.organize-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr) 270px;
  gap: 16px;
}
```

Center toolbar actions:

```txt
Rotate left
Rotate right
Delete
Duplicate
Extract
Insert
More
Undo
Redo
Zoom
Grid/list toggle
```

MVP functionality:

- Select all/deselect all.
- Multi-select with shift/cmd controls where feasible.
- Reorder with `@dnd-kit`.
- Delete selected pages.
- Rotate selected pages in state.
- Duplicate pages in state.
- Undo/redo for reorder/delete/rotate/duplicate.
- Export organized PDF with `pdf-lib`.

Acceptance criteria:

- Feels like lightweight design/editor tool, not admin dashboard.
- Page grid target: about 6 columns on wide desktop.
- Selected card glow is unmistakable.

### 16.9 Processing Page `/processing`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_33 PM (9).png`

Layout:

```txt
Blurred contextual background
Central processing card
Queue card
Keep tab open card
```

Progress steps vary by operation.

Merge example:

```txt
Preparing files
Validating pages
Reordering pages
Merging pages
Finalizing PDF
```

Implementation:

- Route accepts query params: `operation`, `fileName`, maybe `next=/success`.
- Use demo task state initially.
- For real client operations, processing can be an overlay/state instead of route later.
- `aria-live="polite"` for progress text.

Acceptance criteria:

- Progress ring is visually strong.
- Stepper state is clear.
- Cancel affordance exists.

### 16.10 Success Page `/success`

Reference: `reference-images/ChatGPT Image May 15, 2026, 12_06_34 PM (10).png`

Layout:

```txt
Success hero
Primary CTA row
Result details card + task summary card
Feedback bar
```

Hero copy:

```txt
Your file is ready

We've successfully processed your PDF.
You can download it, preview it, or start another task.
```

Implementation:

- `ready` gradient text.
- CSS/SVG check orb.
- CSS confetti particles, not heavy library.
- Download CTA uses actual object URL when available; otherwise demo state.
- Copy filename button writes to clipboard.
- Feedback rating is local state only.

Acceptance criteria:

- Rewarding but not childish.
- Result card substantial/trustworthy.
- Primary download CTA is dominant.

---

## 17. Header and Footer

### 17.1 Header

Structure:

```txt
Left: logo mark + PrismPDF
Center nav: Merge | Compress | Convert | Cut PDF | All tools
Right: Choose PDF files CTA
```

Requirements:

- Floating pill glass nav.
- Height about 72px desktop.
- Max width about 1380-1420px.
- Top margin 16px.
- Active nav item uses subtle glow/underline.
- CTA always visible on desktop.
- Mobile: logo left, upload CTA, menu button.

### 17.2 Footer

Structure:

```txt
Left: logo + copyright
Center: nav links
Right: lock icon + Secure by design. Built for simplicity.
```

Use same glass pill treatment.

---

## 18. Responsive Strategy

Breakpoints:

```txt
Mobile:  < 640px
Tablet:  640px - 1023px
Desktop: 1024px - 1439px
Wide:    1440px+
```

Rules:

- Do not squeeze desktop editors into mobile.
- Header nav collapses.
- Tool cards become one column on mobile.
- Floating document art is hidden or reduced.
- Sidebars become drawers or stacked panels.
- Editor pages use a two-step mobile mode:
  1. Settings step.
  2. Page editing step.
- Dense page grids use smaller cards or horizontal scroll.

Minimum mobile route behavior:

```txt
Home: single-column hero, dropzone below copy.
Upload: centered dropzone, no large side illustrations.
Tools: search and cards stack.
Merge: settings panel above page grid, sticky merge CTA.
Compress: settings first, preview below.
Convert: format picker above preview.
Cut: range input first, timeline scrollable, grid below.
Organize: toolbar sticky, sidebars collapsed into drawers.
Processing: single central card.
Success: stacked result/summary cards.
```

---

## 19. Accessibility Requirements

Implement from the start.

Required:

- Buttons must be actual `button` or `a` elements.
- Tool cards should be links/buttons, not clickable divs.
- Dropzones must be keyboard-operable.
- File inputs need accessible labels.
- Icon-only buttons need `aria-label`.
- Progress rings need `aria-valuenow`.
- Processing updates use `aria-live="polite"`.
- Selected page cards use `aria-selected` or checkbox state.
- Toggle states use semantic switches.
- Focus states must be visible.
- Respect `prefers-reduced-motion`.

Global focus style:

```css
:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.9);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.16);
}
```

---

## 20. Keyboard Shortcuts

Minimum:

```txt
Cmd/Ctrl + K    Focus tool search
Cmd/Ctrl + Z    Undo editor action
Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y    Redo editor action
Shift + click   Range select pages
Delete          Delete selected pages
Esc             Clear selection / close modal
```

Create:

```txt
src/lib/shortcuts/use-keyboard-shortcuts.ts
```

Do not globally hijack browser shortcuts on text inputs except for intended shortcuts.

---

## 21. Animation Rules

Use restrained premium motion.

Allowed:

- Slow ambient background drift.
- Button hover lift.
- Panel glow pulse on active state.
- Dropzone highlight on drag-over.
- Progress ring animation.
- Success check scale-in.
- Light confetti on success.

Avoid:

- Excessive bouncing.
- Continuous animation on every card.
- Fast spinning gradients.
- Animated text gimmicks.
- Motion that interferes with upload/editing.

Durations:

```txt
Hover:        140-220ms
Panel enter:  280-420ms
Modal enter:  360-520ms
Background:   12-24s drift
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 22. Visual Fidelity Checklist

A page is not done unless:

1. Background has visible depth and atmosphere.
2. Main panels use glassmorphism with blur, translucent fill, gradient border, and glow.
3. Primary CTA is luminous and gradient-based.
4. Editor thumbnails look like real PDF pages.
5. Selection states are unmistakably neon and interactive.
6. Product remains free of ads, upsells, pricing prompts, or account pressure.
7. Spacing feels premium, not cramped.
8. Dense editor pages remain elegant.
9. Shared components are reused consistently.
10. Result does not look like generic Tailwind dark mode.
11. Floating document illustrations appear on home/upload pages.
12. Header/footer use pill glass language.
13. Reference images are not used as UI screenshots.
14. The page works at 1586x992, 1440x900, 1024x768, and 390x844.

---

## 23. Functional Quality Gates

1. Upload works by click and drag/drop.
2. Validation errors are inline.
3. Page reordering works on merge/organize.
4. Range selection syncs input, timeline, thumbnails, and output summary.
5. Processing state has progress and cancel affordance.
6. Success state has download, preview, copy filename, and start another task.
7. Keyboard shortcuts work where expected.
8. Focus states are visible.
9. Mobile layouts are intentionally adapted.
10. Object URLs are revoked when no longer needed.
11. Uploaded file state survives route interactions within a session where needed.
12. No runtime console errors.
13. No TypeScript errors.
14. No lint errors.

---

## 24. Implementation Phases

### Phase 0: Bootstrap

Tasks:

1. Create Next.js app in repo root if absent.
2. Use TypeScript, App Router, Tailwind, ESLint, import alias `@/*`.
3. Copy assets into `public/assets`.
4. Add `src/lib/assets.ts`.
5. Add base route pages with placeholders.

Completion commands:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If `typecheck` script is not present, add it:

```json
"typecheck": "tsc --noEmit"
```

### Phase 1: Visual system primitives

Build:

```txt
AppShell
AppHeader
AppFooter
NeonBackdrop
GlassPanel
GradientButton
SecondaryButton
IconButton
BrandLogo
ToolIcons
FormatIcons
```

Acceptance:

- Home placeholder already shows final background/header/button style.
- No page-specific hardcoded card styles.

### Phase 2: Data and shared components

Build:

```txt
Dropzone
ToolCard
WorkflowCard
StatCard
FileRow
PdfThumbnailCard
PdfPageGrid
EditorToolbar
FormatBadge
FormatPicker
ProgressRing
ProcessingStepper
QueueCard
ResultFileCard
TaskSummaryCard
FeedbackRatingBar
Toggle
Slider
SearchInput
```

Add demo data.

### Phase 3: Marketing pages

Implement:

```txt
/
/upload
/tools
```

Add search and keyboard focus.

### Phase 4: Editor pages with demo state

Implement:

```txt
/merge-pdf
/compress-pdf
/convert-pdf
/cut-pdf
/organize-pages
```

Use demo thumbnails first.

### Phase 5: Core client functionality

Implement:

```txt
file validation
pdf.js thumbnails
pdf-lib merge
pdf-lib cut/extract
organize export
range parser tests
object URL cleanup
```

### Phase 6: Processing and success

Implement:

```txt
/processing
/success
task state
result file card
feedback rating
copy filename
download object URL flow
```

### Phase 7: Responsive and accessibility pass

Implement mobile-specific layouts and screen reader/focus details.

### Phase 8: Visual QA loop

Run Playwright screenshots after every meaningful pass.

Required screenshot viewport:

```txt
Desktop reference viewport: 1586x992
Additional desktop: 1440x900
Tablet: 1024x768
Mobile: 390x844
```

Required output path:

```txt
reports/visual/pass-01/home-desktop.png
reports/visual/pass-01/tools-desktop.png
...
reports/visual/pass-01/success-mobile.png
```

Important: a text-only agent must not claim visual fidelity from screenshots. It must generate screenshot files and report their paths for architect review.

---

## 25. Playwright Screenshot Workflow

Install Playwright only when ready for visual pass.

Create:

```txt
tests/visual.spec.ts
```

Routes to capture:

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

Example spec structure:

```ts
import { test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["upload", "/upload"],
  ["tools", "/tools"],
  ["merge", "/merge-pdf"],
  ["compress", "/compress-pdf"],
  ["convert", "/convert-pdf"],
  ["cut", "/cut-pdf"],
  ["organize", "/organize-pages"],
  ["processing", "/processing"],
  ["success", "/success"],
] as const;

test.describe("visual screenshots", () => {
  for (const [name, route] of routes) {
    test(`${name} desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1586, height: 992 });
      await page.goto(route);
      await page.screenshot({ path: `reports/visual/latest/${name}-desktop.png`, fullPage: true });
    });
  }
});
```

Add mobile variants separately.

---

## 26. Testing Plan

### 26.1 Unit tests

Use Vitest for:

```txt
parseRanges
rangeToSelectedPages
merge overlapping range helper
file validation
formatBytes
editor reducer operations
```

Critical tests for `parseRanges`:

```txt
"1-3, 6-8, 12-14" -> 3 ranges, selected 1,2,3,6,7,8,12,13,14
"5" -> one range 5-5
"1, 3, 7-9" -> three segments
"0" -> error
"-1" -> error
"999" when pageCount 24 -> error
"8-3" -> normalized to 3-8
"1-3, 2-4" -> valid with selected pages 1,2,3,4
"abc" -> error
```

### 26.2 Component smoke tests

If test setup exists, add minimal render tests for:

```txt
Dropzone
RangeTimeline
PdfThumbnailCard
ProgressRing
SearchInput
```

### 26.3 E2E smoke tests

Playwright:

- Home loads.
- Header links navigate.
- Tools search filters.
- Cut range input updates output summary.
- Organize page select all changes selected count.
- Success page copy filename does not throw.

---

## 27. Performance and Memory

### 27.1 Thumbnail performance

- Render thumbnails lazily.
- Start with first 8 pages visible.
- Render remaining pages in idle chunks.
- Use moderate scale for thumbnails, not full resolution.
- Cache thumbnails per file during session.
- Revoke old object URLs on file removal and component unmount.

### 27.2 CSS performance

- Limit `backdrop-filter` to panels, not full-page huge layers.
- Keep glow div count low.
- Avoid animating blur/filter continuously.
- Use transform/opacity for transitions.
- Use `will-change` sparingly only during drag/animation.

### 27.3 Image performance

- Use WebP for illustrations and mock thumbnails.
- Use PNG fallback only if needed.
- Do not load all floating illustrations on every page.
- Use `priority` only for above-the-fold hero assets.

---

## 28. Security and Privacy Notes

MVP client-side mode:

- Do not upload files to a server for merge/cut/organize.
- Use object URLs for local downloads.
- Revoke object URLs.
- Do not log file contents.
- Do not store files in localStorage or IndexedDB unless explicitly needed.

If backend processing is added later:

- Use short-lived upload URLs or direct multipart endpoint.
- Validate file type and size server-side.
- Store temporarily only if required.
- Implement deletion lifecycle before making deletion claims.
- Generate signed download URL with expiration if using object storage.
- Add rate limiting.
- Add malware scanning if public production upload endpoint is exposed.

---

## 29. Exact Build Order for the Coding Agent

Follow this order. Do not skip ahead.

1. Inspect repo and confirm whether `package.json` exists.
2. If absent, create Next.js app scaffold in current repo root.
3. Install dependencies:
   - `lucide-react`
   - `@dnd-kit/core`
   - `@dnd-kit/sortable`
   - `@dnd-kit/utilities`
   - `pdfjs-dist`
   - `pdf-lib`
   - `vitest` if not present
   - `@playwright/test` when visual QA begins
4. Copy assets into `public/assets` exactly as mapped.
5. Add design tokens and global CSS.
6. Build layout primitives.
7. Build button/panel/dropzone primitives.
8. Build icon components.
9. Build demo data.
10. Build card and thumbnail components.
11. Build home page.
12. Build upload page.
13. Build tools page.
14. Build merge page with demo data.
15. Add dnd-kit reorder to merge.
16. Build compress page with honest estimates.
17. Build convert page with format state.
18. Build range parser and tests.
19. Build cut page and synchronize range input/timeline/grid/summary.
20. Build organize page with selection/reorder/delete/rotate/duplicate state.
21. Build progress and success pages.
22. Add pdf.js thumbnail rendering.
23. Add pdf-lib merge/cut/organize exports.
24. Add object URL cleanup.
25. Add responsive pass.
26. Add accessibility pass.
27. Add Playwright screenshot generation.
28. Run lint/typecheck/tests/build.
29. Produce screenshot paths for architect review.

---

## 30. Agentic Workflow Contract

The coding agent should work in passes.

### Pass report format

After each pass, report:

```txt
Implemented:
- ...

Files changed:
- ...

Commands run:
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build

Known gaps:
- ...

Screenshots generated:
- reports/visual/latest/home-desktop.png
- ...
```

### Visual self-assessment rule

A text-only model must not say:

```txt
The page matches the reference perfectly.
```

It may say:

```txt
Screenshots have been generated for architect review.
The implementation follows the written layout and component constraints.
```

### When blocked

If a dependency or API behaves unexpectedly:

1. Do not replace the architecture ad hoc.
2. Add a small compatibility wrapper.
3. Keep the public component API stable.
4. Report the issue and the chosen workaround.

---

## 31. Page Acceptance Matrix

| Page | Route | Primary reference | Critical primitive | Must use asset |
|---|---:|---|---|---|
| Home | `/` | reference image 1 | Dropzone, ToolCard, GlassPanel | floating-pdf-left/right |
| Upload | `/upload` | reference image 3 | Dropzone, UploadIllustrationStage | all floating docs |
| Tools | `/tools` | reference image 2 | SearchInput, ToolCard, WorkflowCard | logo only |
| Merge | `/merge-pdf` | reference image 4 | PdfPageGrid, EditorToolbar | mock thumbnails |
| Compress | `/compress-pdf` | reference image 5 | Slider, Toggle, StatCard | mock thumbnails |
| Convert | `/convert-pdf` | reference image 6 | FormatPicker, PreviewPane | mock thumbnails |
| Cut | `/cut-pdf` | reference image 7 | RangeTimeline, PdfPageGrid | mock thumbnails |
| Organize | `/organize-pages` | reference image 8 | PdfPageGrid, SelectionBar | mock thumbnails |
| Processing | `/processing` | reference image 9 | ProgressRing, Stepper | optional PDF thumbnails |
| Success | `/success` | reference image 10 | ResultFileCard, FeedbackRatingBar | mock result thumbnail |

---

## 32. Common Failure Modes to Avoid

1. Generic dark dashboard panels.
2. Flat background with no atmospheric depth.
3. Header as a normal navbar instead of floating glass pill.
4. Buttons with simple blue background instead of gradient glow.
5. Dropzone as plain dashed rectangle.
6. Tool cards without icon tiles and hover affordance.
7. Thumbnails replaced by gray rectangles.
8. Selection state too subtle.
9. Desktop editor squeezed directly into mobile.
10. Compression or conversion claims that are not technically true.
11. Reference screenshots used as background images.
12. Hardcoded page-specific CSS instead of primitives.
13. Missing keyboard/focus states.
14. Drag/drop without keyboard fallback.
15. Object URLs never revoked.

---

## 33. Definition of Done

The implementation is acceptable only when:

1. All ten routes exist and render without console/runtime errors.
2. Shared primitives are used across pages.
3. Assets are mapped through `src/lib/assets.ts`.
4. Home/upload/tools pages visually express the premium prism direction.
5. Editor pages use realistic thumbnails and glass workspaces.
6. Merge/cut/organize have real or state-complete interactions.
7. Range parser is tested.
8. Upload validation is implemented.
9. Processing and success pages are complete.
10. Responsive layouts are intentionally adapted.
11. Accessibility requirements are met.
12. `pnpm lint` passes.
13. `pnpm typecheck` passes.
14. `pnpm test` passes.
15. `pnpm build` passes.
16. Playwright screenshots exist for all routes at desktop and mobile sizes.

---

## 34. Final Instruction to the Coding Agent

Build PrismPDF as a small, sharp, reusable product system. Do not overbuild infrastructure. Do not underbuild the visual primitives. The app wins or loses on the quality of `NeonBackdrop`, `GlassPanel`, `GradientButton`, `Dropzone`, `PdfThumbnailCard`, and editor state synchronization.

Start with the design system and route skeleton. Then assemble pages. Then add real client PDF functionality. Then run screenshot-based review. Keep privacy copy honest at every step.
