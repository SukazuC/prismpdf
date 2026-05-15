import { assets } from "@/lib/assets";
import type { PdfPage } from "@/lib/pdf/types";

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

const annualReportPages = [
  assets.mock.annualReportCover,
  assets.mock.annualReportChart1,
  assets.mock.annualReportChart2,
  assets.mock.annualReportTable,
  assets.mock.annualReportChart1,
  assets.mock.annualReportChart2,
  assets.mock.annualReportTable,
  assets.mock.annualReportCover,
  assets.mock.annualReportChart1,
  assets.mock.annualReportChart2,
  assets.mock.annualReportTable,
  assets.mock.annualReportChart1,
];

const productGuidePages = [
  assets.mock.productGuideCover,
  assets.mock.productGuidePhone,
  assets.mock.productGuideCover,
  assets.mock.productGuidePhone,
  assets.mock.productGuideCover,
  assets.mock.productGuidePhone,
  assets.mock.productGuideCover,
  assets.mock.productGuidePhone,
];

const financialOverviewPages = [
  assets.mock.financialOverview,
  assets.mock.financialOverview,
  assets.mock.financialOverview,
  assets.mock.financialOverview,
];

export function buildDemoPages(): PdfPage[] {
  const pages: PdfPage[] = [];
  let globalIndex = 0;

  const addFilePages = (fileId: string, fileName: string, thumbnails: string[]) => {
    thumbnails.forEach((url, localIndex) => {
      pages.push({
        id: `${fileId}-p${localIndex + 1}`,
        fileId,
        sourceFileName: fileName,
        globalIndex,
        localIndex: localIndex + 1,
        thumbnailUrl: url,
        rotation: 0,
        selected: false,
      });
      globalIndex++;
    });
  };

  addFilePages("annual-report-2024", "Annual Report 2024.pdf", annualReportPages);
  addFilePages("product-guide", "Product Guide.pdf", productGuidePages);
  addFilePages("financial-overview", "Financial Overview.pdf", financialOverviewPages);

  return pages;
}

export const demoPages = buildDemoPages();

export function getPagesForFile(fileId: string): PdfPage[] {
  return demoPages.filter((p) => p.fileId === fileId);
}

export { formatBytes } from "@/lib/files/format-bytes";
