import type { KakeyaSceneConfig, KakeyaSceneController } from "./types";
import { clampSceneConfig } from "./presets";
import { shouldAnimate } from "./runtime-policy";

export interface KakeyaSceneAdapter {
  rebuild(config: KakeyaSceneConfig): void;
  render(rotation: number): void;
  dispose(): void;
}

interface CreateControllerOptions {
  initial: KakeyaSceneConfig;
  adapter: KakeyaSceneAdapter;
  requestFrame(callback: FrameRequestCallback): number;
  cancelFrame(id: number): void;
}

export function createKakeyaSceneController(
  options: CreateControllerOptions,
): KakeyaSceneController {
  let config = clampSceneConfig(options.initial);
  let runtime = {
    visible: true,
    paused: config.rotationSpeed === 0,
    reducedMotion: false,
  };
  let currentRotation = 0;
  let frameId = 0;
  let destroyed = false;

  const cancelScheduledFrame = () => {
    if (!frameId) return;
    options.cancelFrame(frameId);
    frameId = 0;
  };

  const scheduleFrame = () => {
    if (
      destroyed ||
      frameId ||
      !shouldAnimate(runtime) ||
      config.rotationSpeed === 0
    ) {
      return;
    }
    frameId = options.requestFrame((time) => {
      frameId = 0;
      currentRotation = time * 0.001 * config.rotationSpeed;
      options.adapter.render(currentRotation);
      scheduleFrame();
    });
  };

  const applyRuntime = (patch: Partial<typeof runtime>) => {
    runtime = { ...runtime, ...patch };
    if (!shouldAnimate(runtime)) cancelScheduledFrame();
    scheduleFrame();
  };

  options.adapter.rebuild(config);
  options.adapter.render(currentRotation);
  scheduleFrame();

  return {
    update(patch) {
      if (destroyed) return;
      config = clampSceneConfig({ ...config, ...patch });
      options.adapter.rebuild(config);
      options.adapter.render(currentRotation);
      scheduleFrame();
    },
    setPaused(paused) {
      applyRuntime({ paused });
      options.adapter.render(currentRotation);
    },
    setVisible(visible) {
      applyRuntime({ visible });
    },
    setReducedMotion(reducedMotion) {
      applyRuntime({ reducedMotion });
      options.adapter.render(currentRotation);
    },
    renderOnce() {
      if (!destroyed) options.adapter.render(currentRotation);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelScheduledFrame();
      options.adapter.dispose();
    },
  };
}
