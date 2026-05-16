# PrismPDF Front-End Architecture Handoff

## Purpose

This document synthesizes the full design direction, page structure, component system, required assets, interaction model, and implementation constraints for **PrismPDF**, a premium web app for PDF utilities such as merge, compress, convert, cut, and organize pages.

The target product should feel substantially more polished than common PDF utility websites. The intended positioning is:

- No ads.
- No account requirement.
- No pricing noise.
- Fast task completion.
- Clean, premium, visually memorable experience.
- Strong privacy reassurance.
- Beautiful dark glassmorphism interface with neon prism accents.

The design language is not a generic dark SaaS UI. It is a cinematic, glassy, high-contrast PDF workspace using layered depth, translucent cards, gradient borders, luminous CTAs, realistic PDF thumbnails, and controlled neon effects.

---

# 1. Core Product Principles

## 1.1 User experience principles

1. **Immediate utility**
   - The upload/drop action must always be obvious.
   - Users should never need to create an account, dismiss ads, or choose a paid plan.

2. **Visual confidence**
   - Every tool should feel reliable and precise.
   - Processing and success states must communicate safety, progress, and completion clearly.

3. **Low cognitive load**
   - Primary workflows should be presented as clear step-by-step interfaces.
   - Advanced controls can exist, but should not dominate the page.

4. **Premium simplicity**
   - The app should feel beautiful but not noisy.
   - Animations should be subtle.
   - Neon effects should signal interactivity and selection, not decorate everything equally.

5. **Reusable implementation**
   - The same shell, panels, buttons, cards, thumbnails, icons, and editor controls must be reused across pages.
   - Do not build screenshot-specific one-off layouts.

---

# 2. Visual Language

## 2.1 Overall style

The interface is built from:

- Deep navy/black base background.
- Blue, cyan, violet, and magenta radial glows.
- Translucent glass panels.
- Thin luminous borders.
- Gradient primary buttons.
- Realistic PDF thumbnails.
- Floating glass document illustrations on marketing/upload pages.
- Subtle grain/noise texture.
- Soft shadows and glow layers.

The result should feel like a premium "dark prism workspace."

## 2.2 Color tokens

Use global tokens. Do not hardcode page-specific colors.

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

  --gradient-primary: linear-gradient(
    135deg,
    #28c7ff 0%,
    #1668ff 42%,
    #a855f7 72%,
    #f04cff 100%
  );

  --gradient-panel: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.18),
    rgba(168, 85, 247, 0.14)
  );

  --gradient-border: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.9),
    rgba(124, 58, 237, 0.75),
    rgba(236, 72, 153, 0.8)
  );

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --shadow-panel: 0 24px 80px rgba(0, 0, 0, 0.42);
  --shadow-glow-blue: 0 0 40px rgba(56, 189, 248, 0.22);
  --shadow-glow-purple: 0 0 48px rgba(168, 85, 247, 0.26);
  --shadow-button:
    0 0 32px rgba(59, 130, 246, 0.42),
    0 0 42px rgba(168, 85, 247, 0.28);
}
```

## 2.3 Typography

Recommended font options:

- Inter
- Geist Sans
- Satoshi
- Plus Jakarta Sans

Suggested hierarchy:

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

Gradient text should be reserved for high-value words such as:

- PDF
- ready
- savings percentages

```css
.gradient-text {
  background: linear-gradient(
    135deg,
    #38bdf8 10%,
    #3b82f6 40%,
    #a855f7 70%,
    #ec4899 95%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

# 3. Layout System

## 3.1 Desktop shell

The screenshots are desktop-first. Most pages should use a centered shell:

```css
.page-shell {
  width: min(100% - 96px, 1420px);
  margin-inline: auto;
}
```

For dense editor pages:

```css
.editor-shell {
  width: min(100% - 72px, 1480px);
  margin-inline: auto;
}
```

## 3.2 Responsive breakpoints

```txt
Mobile:  < 640px
Tablet:  640px - 1023px
Desktop: 1024px - 1439px
Wide:    1440px+
```

## 3.3 Mobile rules

Do not shrink the desktop editor directly into mobile. Mobile needs task-oriented simplification:

- Header nav collapses into a menu.
- Upload CTA remains visible.
- Hero sections become single-column.
- Floating documents are hidden or reduced.
- Tool cards become one column.
- Sidebars become drawers.
- Editor pages split into:
  1. Settings step.
  2. Page editing step.
- Dense page grids use smaller cards or horizontal scroll.

---

# 4. Global UI Primitives

## 4.1 App shell

All pages should share:

```tsx
<AppShell>
  <NeonBackdrop />
  <AppHeader />
  <main>{children}</main>
  <AppFooter />
</AppShell>
```

Dense editor pages may use `EditorShell` but should still share the same header, background system, and panel language.

## 4.2 Header

The header is a floating pill-shaped glass nav.

Desktop structure:

```txt
Left:   Prism logo + PrismPDF
Center: Merge | Compress | Convert | Cut PDF | All tools
Right:  Choose PDF files / Choose files CTA
```

Requirements:

- Height: about 72px.
- Border radius: pill.
- Max width: 1380px to 1420px.
- Top margin: 16px.
- Active nav item has subtle glow/underline.
- Upload CTA always visible.
- "All tools" includes chevron.

## 4.3 Footer

The footer mirrors the header:

```txt
Left:   Logo + copyright
Center: Nav links
Right:  Lock icon + "Secure by design. Built for simplicity."
```

Use the same glass pill treatment.

## 4.4 Neon backdrop

Do not use one large background image. Build atmosphere with CSS layers.

```tsx
function NeonBackdrop({ variant = "default" }) {
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

```css
.neon-backdrop {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 18%, rgba(124, 58, 237, 0.26), transparent 28%),
    radial-gradient(circle at 82% 42%, rgba(14, 165, 233, 0.24), transparent 30%),
    radial-gradient(circle at 56% 90%, rgba(168, 85, 247, 0.16), transparent 36%),
    linear-gradient(180deg, #020617 0%, #030816 50%, #020617 100%);
}

.glow {
  position: absolute;
  filter: blur(44px);
  opacity: 0.75;
  pointer-events: none;
}

.glow-cyan {
  width: 520px;
  height: 180px;
  right: 4%;
  top: 36%;
  background: rgba(34, 211, 238, 0.28);
  transform: rotate(-22deg);
}

.glow-violet {
  width: 560px;
  height: 180px;
  left: -8%;
  top: 22%;
  background: rgba(147, 51, 234, 0.24);
  transform: rotate(18deg);
}

.noise-layer {
  position: absolute;
  inset: 0;
  opacity: 0.055;
  background-image: url("/assets/textures/noise.png");
  mix-blend-mode: screen;
}
```

## 4.5 Glass panel

This is the most important primitive. Every major panel, card, editor surface, footer, and modal should use this language.

```tsx
function GlassPanel({
  children,
  className,
  intensity = "default",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "soft" | "default" | "strong";
}) {
  return (
    <section className={`glass-panel glass-panel--${intensity} ${className ?? ""}`}>
      {children}
    </section>
  );
}
```

```css
.glass-panel {
  position: relative;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(8, 15, 34, 0.74)),
    var(--gradient-panel);
  border: 1px solid var(--stroke-soft);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(24px);
  overflow: hidden;
}

.glass-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(147, 197, 253, 0.55),
    rgba(168, 85, 247, 0.28),
    rgba(236, 72, 153, 0.34)
  );
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

.glass-panel::after {
  content: "";
  position: absolute;
  width: 45%;
  height: 2px;
  left: 12%;
  top: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.95),
    rgba(168, 85, 247, 0.9),
    transparent
  );
  opacity: 0.65;
  pointer-events: none;
}
```

If this primitive is skipped, the app will not match the references.

## 4.6 Primary glow button

```tsx
<Button variant="primaryGlow">Choose PDF files</Button>
```

```css
.btn-primary-glow {
  height: 48px;
  padding-inline: 30px;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  background: var(--gradient-primary);
  box-shadow: var(--shadow-button);
  border: 1px solid rgba(255, 255, 255, 0.26);
  position: relative;
  overflow: hidden;
  transition: transform 180ms ease, filter 180ms ease;
}

.btn-primary-glow::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.24), transparent 44%);
  pointer-events: none;
}

.btn-primary-glow:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}
```

---

# 5. Required Shared Components

Build these before implementing individual pages.

```txt
AppShell
EditorShell
AppHeader
AppFooter
NeonBackdrop
GlassPanel
GradientButton
SecondaryButton
IconButton
IconTile
TrustPill
Dropzone
ToolCard
WorkflowCard
FormatBadge
FormatPicker
StatCard
StatItem
FileRow
PdfThumbnailCard
PdfPageGrid
EditorToolbar
LeftWorkflowPanel
RangeTimeline
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

---

# 6. Asset Requirements

## 6.1 Must-have assets

### Brand

Prefer SVG.

```txt
/assets/brand/prism-logo.svg
/assets/brand/prism-logo-mark.svg
/assets/brand/prism-logo-horizontal.svg
```

### Floating document illustrations

Transparent PNG or WebP. These provide major visual gain.

```txt
/assets/illustrations/floating-pdf-left.png
/assets/illustrations/floating-pdf-right.png
/assets/illustrations/floating-docx.png
/assets/illustrations/floating-pptx.png
/assets/illustrations/floating-generic-doc.png
```

Recommended export:

```txt
Transparent background
Minimum width: 900px
Soft blue/violet/magenta lighting baked in
Glassy document appearance
```

### Mock/demo PDF thumbnails

In production, thumbnails should be generated from uploaded PDFs. For marketing/demo states, use static assets.

```txt
/assets/mock/annual-report-cover.png
/assets/mock/annual-report-page-chart-1.png
/assets/mock/annual-report-page-chart-2.png
/assets/mock/annual-report-page-table.png
/assets/mock/product-guide-cover.png
/assets/mock/product-guide-page-phone.png
/assets/mock/financial-overview-page.png
```

### File format icons

Prefer SVG components, not PNG.

Required formats:

```txt
PDF
DOCX
XLSX
PPTX
JPG
PNG
TXT
OCR
```

### Optional texture

```txt
/assets/textures/noise.png
```

Use a subtle 128x128 transparent noise PNG.

## 6.2 What should be code, not image assets

Implement these with CSS/SVG/components:

- Background gradients.
- Glass panels.
- Buttons.
- Cards.
- Borders.
- Glows.
- Progress rings.
- Confetti.
- Format badges.
- Tool icons where feasible.
- Range timeline.
- Page grids.
- Sliders.
- Toggles.
- Feedback rating bar.
- Stepper.

---

# 7. Page Specifications

---

## 7.1 Home / Landing Page

### Purpose

Primary conversion page. It should communicate:

- PDF tool suite.
- Fast.
- Private.
- No signup.
- Upload immediately.
- Core tools are one click away.

### Layout

```txt
Header
Hero: two columns
  Left:
    headline
    subtitle
    trust pills
  Right:
    upload dropzone
Tool cards row
Bottom row:
  How it works panel
  Privacy/security panel
Footer
```

### Hero content

```txt
The new era
of PDF tools

Powerful. Fast. Beautiful. All the tools you need
to work with PDFs, in one seamless experience.
```

The word `PDF` should use gradient text.

### Trust pills

```txt
Fast
Private
No signup
```

Each pill has a small neon icon.

### Hero dropzone

Structure:

```txt
Large glass card
  Inner dashed dropzone
    Floating file icon
    "Drop your PDF files here"
    "or"
    Choose PDF files CTA
    Lock note: "Your files are encrypted and never stored."
```

Recommended desktop size:

```css
width: 640px;
min-height: 360px;
border-radius: 32px;
```

### Tool cards

Four cards:

```txt
Merge PDF
Compress PDF
Convert PDF
Cut PDF
```

Each card includes:

- Icon tile.
- Title.
- Short description.
- Circular arrow.
- Hover lift.
- Glowing icon state.

### How it works panel

Three steps:

```txt
1. Upload
2. We process
3. Download
```

Use dotted connector lines.

### Privacy panel

```txt
Simple. Private. Secure.

Your privacy comes first
Everything happens in the cloud
No signup. No hassle.
```

### Required assets

- Prism logo SVG.
- Floating PDF document PNGs.
- Optional mock document visuals.

### Fidelity risks

- Flat background.
- Plain cards without glass treatment.
- Weak CTA.
- Missing floating document atmosphere.

---

## 7.2 Universal Upload Page

### Purpose

Focused upload entry page for tools supporting multiple file types.

### Layout

```txt
Header
Large centered upload dropzone
Floating document illustrations left/right
Quick-start tool cards
Supported file types + privacy panel
Footer
```

### Main dropzone

Content:

```txt
Drop your files here
or
Choose files
Files are encrypted and never stored.
```

Recommended desktop size:

```css
width: 820px;
height: 390px;
```

### Floating illustrations

Left:

```txt
PDF sheet
Generic dark sheet
```

Right:

```txt
DOCX sheet
PPTX sheet
```

These are background visuals only.

### Quick-start cards

```txt
Merge PDF
Compress PDF
Convert PDF
Cut PDF
```

### Supported file types

```txt
PDF (.pdf)
DOCX (.docx)
XLSX (.xlsx)
PPTX (.pptx)
JPG (.jpg)
PNG (.png)
+20 more
```

### Privacy items

```txt
Private & Secure
Cloud Processing
We don't save files
```

### Required assets

- Floating document PNGs.
- Format icon SVGs.

### Fidelity risks

- The page loses much of its premium feel without floating transparent document illustrations.
- The dropzone must feel like a luminous glass vault, not a normal dashed rectangle.

---

## 7.3 All PDF Tools Page

### Purpose

Tool directory and discovery page.

### Layout

```txt
Header with All tools active
Top:
  Title block
  Search box
Hero upload banner
Main grid:
  Popular workflows card
  Four primary tool cards
More tools row
Privacy feature band
Footer
```

### Title block

```txt
All PDF tools
Powerful tools to work with PDFs.
Fast, secure, and effortless.
```

### Search

```txt
Search tools...
⌘ K
```

Requirements:

- Client-side filtering.
- Cmd/Ctrl + K focuses input.
- Empty state for no results.

### Upload banner

Wide horizontal dropzone:

```txt
Drop your PDF files here
or
Choose PDF files
```

Right-side benefits:

```txt
Works with multiple files
Up to 200 MB per file
Your files are encrypted
Secure and private
```

### Popular workflows

```txt
Merge → Compress
Convert → Merge
Extract pages

Explore workflows →
```

### Primary tools

```txt
Merge PDF
Compress PDF
Convert PDF
Cut PDF
```

### More tools

```txt
Reorder pages
Extract images
Protect PDF
Add watermark
Rotate PDF
OCR
```

Each has a `Coming soon` pill.

### Privacy band

```txt
Your privacy comes first
Everything happens in the cloud
No signup. No hassle.
Blazing fast tools.
```

### Required assets

- Tool icons as SVG components.
- No PNG required.

### Fidelity risks

- Too much density.
- Generic grid cards.
- Weak upload banner.

---

## 7.4 Merge PDF Page

### Purpose

Functional editor for combining multiple PDFs.

### Layout

```txt
Header
Page header:
  title/subtitle
  stats card
Main:
  left workflow sidebar
  right page arrangement canvas
Bottom:
  how it works strip
```

### Header content

```txt
Merge PDF
Combine multiple PDFs into a single, beautiful document.
```

### Stats

```txt
3 Files Uploaded
24 Pages Total
24 Pages Final output
```

### Left sidebar

Sections:

```txt
1. Upload files
2. Merge settings
3. Output file
```

#### Upload files

```txt
Choose PDF files
or drag & drop PDFs here

Annual Report 2024.pdf
12 pages · 4.2 MB

Product Guide.pdf
8 pages · 2.1 MB

Financial Overview.pdf
4 pages · 1.4 MB
```

Each file row has:

- File icon.
- Name.
- Metadata.
- Remove button.

#### Merge settings

Initially collapsed.

Future options may include:

- Preserve bookmarks.
- Normalize page size.
- Compress after merge.
- Include file separators.
- Sort by file name.

#### Output file

```txt
Merged Document.pdf
Merge files →
```

### Page arrangement canvas

Group pages by source document:

```txt
Annual Report 2024.pdf — 12 pages
[page cards]

Product Guide.pdf — 8 pages
[page cards]

Financial Overview.pdf — 4 pages
[page cards]
```

Each `PdfThumbnailCard` includes:

- Thumbnail.
- Global page number.
- Local page label.
- Drag handle.
- Selection state.
- Hover state.
- Optional overflow menu.

Selected page state:

- Neon blue/purple border.
- Glow.
- Slight lift.

### Toolbar

```txt
Fit to width
Zoom out
Zoom slider
Zoom in
Grid/list toggle
```

### How it works

```txt
Upload → Arrange → Merge
```

### Required assets

- PDF thumbnails from uploaded files.
- Demo thumbnails for initial mock state.
- Merge icon SVG.

### Implementation notes

Use:

```txt
@dnd-kit/core
@dnd-kit/sortable
```

Avoid `react-beautiful-dnd`.

### Fidelity risks

- Using empty placeholders instead of realistic thumbnails.
- Weak drag handles.
- Page cards looking like admin UI cells.

---

## 7.5 Compress PDF Page

### Purpose

Compression tool with confidence-building before/after preview.

### Layout

```txt
Header
Page header:
  title/subtitle
  savings summary
Main:
  left compression settings
  right before/after preview
Bottom:
  estimated download size
  recommendation card
```

### Header content

```txt
Compress PDF
Reduce file size while maintaining quality.
```

### Stats card

```txt
Original size: 18.4 MB
Estimated size: 6.1 MB
Space savings: 66.8%
```

Use green for savings.

### Left sidebar

#### Uploaded file

```txt
Annual Report 2024.pdf
12 pages · 18.4 MB
Replace
```

#### Compression level

Options:

```txt
Low
Best quality, larger file
~10% smaller

Balanced
Good quality, good compression
~60% smaller

Strong
Smaller size, lower quality
~80% smaller
```

Selected option uses neon border and check mark.

#### Quality slider

```txt
Low ---- 75% ---- High
```

#### Optimize images

Toggle:

```txt
Downscale images and remove metadata
```

#### CTA

```txt
Compress file →
```

### Preview

```txt
Compression preview
Compare
```

Split layout:

```txt
Before
18.4 MB
[3 thumbnails]

After (Estimated)
6.1 MB
[3 thumbnails]
```

Center comparison handle may be real or decorative in MVP.

### Bottom cards

```txt
Estimated download size
Original size: 18.4 MB
Estimated size: 6.1 MB
Savings: 12.3 MB (66.8%)

Great choice!
Balanced compression provides great quality while saving space.
```

### Required assets

- PDF thumbnails.
- Compression icon SVG.

### Fidelity risks

- Before/after preview must use real page thumbnails.
- Compression option cards must not look like normal radio buttons.

---

## 7.6 Convert PDF Page

### Purpose

Convert PDF into Word, JPG, PNG, PowerPoint, or text.

### Layout

```txt
Header
Title block
Main:
  left source/settings sidebar
  right conversion workspace
    format picker
    preview comparison
    supported formats strip
```

### Title

```txt
Convert PDF
Convert PDFs to Word, JPG, PNG, PowerPoint, or Text.
```

### Left sidebar

#### Source file

```txt
Annual Report 2024.pdf
12 pages · 4.2 MB
Replace file
```

#### File details

```txt
Pages
File size
Created
Last modified
```

#### Conversion settings

Fields:

```txt
Output format dropdown
Page range:
  All pages
  Current page
  Custom range
Custom range input
Preserve layout & formatting toggle
Extract images toggle
Image quality dropdown
Output filename input
```

#### CTA

```txt
Convert file
```

### Format picker

Tiles:

```txt
Word (.docx)
JPG (.jpg)
PNG (.png)
PowerPoint (.pptx)
Text (.txt)
```

Selected format tile has a neon border.

### Preview comparison

Left:

```txt
Source PDF
Page 1 of 12
```

Right:

```txt
Output Preview (Word)
Page 1 of 12 (Estimated)
```

Middle:

```txt
Arrow transition button
```

Preview controls:

```txt
Zoom out
100%
Zoom in
Fullscreen
```

### Supported formats strip

```txt
Supported formats:
Word (.docx)
JPG (.jpg)
PNG (.png)
PowerPoint (.pptx)
Text (.txt)
Learn more
```

### Required assets

- Source/output mock thumbnails.
- Format SVG icons.

### Fidelity risks

- Format cards must be prominent, not tiny radios.
- Output preview must look credible.

---

## 7.7 Cut PDF Page

### Purpose

Extract pages, split by range, or split every N pages.

### Layout

```txt
Header
Title block
Stats card
Main:
  left method/settings sidebar
  right range editor
```

### Title

```txt
Cut PDF
Extract pages or split documents exactly how you need.
```

### Stats

```txt
24 Pages total
8 Pages selected
2 Ranges
24.1 MB Original size
```

### Left sidebar

#### Select cut method

```txt
Split by range
Extract selected pages
Split every N pages
```

Selected method gets full gradient highlight.

#### Choose ranges

Input:

```txt
1-3, 6-8, 12-14
```

Helper:

```txt
Enter page numbers and ranges separated by commas
```

#### Output settings

```txt
Output filename
Naming pattern dropdown
Open files after export checkbox
```

#### CTA

```txt
Extract pages →
```

### Right editor

Document header:

```txt
Annual Report 2024.pdf
24 pages · 24.1 MB
```

Toolbar:

```txt
Fit to width
Undo
Redo
Zoom
Grid/list toggle
```

### Range timeline

Timeline from 1 to 24.

Selected ranges:

```txt
1-3
6-8
12-14
```

Data model:

```ts
type PageRange = {
  id: string;
  start: number;
  end: number;
};
```

Timeline requirements:

- Selected ranges shown as neon bars.
- Handles are draggable.
- Range label floats above bar.
- Timeline updates selected thumbnails.
- Text input and timeline state remain synchronized.

### Page grid

24 thumbnails.

Selected pages:

- Glowing border.
- Check mark.
- Gradient overlay.
- Stronger visibility.

Unselected pages:

- Dimmed.
- Inactive check circle.

### Output summary

```txt
You will get 3 PDF file(s)

Part 1 — Pages 1-3
Part 2 — Pages 6-8
Part 3 — Pages 12-14
```

### Required assets

- PDF thumbnails.
- Cut/scissor icon SVG.

### Fidelity risks

- Range timeline cannot be a weak static decoration.
- Selection mapping must be visually obvious.

---

## 7.8 Organize Pages Page

### Purpose

Power-user page for reordering, rotating, deleting, duplicating, extracting, and adding pages.

### Layout

```txt
Header
Breadcrumb
Title
Main editor:
  left document sidebar
  center page grid
  right properties/actions sidebar
Footer
```

### Breadcrumb

```txt
← All tools > Organize pages
```

### Title

```txt
Organize pages
Reorder, rotate, add, remove, and organize pages in your PDF.
```

### Left sidebar

Document card:

```txt
Annual Report 2024.pdf
24 pages · 4.2 MB
```

Page range:

```txt
All pages (1-24)
```

Selected count:

```txt
24 pages selected
```

Bulk actions:

```txt
Select all
Deselect all
Reverse selection
Odd pages
Even pages
```

Insert new page:

```txt
Blank page
From file
From clipboard
```

Tip box:

```txt
Tip: Drag and drop pages to reorder them.
Hold Shift or Ctrl/Cmd to select multiple.
```

### Center toolbar

Actions:

```txt
Rotate left
Rotate right
Delete
Duplicate
Extract
Insert
More
```

Right controls:

```txt
Undo
Redo
Zoom
Grid/list toggle
```

### Page grid

Target desktop:

```css
grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
gap: 14px;
```

Aim for 6 columns on wide desktop.

Each page card includes:

- Thumbnail.
- Page number.
- Drag handle.
- Selection checkbox.
- Hover actions.
- Neon selected state.

### Right sidebar

Page properties:

```txt
3 pages selected

Size: A4 (210 x 297 mm)
Orientation: Portrait
Color mode: RGB
File size: 1.2 MB estimated
```

Quick actions:

```txt
Rotate left
Rotate right
Delete
Duplicate
Extract pages
Add page numbers
```

Reorder controls:

```txt
Up
Down
Left
Right
```

### Required assets

- PDF thumbnails.
- Action SVG icons.

### Fidelity risks

- The screen must feel like a lightweight design/editor tool, not an admin dashboard.
- Do not reduce thumbnails too far; document content must remain readable.

---

## 7.9 Processing Page

### Purpose

Show progress while an operation is running.

### Layout

```txt
Header
Blurred contextual background
Central processing card
Queue card
Keep tab open card
Footer
```

### Central card

Left:

```txt
Circular progress ring
72%
Overall progress
```

Center:

```txt
Annual Report 2024.pdf
Merging 24 pages

Merging pages
Please wait while we create your perfect PDF.

Estimated time remaining
18 seconds
```

Right stepper:

```txt
1. Preparing files — Completed
2. Validating pages — Completed
3. Reordering pages — Completed
4. Merging pages — In progress
5. Finalizing PDF — Pending
```

### Progress ring

Use SVG.

Requirements:

- Dark base track.
- Cyan to blue to violet to magenta gradient stroke.
- Rounded stroke caps.
- Glow filter.
- Animated progress.
- Accessible `aria-valuenow`.

### Queue card

```txt
Your queue
1 active

Annual Report 2024.pdf
Merging 24 pages
72%
18s left
Cancel
```

### Keep tab open card

```txt
You can keep this tab open
We'll continue processing even if you switch tabs.
```

### Required assets

No PNG required. Use SVG/code.

### Fidelity risks

- Weak progress ring will make the screen feel cheap.
- Stepper states must be clear and calm.

---

## 7.10 Success / File Ready Page

### Purpose

Reward state after task completion.

### Layout

```txt
Header
Success hero
Primary CTA row
Result details card + task summary card
Feedback bar
Footer
```

### Success hero

```txt
Your file is ready

We've successfully processed your PDF.
You can download it, preview it, or start another task.
```

The word `ready` uses gradient text.

Visuals:

- Green glowing check orb.
- Confetti particles.
- Large centered headline.
- Large primary CTA.

### Primary action

```txt
Download PDF
```

Secondary actions:

```txt
Open preview
Copy file name
Start another task
```

### Result file card

```txt
Merged Document.pdf
Merge PDF

24 Pages
4.2 MB File size
PDF Format

Your file is encrypted and will be automatically deleted from our servers in 24 hours.
```

`24 hours` should be cyan/blue.

### Task summary card

```txt
Task summary

Operation: Merge PDF
Input files: 4 files
Total pages: 24 pages
Output format: PDF

Space saved: ~7.3 MB

Great job! You saved 63% compared to the original files.
```

### Feedback bar

```txt
How was your experience?
Your feedback helps us improve PrismPDF.

Very bad
Bad
Okay
Good
Excellent
```

Selected rating uses purple glow.

### Required assets

- Result PDF thumbnail.
- Confetti can be code-generated.
- Check orb can be CSS/SVG.

### Fidelity risks

- Page needs a reward feeling without becoming childish.
- The result card and summary card must feel substantial and trustworthy.

---

# 8. Interaction Model

## 8.1 Upload states

Every dropzone must support:

```txt
idle
hover
drag-over
uploading
error
success
disabled
```

Functional requirements:

- Click opens file picker.
- Drag enter/over/leave.
- Drop files.
- Multiple files where applicable.
- File type validation.
- File size validation.
- Inline error messages.
- Progress display when uploading/processing.

## 8.2 Drag and drop page reordering

Used on:

- Merge PDF
- Organize pages

Requirements:

- Visible drag handle.
- Card lifts during drag.
- Drop indicator appears.
- Page order updates immediately.
- Undo support on organize page.

Recommended library:

```txt
@dnd-kit/core
@dnd-kit/sortable
```

## 8.3 Range selection

Used on Cut PDF.

Input example:

```txt
1-3, 6-8, 12-14
```

Parser output:

```ts
[
  { id: "range-1", start: 1, end: 3 },
  { id: "range-2", start: 6, end: 8 },
  { id: "range-3", start: 12, end: 14 }
]
```

Validation requirements:

- No zero or negative pages.
- No pages beyond total count.
- Support comma-separated pages and ranges.
- Normalize reversed ranges if desired, or show error.
- Show inline validation, not alert dialogs.
- Keep input, timeline, thumbnails, and output summary synchronized.

## 8.4 Keyboard shortcuts

Minimum shortcuts:

```txt
Cmd/Ctrl + K    Focus tool search
Cmd/Ctrl + Z    Undo editor action
Shift + click   Range select pages
Delete          Delete selected pages
Esc             Clear selection / close modal
```

---

# 9. Accessibility Requirements

Even though the design is visual-heavy, it must be accessible.

Required:

- Buttons must be actual `button` or `a` elements.
- Tool cards should be links/buttons, not clickable divs.
- Dropzones must be keyboard operable.
- File inputs need accessible labels.
- Icon-only buttons need `aria-label`.
- Progress rings need `aria-valuenow`.
- Processing updates should use `aria-live="polite"`.
- Selected page cards should use `aria-selected`.
- Toggle states should use `aria-pressed` or semantic switches.
- Focus states must be visible.

Recommended focus style:

```css
:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.9);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.16);
}
```

---

# 10. Animation Direction

Animations should be restrained and premium.

Use:

- Slow ambient background drift.
- Button hover lift.
- Panel glow pulse on active state.
- Dropzone highlight on drag-over.
- Progress ring animation.
- Success check scale-in.
- Light confetti on success.

Avoid:

- Excessive bouncing.
- Fast spinning gradients.
- Animated text gimmicks.
- Continuous animation on every card.

Recommended durations:

```txt
Hover:        140-220ms
Panel enter:  280-420ms
Modal enter:  360-520ms
Background:   12-24s drift
```

---

# 11. Recommended Front-End Stack

The final stack is up to the architect, but this design maps cleanly to:

```txt
Next.js / React
TypeScript
Tailwind CSS or CSS Modules
Framer Motion
Lucide React for generic icons
Custom SVG icons for branded icons
@dnd-kit for drag/drop
pdf.js for PDF thumbnails
```

## 11.1 Suggested technical modules

```txt
/components/shell
/components/glass
/components/buttons
/components/dropzone
/components/cards
/components/editor
/components/pdf
/components/progress
/components/forms
/components/icons
/lib/pdf
/lib/ranges
/lib/files
/lib/formatters
/lib/shortcuts
```

## 11.2 Suggested PDF-related implementation

- Use `pdf.js` to render thumbnails client-side where possible.
- Generate page previews after upload.
- Cache thumbnails in memory during the workflow.
- Use object URLs carefully and revoke them on cleanup.
- For real server-side operations, upload files only after the user starts a task if privacy architecture allows.
- Never show misleading privacy copy unless the backend matches it.

---

# 12. Data Models

## 12.1 Uploaded file

```ts
type UploadedFile = {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  type: string;
  thumbnails?: PdfPageThumbnail[];
  status: "queued" | "uploading" | "ready" | "error";
  errorMessage?: string;
};
```

## 12.2 PDF page

```ts
type PdfPage = {
  id: string;
  fileId: string;
  globalIndex: number;
  localIndex: number;
  thumbnailUrl: string;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
};
```

## 12.3 Page range

```ts
type PageRange = {
  id: string;
  start: number;
  end: number;
};
```

## 12.4 Processing task

```ts
type ProcessingTask = {
  id: string;
  operation: "merge" | "compress" | "convert" | "cut" | "organize";
  fileName: string;
  progress: number;
  currentStep: string;
  estimatedSecondsRemaining?: number;
  status: "queued" | "processing" | "success" | "error" | "cancelled";
};
```

## 12.5 Result file

```ts
type ResultFile = {
  id: string;
  name: string;
  operation: string;
  format: "pdf" | "docx" | "jpg" | "png" | "pptx" | "txt";
  sizeBytes: number;
  pageCount?: number;
  downloadUrl: string;
  previewUrl?: string;
  expiresAt?: string;
};
```

---

# 13. Quality Gates

Do not accept the implementation unless all of the following are true.

## Visual gates

1. The background has visible depth and atmosphere.
2. Main panels use glassmorphism with blur, translucent fill, gradient border, and glow.
3. The primary CTA is luminous and gradient-based.
4. Editor thumbnails look like real PDF pages.
5. Selection states are unmistakably neon and interactive.
6. The product remains free of ads, upsells, pricing prompts, or account pressure.
7. Spacing feels premium, not cramped.
8. Dense editor pages remain elegant.
9. Shared components are reused consistently.
10. The result does not look like generic Tailwind dark mode.

## Functional gates

1. Upload works by click and drag/drop.
2. Validation errors are inline.
3. Page reordering works.
4. Range selection syncs input, timeline, thumbnails, and output summary.
5. Processing state has real progress and cancel affordance.
6. Success state has download, preview, copy filename, and start another task.
7. Keyboard shortcuts work where expected.
8. Focus states are visible.
9. Mobile layouts are intentionally adapted, not merely squeezed.

---

# 14. Implementation Priority

Recommended build order:

```txt
1. Design tokens
2. App shell, header, footer
3. Neon backdrop
4. GlassPanel primitive
5. Button system
6. IconTile and file format icons
7. Dropzone
8. ToolCard and StatCard
9. PDF thumbnail card
10. Editor toolbar
11. Home page
12. Universal upload page
13. All tools page
14. Merge editor
15. Compress editor
16. Convert editor
17. Cut editor
18. Organize editor
19. Processing page
20. Success page
21. Responsive passes
22. Accessibility pass
23. Animation polish
```

---

# 15. Final Architect Summary

PrismPDF should be implemented as a reusable front-end system around a small number of strong primitives:

- `NeonBackdrop`
- `GlassPanel`
- `GradientButton`
- `Dropzone`
- `ToolCard`
- `PdfThumbnailCard`
- `EditorToolbar`
- `StatCard`
- `ProgressRing`

The reference design is highly achievable in code. The only assets that materially affect visual fidelity are:

1. Prism logo SVG.
2. Floating transparent document illustrations.
3. Realistic PDF preview thumbnails.

Everything else should be generated through components, CSS, and SVG.

The main implementation danger is visual simplification. If the developer implements normal dark cards, normal borders, and generic buttons, the product will not match the design. The glass panel system, neon gradient edges, luminous CTA, realistic thumbnails, and premium spacing are mandatory for the app to feel like the reference images.

