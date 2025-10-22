import { describe, it, expect } from "vitest";
import { containsProfanity, filterProfanity } from "@/lib/profanity-filter";

describe("Profanity Filter", () => {
  describe("containsProfanity", () => {
    it("should detect profanity in text", () => {
      expect(containsProfanity("This is offensive content")).toBe(true);
      expect(containsProfanity("This is inappropriate")).toBe(true);
    });

    it("should return false for clean text", () => {
      expect(containsProfanity("This is a nice video")).toBe(false);
      expect(containsProfanity("Great content!")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(containsProfanity("This is OFFENSIVE content")).toBe(true);
      expect(containsProfanity("this is InApPrOpRiAtE")).toBe(true);
    });

    it("should handle empty strings", () => {
      expect(containsProfanity("")).toBe(false);
    });
  });

  describe("filterProfanity", () => {
    it("should replace profanity with asterisks", () => {
      const filtered = filterProfanity("This is offensive content");
      expect(filtered).toContain("*********");
      expect(filtered).not.toContain("offensive");
    });

    it("should preserve clean text", () => {
      const text = "This is a nice video";
      expect(filterProfanity(text)).toBe(text);
    });

    it("should handle multiple profanities", () => {
      const filtered = filterProfanity("This offensive video is inappropriate");
      expect(filtered).toContain("*");
      expect(filtered).not.toContain("offensive");
      expect(filtered).not.toContain("inappropriate");
    });
  });
});
