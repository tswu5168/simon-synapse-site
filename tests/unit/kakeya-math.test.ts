import { describe, expect, it } from "vitest";
import {
  createSegmentInstances,
  sampleSphereDirections,
} from "../../src/lib/kakeya/math";

describe("sampleSphereDirections", () => {
  it("returns deterministic unit vectors covering both hemispheres", () => {
    const first = sampleSphereDirections(64);
    const second = sampleSphereDirections(64);

    expect(first).toEqual(second);
    expect(first).toHaveLength(64);
    expect(first.some(({ y }) => y > 0)).toBe(true);
    expect(first.some(({ y }) => y < 0)).toBe(true);

    for (const direction of first) {
      expect(Math.hypot(direction.x, direction.y, direction.z)).toBeCloseTo(
        1,
        10,
      );
    }
  });

  it("rejects counts outside the supported range", () => {
    expect(() => sampleSphereDirections(7)).toThrow(
      "Direction count must be between 8 and 768",
    );
    expect(() => sampleSphereDirections(769)).toThrow(
      "Direction count must be between 8 and 768",
    );
  });
});

describe("createSegmentInstances", () => {
  it("keeps every line at unit length and bounds its midpoint dispersion", () => {
    const segments = createSegmentInstances({
      count: 96,
      dispersion: 0.25,
      seed: 42,
    });

    expect(segments).toHaveLength(96);
    for (const segment of segments) {
      expect(segment.length).toBe(1);
      expect(
        Math.hypot(segment.center.x, segment.center.y, segment.center.z),
      ).toBeLessThanOrEqual(0.25);
    }
  });

  it("uses the seed to produce repeatable placement", () => {
    const options = { count: 24, dispersion: 0.4, seed: 77 };
    expect(createSegmentInstances(options)).toEqual(
      createSegmentInstances(options),
    );
  });

  it("rejects midpoint dispersion outside the supported range", () => {
    expect(() =>
      createSegmentInstances({ count: 24, dispersion: -0.01, seed: 1 }),
    ).toThrow("Dispersion must be between 0 and 0.75");
    expect(() =>
      createSegmentInstances({ count: 24, dispersion: 0.76, seed: 1 }),
    ).toThrow("Dispersion must be between 0 and 0.75");
  });
});
