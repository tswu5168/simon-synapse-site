export interface AdaptiveQualityOptions {
  sampleSize: number;
  slowFrameThresholdMs: number;
  slowFrameRatio: number;
  minimumCount: number;
}

export function createAdaptiveQualityMonitor(
  options: AdaptiveQualityOptions,
) {
  const sampleSize = Math.max(1, Math.round(options.sampleSize));
  const slowFrameRatio = Math.min(1, Math.max(0, options.slowFrameRatio));
  const minimumCount = Math.max(8, Math.round(options.minimumCount));
  let samples = 0;
  let slowFrames = 0;
  let downgraded = false;

  return {
    record(durationMs: number, currentCount: number): number | null {
      if (downgraded) return null;

      samples += 1;
      if (durationMs > options.slowFrameThresholdMs) slowFrames += 1;
      if (samples < sampleSize) return null;

      const shouldDowngrade = slowFrames / samples >= slowFrameRatio;
      samples = 0;
      slowFrames = 0;
      if (!shouldDowngrade) return null;

      const nextCount = Math.max(
        minimumCount,
        Math.floor(Math.max(0, currentCount) / 2),
      );
      if (nextCount >= currentCount) return null;
      downgraded = true;
      return nextCount;
    },
  };
}
