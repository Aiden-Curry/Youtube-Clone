import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp, signIn, signOut } from "@/lib/auth/actions";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUp", () => {
    it("should return error when passwords do not match", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");
      formData.set("confirmPassword", "different");
      formData.set("username", "testuser");
      formData.set("displayName", "Test User");

      const result = await signUp(formData);

      expect(result).toEqual({ error: "Passwords do not match" });
    });

    it("should return error when password is too short", async () => {
      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "123");
      formData.set("confirmPassword", "123");
      formData.set("username", "testuser");
      formData.set("displayName", "Test User");

      const result = await signUp(formData);

      expect(result).toEqual({
        error: "Password must be at least 8 characters",
      });
    });

    it("should return error for invalid email", async () => {
      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("password", "password123");
      formData.set("confirmPassword", "password123");
      formData.set("username", "testuser");
      formData.set("displayName", "Test User");

      const result = await signUp(formData);

      expect(result).toEqual({ error: "Invalid email address" });
    });
  });

  describe("signIn", () => {
    it("should require email and password", async () => {
      const formData = new FormData();
      formData.set("email", "");
      formData.set("password", "");

      const result = await signIn(formData);

      expect(result).toEqual({ error: "Email and password are required" });
    });
  });
});
