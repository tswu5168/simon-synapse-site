export type KakeyaMode = "interactive" | "immersive" | "learn";

export interface Direction3 {
  x: number;
  y: number;
  z: number;
}

export interface SegmentInstance {
  center: Direction3;
  direction: Direction3;
  length: 1;
}

export interface SegmentOptions {
  count: number;
  dispersion: number;
  seed: number;
}
