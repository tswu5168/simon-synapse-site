import { describe, expect, it } from "vitest";
import {
  MODE_PRESETS,
  clampSceneConfig,
} from "../../src/lib/kakeya/presets";

describe("Kakeya mode presets", () => {
  it("keeps every mode inside the supported performance bounds", () => {
    expect(Object.keys(MODE_PRESETS)).toEqual([
      "interactive",
      "immersive",
      "learn",
    ]);

    for (const preset of Object.values(MODE_PRESETS)) {
      expect(preset.count).toBeGreaterThanOrEqual(8);
      expect(preset.count).toBeLessThanOrEqual(768);
      expect(preset.tubeRadius).toBeGreaterThanOrEqual(0.002);
      expect(preset.tubeRadius).toBeLessThanOrEqual(0.03);
      expect(preset.dispersion).toBeGreaterThanOrEqual(0);
      expect(preset.dispersion).toBeLessThanOrEqual(0.75);
      expect(preset.rotationSpeed).toBeGreaterThanOrEqual(0);
      expect(preset.rotationSpeed).toBeLessThanOrEqual(0.4);
    }
  });

  it("clamps values received from page controls", () => {
    const clamped = clampSceneConfig({
      ...MODE_PRESETS.interactive,
      count: 9999,
      tubeRadius: -1,
      dispersion: 2,
      rotationSpeed: -4,
    });

    expect(clamped.count).toBe(768);
    expect(clamped.tubeRadius).toBe(0.002);
    expect(clamped.dispersion).toBe(0.75);
    expect(clamped.rotationSpeed).toBe(0);
  });
});
