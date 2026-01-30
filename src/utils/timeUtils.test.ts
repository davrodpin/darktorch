import { describe, expect, it } from "vitest";
import {
  calculateProgress,
  createTimeDisplay,
  formatTime,
  parseTime,
} from "./timeUtils";

describe("timeUtils", () => {
  describe("formatTime", () => {
    it("formats seconds into MM:SS with padding", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(5)).toBe("00:05");
      expect(formatTime(65)).toBe("01:05");
      expect(formatTime(3600)).toBe("60:00");
      expect(formatTime(7200)).toBe("120:00");
    });

    it("returns 00:00 for negative values", () => {
      expect(formatTime(-1)).toBe("00:00");
      expect(formatTime(-999)).toBe("00:00");
    });
  });

  describe("parseTime", () => {
    it("parses MM:SS into seconds", () => {
      expect(parseTime("00:00")).toBe(0);
      expect(parseTime("01:05")).toBe(65);
      expect(parseTime("60:00")).toBe(3600);
      expect(parseTime("120:00")).toBe(7200);
    });

    it("returns 0 for invalid formats", () => {
      expect(parseTime("")).toBe(0);
      expect(parseTime("1:5")).toBe(0); // seconds must be 2 digits
      expect(parseTime("abc")).toBe(0);
      expect(parseTime("99:99")).toBe(0); // seconds >= 60 invalid
      expect(parseTime("-1:00")).toBe(0);
    });
  });

  describe("calculateProgress", () => {
    it("returns 0 if total <= 0", () => {
      expect(calculateProgress(10, 0)).toBe(0);
      expect(calculateProgress(10, -1)).toBe(0);
    });

    it("clamps between 0 and 100", () => {
      expect(calculateProgress(10, 100)).toBe(10);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(200, 100)).toBe(100);
      expect(calculateProgress(-1, 100)).toBe(0);
    });
  });

  describe("createTimeDisplay", () => {
    it("creates formatted fields and flag thresholds", () => {
      const display = createTimeDisplay(65);
      expect(display.formatted).toBe("01:05");
      expect(display.minutes).toBe(1);
      expect(display.seconds).toBe(5);
      expect(display.totalSeconds).toBe(65);
      expect(display.isExpired).toBe(false);
    });

    it("marks low time (< 15m) and critical time (< 5m)", () => {
      expect(createTimeDisplay(900).isLowTime).toBe(false); // 15m exactly
      expect(createTimeDisplay(899).isLowTime).toBe(true);

      expect(createTimeDisplay(300).isCriticalTime).toBe(false); // 5m exactly
      expect(createTimeDisplay(299).isCriticalTime).toBe(true);
    });

    it("marks expired when seconds === 0 or isExpired is passed", () => {
      expect(createTimeDisplay(0).isExpired).toBe(true);
      expect(createTimeDisplay(10, true).isExpired).toBe(true);
    });
  });
});
