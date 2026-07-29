import type { RuntimeState } from "./types";

export function shouldAnimate(state: RuntimeState): boolean {
  return state.visible && !state.paused && !state.reducedMotion;
}
