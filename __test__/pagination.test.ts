import { describe, it, expect } from "vitest";
import { getDeviceDetail, getNextCursor, hasMorePins } from "@/lib/pagination";

describe("getDeviceDetail", () => {
  it("detects iPhone as mobile and set limit to 10", () => {
    const iPhone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X)";
    const result = getDeviceDetail(iPhone);

    expect(result.isMobile).toBe(true);
    expect(result.paginationLimit).toBe(10);
  });

  it("detects Chrome on Mac as desktop and set limit to 5", () => {
    const desktop = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
    const result = getDeviceDetail(desktop);

    expect(result.isMobile).toBe(false);
    expect(result.paginationLimit).toBe(5);
  });
});

describe("getNextCursor", () => {
  it("sets nextCursorId and nextCursorCreatedAt when pins exist", () => {
    const initialPins = [
      { id: "pin_1", created_at: "2025-12-01 20:41:39.358966+00" },
      { id: "pin_2", created_at: "2026-02-01 20:41:39.358966+00" },
    ];
    const result = getNextCursor(initialPins);

    expect(result.nextCursorId).toBe("pin_2");
    expect(result.nextCursorCreatedAt).toBe("2026-02-01 20:41:39.358966+00");
  });

  it("returns empty cursor if there are no pins", () => {
    const result = getNextCursor([]);

    expect(result.nextCursorId).toBe(null);
    expect(result.nextCursorCreatedAt).toBe("");
  });
});

describe("hasMorePins", () => {
  it("returns true when feed pins are fewer than total map pins", () => {
    expect(hasMorePins(5, 12)).toBe(true);
  });

  it("returns false when all pins are already loaded", () => {
    expect(hasMorePins(12, 12)).toBe(false);
  });
});
