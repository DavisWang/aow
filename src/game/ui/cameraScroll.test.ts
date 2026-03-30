import { describe, expect, it } from "vitest";
import {
  CAMERA_EDGE_SCROLL_ZONE,
  CAMERA_SCROLL_SPEED,
  CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
  CAMERA_TOP_EDGE_SCROLL_ZONE,
  GAME_WIDTH,
  PLAYFIELD_HEIGHT,
} from "../config";
import { getCameraEdgeScrollDelta, getKeyboardCameraScrollDelta } from "./cameraScroll";

describe("camera edge scroll", () => {
  it("narrows the activation zone in the top HUD band", () => {
    expect(
      getCameraEdgeScrollDelta({
        pointerX: 60,
        pointerY: 120,
        dt: 1,
        gameWidth: GAME_WIDTH,
        playfieldHeight: PLAYFIELD_HEIGHT,
        edgeScrollZone: CAMERA_EDGE_SCROLL_ZONE,
        topEdgeScrollZone: CAMERA_TOP_EDGE_SCROLL_ZONE,
        topEdgeScrollBandHeight: CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBe(0);
  });

  it("still allows intentional top-band scrolling when the pointer is at the edge", () => {
    expect(
      getCameraEdgeScrollDelta({
        pointerX: 12,
        pointerY: 120,
        dt: 1,
        gameWidth: GAME_WIDTH,
        playfieldHeight: PLAYFIELD_HEIGHT,
        edgeScrollZone: CAMERA_EDGE_SCROLL_ZONE,
        topEdgeScrollZone: CAMERA_TOP_EDGE_SCROLL_ZONE,
        topEdgeScrollBandHeight: CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBeLessThan(0);
  });

  it("keeps the wider edge zone deeper in the battlefield", () => {
    expect(
      getCameraEdgeScrollDelta({
        pointerX: 120,
        pointerY: 320,
        dt: 1,
        gameWidth: GAME_WIDTH,
        playfieldHeight: PLAYFIELD_HEIGHT,
        edgeScrollZone: CAMERA_EDGE_SCROLL_ZONE,
        topEdgeScrollZone: CAMERA_TOP_EDGE_SCROLL_ZONE,
        topEdgeScrollBandHeight: CAMERA_TOP_EDGE_SCROLL_BAND_HEIGHT,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBeLessThan(0);
  });

  it("supports keyboard panning with the arrow keys", () => {
    expect(
      getKeyboardCameraScrollDelta({
        leftPressed: true,
        rightPressed: false,
        dt: 1,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBe(-CAMERA_SCROLL_SPEED);

    expect(
      getKeyboardCameraScrollDelta({
        leftPressed: false,
        rightPressed: true,
        dt: 1,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBe(CAMERA_SCROLL_SPEED);

    expect(
      getKeyboardCameraScrollDelta({
        leftPressed: true,
        rightPressed: true,
        dt: 1,
        scrollSpeed: CAMERA_SCROLL_SPEED,
      }),
    ).toBe(0);
  });
});
