import { describe, it, expect, beforeEach } from "vitest";
import { parseRanges, resetRangeIds } from "@/lib/ranges/parse-ranges";

beforeEach(() => {
  resetRangeIds();
});

describe("parseRanges", () => {
  it("parses multiple ranges", () => {
    const result = parseRanges("1-3, 6-8, 12-14", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ranges).toHaveLength(3);
      expect(result.selectedPages).toEqual([1, 2, 3, 6, 7, 8, 12, 13, 14]);
    }
  });

  it("parses a single page", () => {
    const result = parseRanges("5", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ranges).toHaveLength(1);
      expect(result.ranges[0].start).toBe(5);
      expect(result.ranges[0].end).toBe(5);
      expect(result.selectedPages).toEqual([5]);
    }
  });

  it("parses mixed single pages and ranges", () => {
    const result = parseRanges("1, 3, 7-9", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ranges).toHaveLength(3);
      expect(result.selectedPages).toEqual([1, 3, 7, 8, 9]);
    }
  });

  it("rejects page 0", () => {
    const result = parseRanges("0", 24);
    expect(result.ok).toBe(false);
  });

  it("rejects negative pages", () => {
    const result = parseRanges("-1", 24);
    expect(result.ok).toBe(false);
  });

  it("rejects pages beyond page count", () => {
    const result = parseRanges("999", 24);
    expect(result.ok).toBe(false);
  });

  it("normalizes reversed ranges", () => {
    const result = parseRanges("8-3", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.ranges[0].start).toBe(3);
      expect(result.ranges[0].end).toBe(8);
      expect(result.selectedPages).toEqual([3, 4, 5, 6, 7, 8]);
    }
  });

  it("handles overlapping ranges", () => {
    const result = parseRanges("1-3, 2-4", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.selectedPages).toEqual([1, 2, 3, 4]);
      // Should have both ranges preserved even though they overlap
      expect(result.ranges).toHaveLength(2);
    }
  });

  it("rejects non-numeric input", () => {
    const result = parseRanges("abc", 24);
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    const result = parseRanges("", 24);
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only input", () => {
    const result = parseRanges("   ", 24);
    expect(result.ok).toBe(false);
  });

  it("handles pageCount of 0", () => {
    const result = parseRanges("1-3", 0);
    expect(result.ok).toBe(false);
  });

  it("returns normalized input", () => {
    const result = parseRanges("  1-3 , 5 , 8-10  ", 24);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalizedInput).toBe("1-3, 5, 8-10");
    }
  });

  it("rejects range with missing end", () => {
    const result = parseRanges("1-", 24);
    expect(result.ok).toBe(false);
  });

  it("rejects range with missing start", () => {
    const result = parseRanges("-5", 24);
    expect(result.ok).toBe(false);
  });
});
