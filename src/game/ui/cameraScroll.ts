interface CameraEdgeScrollInput {
  pointerX: number;
  pointerY: number;
  dt: number;
  gameWidth: number;
  playfieldHeight: number;
  edgeScrollZone: number;
  topEdgeScrollZone: number;
  topEdgeScrollBandHeight: number;
  scrollSpeed: number;
}

interface CameraKeyboardScrollInput {
  leftPressed: boolean;
  rightPressed: boolean;
  dt: number;
  scrollSpeed: number;
}

export function getCameraEdgeScrollDelta({
  pointerX,
  pointerY,
  dt,
  gameWidth,
  playfieldHeight,
  edgeScrollZone,
  topEdgeScrollZone,
  topEdgeScrollBandHeight,
  scrollSpeed,
}: CameraEdgeScrollInput): number {
  if (pointerY > playfieldHeight) {
    return 0;
  }

  const activeEdgeZone = pointerY <= topEdgeScrollBandHeight ? topEdgeScrollZone : edgeScrollZone;
  if (activeEdgeZone <= 0) {
    return 0;
  }

  if (pointerX < activeEdgeZone) {
    return -scrollSpeed * (1 - pointerX / activeEdgeZone) * dt;
  }

  if (pointerX > gameWidth - activeEdgeZone) {
    return scrollSpeed * (1 - (gameWidth - pointerX) / activeEdgeZone) * dt;
  }

  return 0;
}

export function getKeyboardCameraScrollDelta({
  leftPressed,
  rightPressed,
  dt,
  scrollSpeed,
}: CameraKeyboardScrollInput): number {
  if (leftPressed === rightPressed) {
    return 0;
  }

  return (leftPressed ? -1 : 1) * scrollSpeed * dt;
}
