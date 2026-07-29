import type { Direction3, SegmentInstance, SegmentOptions } from "./types";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function sampleSphereDirections(count: number): Direction3[] {
  if (!Number.isInteger(count) || count < 8 || count > 768) {
    throw new RangeError("Direction count must be between 8 and 768");
  }

  return Array.from({ length: count }, (_, index) => {
    const y = 1 - ((index + 0.5) / count) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = index * GOLDEN_ANGLE;

    return {
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSegmentInstances(
  options: SegmentOptions,
): SegmentInstance[] {
  if (options.dispersion < 0 || options.dispersion > 0.75) {
    throw new RangeError("Dispersion must be between 0 and 0.75");
  }

  const random = mulberry32(options.seed);

  return sampleSphereDirections(options.count).map((direction) => {
    const radial = Math.cbrt(random()) * options.dispersion;
    const azimuth = random() * Math.PI * 2;
    const cosine = random() * 2 - 1;
    const planar = Math.sqrt(1 - cosine * cosine);

    return {
      center: {
        x: radial * planar * Math.cos(azimuth),
        y: radial * cosine,
        z: radial * planar * Math.sin(azimuth),
      },
      direction,
      length: 1,
    };
  });
}
