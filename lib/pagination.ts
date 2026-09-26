export function getDeviceDetail(userAgent: string) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const paginationLimit = isMobile ? 10 : 5;

  return { isMobile, paginationLimit };
}

export function getNextCursor(pins: { id: string; created_at: string }[]) {
  const lastPin = pins.length > 0 ? pins[pins.length - 1] : null;

  return {
    nextCursorId: lastPin ? lastPin.id : null,
    nextCursorCreatedAt: lastPin ? lastPin.created_at : "",
  };
}

export function hasMorePins(
  feedPinsCount: number,
  totalPinsCount: number,
): boolean {
  return feedPinsCount < totalPinsCount;
}
