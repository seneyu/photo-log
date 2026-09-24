import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LocationSearchInput from "@/components/location-search-input";

describe("Location Search Input", () => {
  const mockSuggestions = [
    {
      mapbox_id: "1",
      name: "Golden Gate Park",
      address: "Fulton St & 36th Ave",
      place_formatted: "San Francisco, California, United States",
    },
    {
      mapbox_id: "2",
      name: "de Young Museum",
      address: "50 Hagiwara Tea Garden Dr",
      place_formatted: "San Francisco, California, United States",
    },
    {
      mapbox_id: "3",
      name: "Central Park",
      address: "59th St to 110th St",
      place_formatted: "New York, New York, United States",
    },
    {
      mapbox_id: "4",
      name: "Millennium Park",
      place_formatted: "Chicago, Illinois, United States",
    },
    {
      mapbox_id: "5",
      name: "Space Needle",
      address: "400 Broad St",
      place_formatted: "Seattle, Washington, United States",
    },
  ];

  const mockFetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ suggestions: mockSuggestions }),
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("displays suggestions after typing", () => {
    it("shows suggestion names after the debounce period", async () => {
      vi.useFakeTimers();

      render(<LocationSearchInput onSelect={vi.fn()} />);

      const input = screen.getByPlaceholderText(/golden gate park/i);
      fireEvent.change(input, { target: { value: "Golen" } });

      vi.advanceTimersByTime(1000);

      // switch back to real timer so waitFor's polling uses real time
      vi.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText("Golden Gate Park")).toBeInTheDocument();
      });
    });
  });
});
