import { describe, expect, it } from "vitest";
import { createAdaptiveQualityMonitor } from "../../src/lib/kakeya/adaptive-quality";

describe("createAdaptiveQualityMonitor", () => {
  it("長時間慢幀時只降低一次線段數，且保留最低視覺密度", () => {
    const monitor = createAdaptiveQualityMonitor({
      sampleSize: 6,
      slowFrameThresholdMs: 24,
      slowFrameRatio: 0.66,
      minimumCount: 96,
    });

    expect(monitor.record(12, 512)).toBeNull();
    expect(monitor.record(28, 512)).toBeNull();
    expect(monitor.record(31, 512)).toBeNull();
    expect(monitor.record(30, 512)).toBeNull();
    expect(monitor.record(26, 512)).toBeNull();
    expect(monitor.record(11, 512)).toBe(256);

    for (let index = 0; index < 12; index += 1) {
      expect(monitor.record(40, 256)).toBeNull();
    }
  });

  it("不會把低密度場景降到最低值以下", () => {
    const monitor = createAdaptiveQualityMonitor({
      sampleSize: 2,
      slowFrameThresholdMs: 20,
      slowFrameRatio: 0.5,
      minimumCount: 96,
    });

    expect(monitor.record(30, 120)).toBeNull();
    expect(monitor.record(30, 120)).toBe(96);
  });
});
