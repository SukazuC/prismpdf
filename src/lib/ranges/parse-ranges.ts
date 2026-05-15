export type PageRange = {
  id: string;
  start: number;
  end: number;
};

export type ParseRangeResult =
  | { ok: true; ranges: PageRange[]; selectedPages: number[]; normalizedInput: string }
  | { ok: false; error: string };

let rangeIdCounter = 0;
function nextId(): string {
  rangeIdCounter++;
  return `range-${rangeIdCounter}`;
}

export function resetRangeIds() {
  rangeIdCounter = 0;
}

export function parseRanges(input: string, pageCount: number): ParseRangeResult {
  if (!pageCount || pageCount < 1) {
    return { ok: false, error: "Page count must be at least 1." };
  }

  if (!input || !input.trim()) {
    return { ok: false, error: "Please enter a page range." };
  }

  const trimmed = input.trim();

  // Split by comma
  const segments = trimmed.split(",").map((s) => s.trim());

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "")) {
    return { ok: false, error: "Please enter a page range." };
  }

  const ranges: PageRange[] = [];
  const selectedSet = new Set<number>();
  const errors: string[] = [];

  for (const segment of segments) {
    if (!segment) continue;

    // Check if it's a range (contains "-")
    if (segment.includes("-")) {
      const parts = segment.split("-").map((s) => s.trim());
      if (parts.length !== 2 || parts[0] === "" || parts[1] === "") {
        errors.push(`Invalid range: "${segment}"`);
        continue;
      }

      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);

      if (isNaN(start) || isNaN(end)) {
        errors.push(`Invalid range: "${segment}"`);
        continue;
      }

      if (start < 1 || end < 1) {
        errors.push(`Page numbers must be 1 or greater: "${segment}"`);
        continue;
      }

      if (start > pageCount || end > pageCount) {
        errors.push(
          `Page numbers exceed document (${pageCount} pages): "${segment}"`
        );
        continue;
      }

      const rangeStart = Math.min(start, end);
      const rangeEnd = Math.max(start, end);
      ranges.push({ id: nextId(), start: rangeStart, end: rangeEnd });

      for (let p = rangeStart; p <= rangeEnd; p++) {
        selectedSet.add(p);
      }
    } else {
      // Single page
      const page = parseInt(segment, 10);
      if (isNaN(page)) {
        errors.push(`Invalid page number: "${segment}"`);
        continue;
      }

      if (page < 1) {
        errors.push(`Page numbers must be 1 or greater: "${segment}"`);
        continue;
      }

      if (page > pageCount) {
        errors.push(
          `Page number ${page} exceeds document (${pageCount} pages)`
        );
        continue;
      }

      ranges.push({ id: nextId(), start: page, end: page });
      selectedSet.add(page);
    }
  }

  if (errors.length > 0) {
    return { ok: false, error: errors.join("; ") };
  }

  if (ranges.length === 0) {
    return { ok: false, error: "No valid pages selected." };
  }

  const selectedPages = Array.from(selectedSet).sort((a, b) => a - b);

  return {
    ok: true,
    ranges,
    selectedPages,
    normalizedInput: ranges.map((r) => (r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`)).join(", "),
  };
}

export function rangeToSelectedPages(ranges: PageRange[]): number[] {
  const set = new Set<number>();
  for (const r of ranges) {
    for (let p = r.start; p <= r.end; p++) {
      set.add(p);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
