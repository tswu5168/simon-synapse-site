import { describe, expect, it } from "vitest";
import { shouldAnimate } from "../../src/lib/kakeya/runtime-policy";

describe("shouldAnimate", () => {
  it("runs only when visible, unpaused, and motion is allowed", () => {
    expect(
      shouldAnimate({
        visible: true,
        paused: false,
        reducedMotion: false,
      }),
    ).toBe(true);
    expect(
      shouldAnimate({
        visible: false,
        paused: false,
        reducedMotion: false,
      }),
    ).toBe(false);
    expect(
      shouldAnimate({
        visible: true,
        paused: true,
        reducedMotion: false,
      }),
    ).toBe(false);
    expect(
      shouldAnimate({
        visible: true,
        paused: false,
        reducedMotion: true,
      }),
    ).toBe(false);
  });
});
