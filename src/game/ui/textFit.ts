import Phaser from "phaser";

// Text fitting is centralized here so buttons, banners, overlays, and HUD
// labels all shrink consistently instead of each scene reinventing the logic.
export interface FitTextArgs {
  startFontSize: number;
  minFontSize?: number;
  maxWidth: number;
  maxHeight: number;
  measure: (fontSize: number) => { width: number; height: number };
}

export interface TextFitBox {
  maxWidth: number;
  maxHeight: number;
  minFontSize?: number;
  paddingX?: number;
  paddingY?: number;
}

export function findLargestFittingFontSize({
  startFontSize,
  minFontSize = 10,
  maxWidth,
  maxHeight,
  measure,
}: FitTextArgs): number {
  // Walk downward one pixel at a time. The current UI surface is small enough
  // that the simple approach is easier to trust than a more complex search.
  for (let fontSize = startFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const size = measure(fontSize);
    if (size.width <= maxWidth && size.height <= maxHeight) {
      return fontSize;
    }
  }

  return minFontSize;
}

export function fitTextToBox(text: Phaser.GameObjects.Text, box: TextFitBox): number {
  const availableWidth = Math.max(1, box.maxWidth - (box.paddingX ?? 0) * 2);
  const availableHeight = Math.max(1, box.maxHeight - (box.paddingY ?? 0) * 2);
  const parsedFontSize = Number.parseInt(String(text.style.fontSize ?? 16), 10);
  const startFontSize = Number.isNaN(parsedFontSize) ? 16 : parsedFontSize;

  const measure = (fontSize: number): { width: number; height: number } => {
    // Mutating the real Phaser text object during measurement keeps the result
    // honest because Phaser's final layout can differ from pure string math.
    text.setFontSize(fontSize);
    text.setWordWrapWidth(availableWidth, true);
    text.updateText();
    return {
      width: text.width,
      height: text.height,
    };
  };

  const fittedFontSize = findLargestFittingFontSize({
    startFontSize,
    minFontSize: box.minFontSize ?? 10,
    maxWidth: availableWidth,
    maxHeight: availableHeight,
    measure,
  });

  text.setFontSize(fittedFontSize);
  text.setWordWrapWidth(availableWidth, true);
  text.updateText();
  return fittedFontSize;
}
