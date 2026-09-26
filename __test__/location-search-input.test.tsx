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

    it("calls onSelect with the retrieve location when a suggestion is clicked", async () => {
      const mockOnSelect = vi.fn();

      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/suggest")) {
          return Promise.resolve({
            json: () => Promise.resolve({ suggestions: mockSuggestions }),
          });
        }

        if (url.includes("/retrieve")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                features: [
                  {
                    properties: {
                      name: "Golden Gate Park",
                      coordinates: { latitude: 37.7694, longitude: -122.4862 },
                    },
                  },
                ],
              }),
          });
        }
      });

      vi.useFakeTimers();
      render(<LocationSearchInput onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/golden gate park/i);
      fireEvent.change(input, { target: { value: "Golden" } });
      vi.advanceTimersByTime(1000);
      vi.useRealTimers();

      await waitFor(() => {
        expect(screen.getByText("Golden Gate Park")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Golden Gate Park"));

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith({
          lat: 37.7694,
          lng: -122.4862,
          location_name: "Golden Gate Park",
        });
      });
    });

    it("does not call fetch until typing pauses (debounce)", () => {
      vi.useFakeTimers();
      render(<LocationSearchInput onSelect={vi.fn()} />);

      const input = screen.getByPlaceholderText(/golden gate park/i);

      fireEvent.change(input, { target: { value: "G" } });
      vi.advanceTimersByTime(500);
      fireEvent.change(input, { target: { value: "Go" } });
      vi.advanceTimersByTime(500); // not being called yet after 500

      expect(mockFetch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500); // now it should fire since typing has "settled"
      expect(mockFetch).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
