import { describe, expect, it } from "vitest";
import { findLargestFittingFontSize } from "./textFit";

describe("findLargestFittingFontSize", () => {
  it("reduces font size until width and height both fit", () => {
    const size = findLargestFittingFontSize({
      startFontSize: 28,
      minFontSize: 10,
      maxWidth: 120,
      maxHeight: 32,
      measure: (fontSize) => ({
        width: fontSize * 6,
        height: fontSize * 1.2,
      }),
    });

    expect(size).toBe(20);
  });

  it("returns the minimum when nothing larger fits", () => {
    const size = findLargestFittingFontSize({
      startFontSize: 18,
      minFontSize: 11,
      maxWidth: 20,
      maxHeight: 10,
      measure: (fontSize) => ({
        width: fontSize * 4,
        height: fontSize * 1.1,
      }),
    });

    expect(size).toBe(11);
  });
});
