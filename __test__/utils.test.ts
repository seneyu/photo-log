import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDate, formatTime, getTodaysDate } from "@/lib/utils";

describe("Date and Time Helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // set system time to a fixed UTC point: Sep 9, 2026, 20:41:39 UTC
    const mockDate = new Date(Date.UTC(2026, 8, 9, 20, 41, 39)); // month is 0-indexed (8 = September)
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers(); // reset clock back to real life after each test
  });

  describe("formatDate", () => {
    it("formats timestamp string to readable date", () => {
      const timestamp = "2026-09-09 20:41:39.358966+00";
      expect(formatDate(timestamp)).toContain("September 9, 2026");
    });

    it("returns empty string if value is null or empty", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate("")).toBe("");
    });
  });

  describe("formatTime", () => {
    it("formats timestamp string to readable time", () => {
      const timestamp = "2026-09-09 20:41:39.358966+00";

      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(PM|AM)?/i);
    });

    it("returns empty string if value is null or empty", () => {
      expect(formatTime(null)).toBe("");
    });
  });

  describe("getTodaysDate", () => {
    it("returns today's date in YYYY-MM-DD format based on system time", () => {
      expect(getTodaysDate()).toBe("2026-09-09");
    });
  });
});
