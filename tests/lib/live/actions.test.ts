import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLiveStream,
  endLiveStream,
  sendChatMessage,
} from "@/lib/live/actions";

const mockSupabase = {
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: "user-123" } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: "channel-123" },
          error: null,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: "stream-123" },
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/lib/livepeer/client", () => ({
  createLivepeerStream: vi.fn(() =>
    Promise.resolve({
      id: "livepeer-123",
      streamKey: "stream-key",
      playbackId: "playback-123",
      name: "Test Stream",
      isActive: false,
      record: true,
    })
  ),
  getRTMPIngestUrl: vi.fn(() => "rtmp://rtmp.livepeer.com/live"),
  deleteLivepeerStream: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Live Stream Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLiveStream", () => {
    it("should create a live stream successfully", async () => {
      const result = await createLiveStream("Test Stream", "Description");

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
    });

    it("should return error when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await createLiveStream("Test Stream");

      expect(result).toEqual({ error: "Not authenticated" });
    });
  });

  describe("endLiveStream", () => {
    it("should end a live stream successfully", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: "stream-123",
                external_stream_id: "livepeer-123",
                channel_id: "channel-123",
                channels: { user_id: "user-123" },
              },
              error: null,
            })),
          })),
        })),
      });

      const result = await endLiveStream("stream-123");

      expect(result).toEqual({ success: true });
    });
  });

  describe("sendChatMessage", () => {
    it("should send chat message successfully", async () => {
      const result = await sendChatMessage("stream-123", "Hello world!");

      expect(result).toEqual({ success: true });
    });

    it("should reject empty messages", async () => {
      const result = await sendChatMessage("stream-123", "   ");

      expect(result).toEqual({ error: "Message cannot be empty" });
    });

    it("should reject messages over 500 characters", async () => {
      const longMessage = "a".repeat(501);
      const result = await sendChatMessage("stream-123", longMessage);

      expect(result).toEqual({
        error: "Message too long (max 500 characters)",
      });
    });
  });
});
