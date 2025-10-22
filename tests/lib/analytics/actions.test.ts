import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  trackEvent,
  trackVideoView,
  trackWatchTime,
  trackSearchQuery,
} from "@/lib/analytics/actions";

const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-123" } },
    })),
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { channel_id: "channel-123" },
          error: null,
        })),
      })),
    })),
  })),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

describe("Analytics Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("should track event with user data", async () => {
      await trackEvent("like", {
        videoId: "video-123",
        channelId: "channel-123",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("analytics_events");
    });

    it("should handle missing user gracefully", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      await trackEvent("view", {
        videoId: "video-123",
        sessionId: "session-123",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("analytics_events");
    });
  });

  describe("trackVideoView", () => {
    it("should track video view and increment count", async () => {
      await trackVideoView("video-123", "session-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("videos");
      expect(mockSupabase.from).toHaveBeenCalledWith("analytics_events");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("increment_view_count", {
        video_id: "video-123",
      });
    });
  });

  describe("trackWatchTime", () => {
    it("should track watch time with duration", async () => {
      await trackWatchTime("video-123", 120, "session-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("videos");
      expect(mockSupabase.from).toHaveBeenCalledWith("analytics_events");
    });
  });

  describe("trackSearchQuery", () => {
    it("should track search query with results count", async () => {
      await trackSearchQuery("nextjs tutorial", 42);

      expect(mockSupabase.from).toHaveBeenCalledWith("search_queries");
    });
  });
});
