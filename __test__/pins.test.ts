import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPin,
  updatePin,
  deletePin,
  fetchMorePins,
} from "@/lib/actions/pins";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// mock supabase server client constructor
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("Pins Server Actions", () => {
  let mockSupabase: any;
  const mockUser = { id: "user_123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: "http://fake-url.jpg" } }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe("createPin", () => {
    it("returns an error when there is no authenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const formData = new FormData();
      const result = await createPin(formData);

      expect(result).toEqual({ success: false, error: "Not authenticated." });
    });

    it("returns an error when photo upload fails", async () => {
      // intercepting final query resolve
      mockSupabase.storage.upload.mockResolvedValue({
        error: { message: "upload failed" },
      });

      const formData = new FormData();
      formData.append("photo_files", new File(["fake"], "test.jpg"));

      const result = await createPin(formData);

      expect(result).toEqual({
        success: false,
        error: "Failed to upload photos.",
      });
    });

    it("successfully creates a pin when input is fully valid", async () => {
      const formData = new FormData();
      formData.append("photo_files", new File(["fake"], "test.jpg"));
      formData.append("caption", "Amazing view!");
      formData.append("location_name", "Golden Gate Park");
      formData.append("lat", "37.7697");
      formData.append("lng", "-122.4769");
      formData.append("visited_at", "2026-01-01");

      const result = await createPin(formData);

      expect(result).toEqual({ success: true, error: "" });
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user_123",
          photo_urls: ["http://fake-url.jpg"],
          caption: "Amazing view!",
          location_name: "Golden Gate Park",
          lat: 37.7697,
          lng: -122.4769,
        }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/map");
    });
  });

  describe("updatePin", () => {
    const validUpdates = {
      caption: "Updated caption",
      location_name: "de Young Museum",
      lat: 37.7714,
      lng: -122.4686,
      visited_at: "2026-06-11",
    };

    it("successfully updates a pin when authenticated", async () => {
      const result = await updatePin("pin_123", validUpdates);
      expect(result).toEqual({ success: true, error: "" });
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: "Updated caption",
          location_name: "de Young Museum",
          lat: 37.7714,
          lng: -122.4686,
          visited_at: "2026-06-11",
        }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/map");
    });

    it("returns failure object if the database update fails", async () => {
      mockSupabase.eq.mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "Database Down" } }),
      }));

      const result = await updatePin("pin_123", validUpdates);
      expect(result).toEqual({
        success: false,
        error: "Failed to update pin.",
      });
    });
  });

  describe("deletePin", () => {
    it("successfully deletes a pin when authorized", async () => {
      mockSupabase.eq.mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }));

      const result = await deletePin("pin_123");
      expect(result).toEqual({ success: true, error: "" });
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "pin_123");
      expect(revalidatePath).toHaveBeenCalledWith("/map");
    });
  });

  describe("fetchMorePins", () => {
    const mockPinsData = [
      { id: "pin_1", created_at: "2026-09-10" },
      { id: "pin_2", created_at: "2026-09-09" },
    ];

    it("fetches pins and calculates pagination cursors when hitting the limit", async () => {
      mockSupabase.limit.mockResolvedValue({ data: mockPinsData, error: null });

      const result = await fetchMorePins("pin_0", "2026-09-11", 2);
      expect(result).toEqual({
        success: true,
        data: mockPinsData,
        nextCursor: "pin_2",
        nextCreatedAt: "2026-09-09",
        error: "",
      });
    });

    it("returns null cursors if returned data length is less than the limit", async () => {
      mockSupabase.limit.mockResolvedValue({ data: mockPinsData, error: null });

      const result = await fetchMorePins("pin_0", "2026-09-11", 5);
      expect(result.nextCursor).toBeNull();
      expect(result.nextCreatedAt).toBeNull();
    });
  });
});
