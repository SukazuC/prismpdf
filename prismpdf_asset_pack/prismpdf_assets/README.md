# PrismPDF Asset Pack

Generated frontend assets for the PrismPDF visual system.

## Includes

### Floating document hero art

Transparent PNG and lossless WebP variants, 900x900px:

- `assets/illustrations/floating-pdf-left.png`
- `assets/illustrations/floating-pdf-right.png`
- `assets/illustrations/floating-docx.png`
- `assets/illustrations/floating-pptx.png`
- `assets/illustrations/floating-generic-doc.png`

### Realistic mock PDF preview thumbnails

PNG and WebP variants, 720x1008px:

- `assets/mock/annual-report-cover.png`
- `assets/mock/annual-report-page-chart-1.png`
- `assets/mock/annual-report-page-chart-2.png`
- `assets/mock/annual-report-page-table.png`
- `assets/mock/product-guide-cover.png`
- `assets/mock/product-guide-page-phone.png`
- `assets/mock/financial-overview-page.png`

### Preview

- `previews/prismpdf-asset-contact-sheet.png`

## Usage notes

The floating document files are intended for marketing and upload-page atmosphere. They include transparent backgrounds and baked neon lighting, so place them above the CSS `NeonBackdrop` layers.

The PDF thumbnails are static mock/demo assets. Production thumbnails should still be rendered from uploaded PDFs using the application thumbnail pipeline.
