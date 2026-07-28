import type { KakeyaMode, KakeyaSceneConfig } from "./types";

export const MODE_PRESETS: Record<KakeyaMode, KakeyaSceneConfig> = {
  interactive: {
    mode: "interactive",
    count: 192,
    tubeRadius: 0.009,
    dispersion: 0.24,
    rotationSpeed: 0.12,
    seed: 42,
    background: 0x050816,
  },
  immersive: {
    mode: "immersive",
    count: 512,
    tubeRadius: 0.0045,
    dispersion: 0.1,
    rotationSpeed: 0.075,
    seed: 77,
    background: 0x02030b,
  },
  learn: {
    mode: "learn",
    count: 64,
    tubeRadius: 0.011,
    dispersion: 0.3,
    rotationSpeed: 0,
    seed: 21,
    background: 0x071022,
  },
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function clampSceneConfig(
  config: KakeyaSceneConfig,
): KakeyaSceneConfig {
  return {
    ...config,
    count: Math.round(clamp(config.count, 8, 768)),
    tubeRadius: clamp(config.tubeRadius, 0.002, 0.03),
    dispersion: clamp(config.dispersion, 0, 0.75),
    rotationSpeed: clamp(config.rotationSpeed, 0, 0.4),
  };
}
