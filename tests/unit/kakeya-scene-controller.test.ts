import { describe, expect, it, vi } from "vitest";
import { MODE_PRESETS } from "../../src/lib/kakeya/presets";
import { createKakeyaSceneController } from "../../src/lib/kakeya/scene-controller";

function createFrameHarness() {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();

  return {
    callbacks,
    request(callback: FrameRequestCallback) {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    },
    cancel(id: number) {
      callbacks.delete(id);
    },
    run(id: number, time: number) {
      const callback = callbacks.get(id);
      callbacks.delete(id);
      callback?.(time);
    },
  };
}

describe("createKakeyaSceneController", () => {
  it("rebuilds and renders once before scheduling visible motion", () => {
    const frames = createFrameHarness();
    const adapter = {
      rebuild: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    };

    createKakeyaSceneController({
      initial: MODE_PRESETS.interactive,
      adapter,
      requestFrame: frames.request,
      cancelFrame: frames.cancel,
    });

    expect(adapter.rebuild).toHaveBeenCalledWith(MODE_PRESETS.interactive);
    expect(adapter.render).toHaveBeenCalledWith(0);
    expect(frames.callbacks.size).toBe(1);
  });

  it("cancels continuous frames while paused or hidden and resumes safely", () => {
    const frames = createFrameHarness();
    const adapter = {
      rebuild: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    };
    const controller = createKakeyaSceneController({
      initial: MODE_PRESETS.interactive,
      adapter,
      requestFrame: frames.request,
      cancelFrame: frames.cancel,
    });

    const firstFrame = [...frames.callbacks.keys()][0];
    frames.run(firstFrame, 1000);
    expect(adapter.render).toHaveBeenLastCalledWith(0.12);
    expect(frames.callbacks.size).toBe(1);

    controller.setPaused(true);
    expect(frames.callbacks.size).toBe(0);

    controller.setPaused(false);
    expect(frames.callbacks.size).toBe(1);
    controller.setVisible(false);
    expect(frames.callbacks.size).toBe(0);
    controller.setVisible(true);
    expect(frames.callbacks.size).toBe(1);
  });

  it("keeps reduced-motion mode still and releases resources on destroy", () => {
    const frames = createFrameHarness();
    const adapter = {
      rebuild: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    };
    const controller = createKakeyaSceneController({
      initial: MODE_PRESETS.immersive,
      adapter,
      requestFrame: frames.request,
      cancelFrame: frames.cancel,
    });

    controller.setReducedMotion(true);
    expect(frames.callbacks.size).toBe(0);
    controller.update({ count: 300 });
    expect(adapter.rebuild).toHaveBeenLastCalledWith({
      ...MODE_PRESETS.immersive,
      count: 300,
    });
    expect(adapter.render).toHaveBeenLastCalledWith(0);

    controller.destroy();
    expect(adapter.dispose).toHaveBeenCalledOnce();
    controller.destroy();
    expect(adapter.dispose).toHaveBeenCalledOnce();
  });
});
