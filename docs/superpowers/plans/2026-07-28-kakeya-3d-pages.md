# Kakeya 3D Page Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three production-ready Kakeya 3D pages to Simon Synapse for interactive exploration, immersive art, and mathematical learning.

**Architecture:** Keep the existing Astro 7 site and add three static routes backed by one browser-only Three.js renderer. Pure geometry, mode presets, and runtime policy stay independent from DOM rendering so they can be tested with Vitest; each page owns its content and controls while sharing the same layout, canvas shell, and mode navigation.

**Tech Stack:** Astro 7.1.0, TypeScript 6.0.3, Three.js 0.185.1, `@types/three` 0.185.1, Vitest 4.1.10, Playwright 1.61.1, CSS.

## Global Constraints

- Start execution from the current `origin/main` commit in an isolated worktree; do not implement in the dirty `feature/simon-synapse-hub` worktree.
- Preserve the existing Simon Synapse header, footer, dark neural palette, Taiwan Traditional Chinese copy, focus styling, browser zoom, and responsive reflow.
- Keep the current four-item homepage core-project order unchanged.
- Add exactly three experience routes: `/kakeya/interactive/`, `/kakeya/immersive/`, and `/kakeya/learn/`.
- Bundle Three.js locally; do not use a CDN, iframe, backend, database, account, audio, VR, AR, analytics, or remote runtime data.
- Treat every visible 3D result as a finite-sample illustration, never as a Besicovitch set, dimension estimate, or proof.
- Use the Wang–Zahl 2025 paper, arXiv:2502.17655, as the primary source for the three-dimensional result.
- Stop continuous animation when the page is hidden, the user pauses, or reduced-motion preference is active.
- Show readable HTML content and a `Status` / `Root Cause` / `Suggested Fix` fallback when WebGL cannot start.

---

## File Map

### New files

- `src/lib/kakeya/types.ts` — shared scene, direction, mode, and controller contracts.
- `src/lib/kakeya/math.ts` — deterministic direction sampling and segment placement.
- `src/lib/kakeya/presets.ts` — page-specific scene presets and bounded control values.
- `src/lib/kakeya/runtime-policy.ts` — pure visibility, pause, and reduced-motion policy.
- `src/lib/kakeya/scene.ts` — Three.js scene construction, instanced tubes, controls, resize, rendering, context loss, and cleanup.
- `src/components/kakeya/KakeyaModeNav.astro` — accessible links between the three routes.
- `src/components/kakeya/KakeyaScene.astro` — progressive-enhancement scene container and fallback status.
- `src/layouts/KakeyaLayout.astro` — shared Simon Synapse shell and Kakeya-specific metadata.
- `src/styles/kakeya.css` — shared responsive shell, canvas, controls, status, and reduced-motion styling.
- `src/pages/kakeya/interactive.astro` — interactive science page and its controls.
- `src/pages/kakeya/immersive.astro` — full-viewport art page and restrained overlay.
- `src/pages/kakeya/learn.astro` — six-step teaching page.
- `src/content/projects/kakeya-3d-lab.md` — discoverable project entry and source disclosure.
- `tests/unit/kakeya-math.test.ts` — geometry and deterministic placement coverage.
- `tests/unit/kakeya-presets.test.ts` — presets and bounds coverage.
- `tests/unit/kakeya-runtime-policy.test.ts` — animation-policy coverage.
- `tests/e2e/kakeya.spec.ts` — routes, navigation, controls, copy, fallback, and reduced-motion coverage.

### Modified files

- `package.json` and `package-lock.json` — pinned Three.js runtime and type dependencies.
- `tests/e2e/content-routes.spec.ts` — project count and new project-detail assertions.
- `tests/e2e/accessibility.spec.ts` — include all three Kakeya routes in the accessibility matrix.
- `scripts/verify-build.mjs` — assert the three generated HTML routes exist.

---

### Task 1: Deterministic Kakeya Geometry Core

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/kakeya/types.ts`
- Create: `src/lib/kakeya/math.ts`
- Create: `tests/unit/kakeya-math.test.ts`

**Interfaces:**
- Produces: `Direction3`, `SegmentInstance`, `sampleSphereDirections(count)`, and `createSegmentInstances(options)`.
- Consumes: no Kakeya code from later tasks.

- [ ] **Step 1: Install the pinned rendering packages**

Run:

```powershell
npm.cmd install three@0.185.1
npm.cmd install --save-dev @types/three@0.185.1
```

Expected: `package.json` contains `three: "^0.185.1"` and `@types/three: "^0.185.1"`; the lockfile records the same resolved release family.

- [ ] **Step 2: Write the failing geometry tests**

Create `tests/unit/kakeya-math.test.ts`:

```ts
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
      expect(Math.hypot(direction.x, direction.y, direction.z)).toBeCloseTo(1, 10);
    }
  });

  it("rejects counts outside the supported range", () => {
    expect(() => sampleSphereDirections(7)).toThrow("Direction count must be between 8 and 768");
    expect(() => sampleSphereDirections(769)).toThrow("Direction count must be between 8 and 768");
  });
});

describe("createSegmentInstances", () => {
  it("keeps every line at unit length and bounds its midpoint dispersion", () => {
    const segments = createSegmentInstances({ count: 96, dispersion: 0.25, seed: 42 });
    expect(segments).toHaveLength(96);
    for (const segment of segments) {
      expect(segment.length).toBe(1);
      expect(Math.hypot(segment.center.x, segment.center.y, segment.center.z)).toBeLessThanOrEqual(0.25);
    }
  });
});
```

- [ ] **Step 3: Run the focused test and confirm the expected failure**

Run:

```powershell
npm.cmd test -- tests/unit/kakeya-math.test.ts
```

Expected: FAIL because `src/lib/kakeya/math.ts` does not exist.

- [ ] **Step 4: Add the contracts and minimal deterministic implementation**

Create `src/lib/kakeya/types.ts`:

```ts
export type KakeyaMode = "interactive" | "immersive" | "learn";

export interface Direction3 {
  x: number;
  y: number;
  z: number;
}

export interface SegmentInstance {
  center: Direction3;
  direction: Direction3;
  length: 1;
}

export interface SegmentOptions {
  count: number;
  dispersion: number;
  seed: number;
}
```

Create `src/lib/kakeya/math.ts`:

```ts
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
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
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

export function createSegmentInstances(options: SegmentOptions): SegmentInstance[] {
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
```

- [ ] **Step 5: Run the test and commit the geometry core**

Run:

```powershell
npm.cmd test -- tests/unit/kakeya-math.test.ts
git add package.json package-lock.json src/lib/kakeya/types.ts src/lib/kakeya/math.ts tests/unit/kakeya-math.test.ts
git commit -m "feat: add deterministic Kakeya geometry core"
```

Expected: all focused tests PASS and the commit contains only Task 1 files.

---

### Task 2: Mode Presets and Animation Policy

**Files:**
- Modify: `src/lib/kakeya/types.ts`
- Create: `src/lib/kakeya/presets.ts`
- Create: `src/lib/kakeya/runtime-policy.ts`
- Create: `tests/unit/kakeya-presets.test.ts`
- Create: `tests/unit/kakeya-runtime-policy.test.ts`

**Interfaces:**
- Consumes: `KakeyaMode` from Task 1.
- Produces: `KakeyaSceneConfig`, `MODE_PRESETS`, `clampSceneConfig()`, and `shouldAnimate()`.

- [ ] **Step 1: Write failing preset and runtime-policy tests**

Create `tests/unit/kakeya-presets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MODE_PRESETS, clampSceneConfig } from "../../src/lib/kakeya/presets";

describe("Kakeya mode presets", () => {
  it("keeps all presets inside the supported performance bounds", () => {
    for (const preset of Object.values(MODE_PRESETS)) {
      expect(preset.count).toBeGreaterThanOrEqual(8);
      expect(preset.count).toBeLessThanOrEqual(768);
      expect(preset.tubeRadius).toBeGreaterThanOrEqual(0.002);
      expect(preset.tubeRadius).toBeLessThanOrEqual(0.03);
      expect(preset.dispersion).toBeGreaterThanOrEqual(0);
      expect(preset.dispersion).toBeLessThanOrEqual(0.75);
    }
  });

  it("clamps untrusted control values", () => {
    expect(clampSceneConfig({ ...MODE_PRESETS.interactive, count: 9999, tubeRadius: -1 }).count).toBe(768);
    expect(clampSceneConfig({ ...MODE_PRESETS.interactive, count: 9999, tubeRadius: -1 }).tubeRadius).toBe(0.002);
  });
});
```

Create `tests/unit/kakeya-runtime-policy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { shouldAnimate } from "../../src/lib/kakeya/runtime-policy";

describe("shouldAnimate", () => {
  it("runs only when visible, unpaused, and motion is allowed", () => {
    expect(shouldAnimate({ visible: true, paused: false, reducedMotion: false })).toBe(true);
    expect(shouldAnimate({ visible: false, paused: false, reducedMotion: false })).toBe(false);
    expect(shouldAnimate({ visible: true, paused: true, reducedMotion: false })).toBe(false);
    expect(shouldAnimate({ visible: true, paused: false, reducedMotion: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Run both tests and confirm missing-module failures**

Run:

```powershell
npm.cmd test -- tests/unit/kakeya-presets.test.ts tests/unit/kakeya-runtime-policy.test.ts
```

Expected: FAIL because `presets.ts` and `runtime-policy.ts` do not exist.

- [ ] **Step 3: Add the scene configuration, presets, bounds, and policy**

Append to `src/lib/kakeya/types.ts`:

```ts
export interface KakeyaSceneConfig {
  mode: KakeyaMode;
  count: number;
  tubeRadius: number;
  dispersion: number;
  rotationSpeed: number;
  seed: number;
  background: number;
}

export interface RuntimeState {
  visible: boolean;
  paused: boolean;
  reducedMotion: boolean;
}
```

Create `src/lib/kakeya/presets.ts`:

```ts
import type { KakeyaMode, KakeyaSceneConfig } from "./types";

export const MODE_PRESETS: Record<KakeyaMode, KakeyaSceneConfig> = {
  interactive: { mode: "interactive", count: 192, tubeRadius: 0.009, dispersion: 0.24, rotationSpeed: 0.12, seed: 42, background: 0x050816 },
  immersive: { mode: "immersive", count: 512, tubeRadius: 0.0045, dispersion: 0.1, rotationSpeed: 0.075, seed: 77, background: 0x02030b },
  learn: { mode: "learn", count: 64, tubeRadius: 0.011, dispersion: 0.3, rotationSpeed: 0, seed: 21, background: 0x071022 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampSceneConfig(config: KakeyaSceneConfig): KakeyaSceneConfig {
  return {
    ...config,
    count: Math.round(clamp(config.count, 8, 768)),
    tubeRadius: clamp(config.tubeRadius, 0.002, 0.03),
    dispersion: clamp(config.dispersion, 0, 0.75),
    rotationSpeed: clamp(config.rotationSpeed, 0, 0.4),
  };
}
```

Create `src/lib/kakeya/runtime-policy.ts`:

```ts
import type { RuntimeState } from "./types";

export function shouldAnimate(state: RuntimeState): boolean {
  return state.visible && !state.paused && !state.reducedMotion;
}
```

- [ ] **Step 4: Run tests and commit**

Run:

```powershell
npm.cmd test -- tests/unit/kakeya-presets.test.ts tests/unit/kakeya-runtime-policy.test.ts
git add src/lib/kakeya/types.ts src/lib/kakeya/presets.ts src/lib/kakeya/runtime-policy.ts tests/unit/kakeya-presets.test.ts tests/unit/kakeya-runtime-policy.test.ts
git commit -m "feat: define Kakeya modes and motion policy"
```

Expected: both test files PASS.

---

### Task 3: Shared Three.js Scene Controller

**Files:**
- Modify: `src/lib/kakeya/types.ts`
- Create: `src/lib/kakeya/scene.ts`
- Create: `src/components/kakeya/KakeyaScene.astro`

**Interfaces:**
- Consumes: `createSegmentInstances()`, `clampSceneConfig()`, and `shouldAnimate()`.
- Produces: `mountKakeyaScene(host, config) => KakeyaSceneController`.
- `KakeyaSceneController` exposes `update(partial)`, `setPaused(paused)`, `renderOnce()`, and `destroy()`.

- [ ] **Step 1: Add the controller contract**

Append to `src/lib/kakeya/types.ts`:

```ts
export interface KakeyaSceneController {
  update(patch: Partial<KakeyaSceneConfig>): void;
  setPaused(paused: boolean): void;
  renderOnce(): void;
  destroy(): void;
}
```

- [ ] **Step 2: Implement the shared renderer with one instanced tube mesh**

Create `src/lib/kakeya/scene.ts` with these concrete behaviors:

```ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSegmentInstances } from "./math";
import { clampSceneConfig } from "./presets";
import { shouldAnimate } from "./runtime-policy";
import type { KakeyaSceneConfig, KakeyaSceneController } from "./types";

export function mountKakeyaScene(host: HTMLElement, initial: KakeyaSceneConfig): KakeyaSceneController {
  let config = clampSceneConfig(initial);
  let paused = config.rotationSpeed === 0;
  let visible = document.visibilityState !== "hidden";
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  let frame = 0;

  const canvas = host.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) throw new Error("Kakeya canvas is missing");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(config.background, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(config.background, 0.34);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 20);
  camera.position.set(1.9, 1.35, 2.15);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 1.15;
  controls.maxDistance = 4.5;

  const root = new THREE.Group();
  scene.add(root);
  scene.add(new THREE.AmbientLight(0x8faaff, 1.6));
  const key = new THREE.PointLight(0x58e6ff, 8, 6);
  key.position.set(1.5, 1.2, 1.8);
  scene.add(key);

  let tubes: THREE.InstancedMesh | undefined;
  const rebuild = () => {
    if (tubes) {
      root.remove(tubes);
      tubes.geometry.dispose();
      (tubes.material as THREE.Material).dispose();
    }
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    const material = new THREE.MeshStandardMaterial({ color: 0x72e8ff, emissive: 0x392f88, emissiveIntensity: 0.8, transparent: true, opacity: config.mode === "immersive" ? 0.38 : 0.68, roughness: 0.28, metalness: 0.18 });
    tubes = new THREE.InstancedMesh(geometry, material, config.count);
    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    createSegmentInstances({ count: config.count, dispersion: config.dispersion, seed: config.seed }).forEach((segment, index) => {
      quaternion.setFromUnitVectors(up, new THREE.Vector3(segment.direction.x, segment.direction.y, segment.direction.z));
      scale.set(config.tubeRadius, segment.length, config.tubeRadius);
      matrix.compose(new THREE.Vector3(segment.center.x, segment.center.y, segment.center.z), quaternion, scale);
      tubes?.setMatrixAt(index, matrix);
    });
    tubes.instanceMatrix.needsUpdate = true;
    root.add(tubes);
  };

  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  let lastTime = performance.now();
  let slowFrames = 0;
  let contextRestoreAttempts = 0;
  const renderOnce = () => renderer.render(scene, camera);
  const requestTick = () => {
    if (!frame && shouldAnimate({ visible, paused, reducedMotion })) frame = requestAnimationFrame(tick);
  };
  const tick = (time: number) => {
    frame = 0;
    const elapsed = time - lastTime;
    lastTime = time;
    if (elapsed > 50) slowFrames += 1;
    if (slowFrames === 90 && config.count > 96) {
      config = { ...config, count: Math.max(96, Math.floor(config.count / 2)) };
      renderer.setPixelRatio(1);
      rebuild();
      host.dispatchEvent(new CustomEvent("kakeya:quality", { detail: "REDUCED" }));
    }
    root.rotation.y = time * 0.001 * config.rotationSpeed;
    renderOnce();
    requestTick();
  };

  const onVisibility = () => {
    visible = document.visibilityState !== "hidden";
    if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    requestTick();
  };
  const onMotionPreference = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    if (reducedMotion && frame) { cancelAnimationFrame(frame); frame = 0; }
    renderOnce();
    requestTick();
  };
  const showContextError = () => {
    host.querySelector("[data-kakeya-loading]")?.setAttribute("hidden", "");
    host.querySelector("[data-kakeya-error]")?.removeAttribute("hidden");
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    showContextError();
  };
  const onContextRestored = () => {
    contextRestoreAttempts += 1;
    if (contextRestoreAttempts > 1) { showContextError(); return; }
    host.querySelector("[data-kakeya-error]")?.setAttribute("hidden", "");
    renderer.resetState();
    rebuild();
    resize();
    renderOnce();
    requestTick();
  };
  const resizeObserver = new ResizeObserver(resize);
  document.addEventListener("visibilitychange", onVisibility);
  motionQuery.addEventListener("change", onMotionPreference);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  controls.addEventListener("change", renderOnce);
  resizeObserver.observe(host);
  rebuild();
  resize();
  host.dataset.ready = "true";
  renderOnce();
  requestTick();

  return {
    update(patch) { config = clampSceneConfig({ ...config, ...patch }); renderer.setClearColor(config.background, 1); rebuild(); renderOnce(); requestTick(); },
    setPaused(value) { paused = value; if (paused && frame) { cancelAnimationFrame(frame); frame = 0; } renderOnce(); requestTick(); },
    renderOnce,
    destroy() { if (frame) cancelAnimationFrame(frame); resizeObserver.disconnect(); document.removeEventListener("visibilitychange", onVisibility); motionQuery.removeEventListener("change", onMotionPreference); canvas.removeEventListener("webglcontextlost", onContextLost); canvas.removeEventListener("webglcontextrestored", onContextRestored); controls.removeEventListener("change", renderOnce); controls.dispose(); tubes?.geometry.dispose(); (tubes?.material as THREE.Material | undefined)?.dispose(); renderer.dispose(); },
  };
}
```

Create `src/components/kakeya/KakeyaScene.astro`:

```astro
---
interface Props {
  label: string;
  mode: "interactive" | "immersive" | "learn";
}
const { label, mode } = Astro.props;
---

<div class="kakeya-scene" data-kakeya-host data-mode={mode} aria-label={label}>
  <canvas tabindex="0" aria-label={`${label}，可拖曳旋轉並以滾輪或雙指縮放`}></canvas>
  <div class="kakeya-static" aria-hidden="true"></div>
  <div class="kakeya-loading" data-kakeya-loading>正在建立 3D 有限取樣示意圖。</div>
  <div class="kakeya-error" data-kakeya-error hidden role="status">
    <strong>Status：此裝置無法啟動 3D 圖形。</strong>
    <span>Root Cause：瀏覽器、顯示卡或設定未提供必要的 WebGL 能力。</span>
    <span>Suggested Fix：改用最新版瀏覽器、開啟硬體加速，或閱讀本頁文字說明。</span>
  </div>
</div>
```

- [ ] **Step 3: Add a smoke type-check and correct any Three.js typing errors**

Run:

```powershell
npm.cmd run check
```

Expected: Astro check reports 0 errors and existing Vitest tests pass.

- [ ] **Step 4: Commit the shared renderer**

Run:

```powershell
git add src/lib/kakeya/types.ts src/lib/kakeya/scene.ts src/components/kakeya/KakeyaScene.astro
git commit -m "feat: add shared Kakeya Three.js renderer"
```

---

### Task 4: Shared Kakeya Layout, Navigation, and Styling

**Files:**
- Create: `src/components/kakeya/KakeyaModeNav.astro`
- Create: `src/layouts/KakeyaLayout.astro`
- Create: `src/styles/kakeya.css`
- Test: `tests/e2e/kakeya.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout.astro` and the three fixed route names.
- Produces: `KakeyaLayout` props `title`, `description`, `canonicalPath`, and `activeMode`.

- [ ] **Step 1: Write the failing mode-navigation test**

Create the first test in `tests/e2e/kakeya.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("every Kakeya page exposes three real route links", async ({ page }) => {
  for (const route of ["/kakeya/interactive/", "/kakeya/immersive/", "/kakeya/learn/"]) {
    await page.goto(route);
    const navigation = page.getByRole("navigation", { name: "掛谷猜想體驗模式" });
    await expect(navigation.getByRole("link")).toHaveCount(3);
    await expect(navigation.getByRole("link", { name: "互動科普" })).toHaveAttribute("href", "/kakeya/interactive/");
    await expect(navigation.getByRole("link", { name: "沉浸藝術" })).toHaveAttribute("href", "/kakeya/immersive/");
    await expect(navigation.getByRole("link", { name: "數學教學" })).toHaveAttribute("href", "/kakeya/learn/");
  }
});
```

- [ ] **Step 2: Add shared navigation and layout**

Create `src/components/kakeya/KakeyaModeNav.astro`:

```astro
---
const { activeMode } = Astro.props as { activeMode: "interactive" | "immersive" | "learn" };
const modes = [
  { id: "interactive", href: "/kakeya/interactive/", label: "互動科普" },
  { id: "immersive", href: "/kakeya/immersive/", label: "沉浸藝術" },
  { id: "learn", href: "/kakeya/learn/", label: "數學教學" },
] as const;
---

<nav class="kakeya-mode-nav" aria-label="掛谷猜想體驗模式">
  {modes.map((mode) => (
    <a href={mode.href} aria-current={mode.id === activeMode ? "page" : undefined}>{mode.label}</a>
  ))}
</nav>
```

Create `src/layouts/KakeyaLayout.astro`:

```astro
---
import KakeyaModeNav from "../components/kakeya/KakeyaModeNav.astro";
import BaseLayout from "./BaseLayout.astro";
import "../styles/kakeya.css";

interface Props {
  title: string;
  description: string;
  canonicalPath: string;
  activeMode: "interactive" | "immersive" | "learn";
}
const props = Astro.props;
---

<BaseLayout title={props.title} description={props.description} canonicalPath={props.canonicalPath} loadAds={false}>
  <div class="kakeya-shell">
    <KakeyaModeNav activeMode={props.activeMode} />
    <slot />
  </div>
</BaseLayout>
```

- [ ] **Step 3: Add the shared responsive CSS**

Create `src/styles/kakeya.css` with these required selectors and values:

```css
.kakeya-shell { --kakeya-panel: rgb(8 14 34 / 86%); min-height: calc(100dvh - var(--header-height)); }
.kakeya-mode-nav { position: sticky; z-index: 15; top: 0; display: flex; justify-content: center; gap: .5rem; padding: .7rem 1rem; background: rgb(5 8 22 / 82%); backdrop-filter: blur(1rem); }
.kakeya-mode-nav a { min-height: 2.75rem; border: 1px solid var(--border); border-radius: 999px; padding: .4rem .85rem; text-decoration: none; }
.kakeya-mode-nav a[aria-current="page"] { border-color: var(--cyan); color: var(--text); background: rgb(88 230 255 / 12%); }
.kakeya-stage { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(18rem, .75fr); gap: 1.25rem; width: min(calc(100% - 2rem), 90rem); margin-inline: auto; padding-block: 1.25rem 3rem; }
.kakeya-scene { position: relative; min-height: clamp(24rem, 68dvh, 52rem); overflow: hidden; border: 1px solid var(--border-strong); border-radius: var(--radius-lg); background: #050816; box-shadow: var(--shadow-glow); }
.kakeya-scene canvas { display: block; width: 100%; height: 100%; min-height: inherit; touch-action: none; }
.kakeya-static { position: absolute; inset: 12% 16%; border-radius: 50%; background: repeating-conic-gradient(from 20deg, rgb(88 230 255 / 62%) 0 .35deg, transparent .45deg 5deg); filter: drop-shadow(0 0 1.5rem rgb(88 230 255 / 45%)); opacity: .7; transition: opacity 180ms ease-out; pointer-events: none; }
.kakeya-scene[data-ready="true"] .kakeya-static { opacity: 0; }
.kakeya-loading, .kakeya-error { position: absolute; inset: 1rem; display: grid; place-content: center; gap: .6rem; border-radius: var(--radius-md); padding: 1.25rem; text-align: center; background: rgb(5 8 22 / 88%); }
.kakeya-error[hidden], .kakeya-loading[hidden] { display: none; }
.kakeya-panel { align-self: start; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: clamp(1rem, 3vw, 1.5rem); background: var(--kakeya-panel); }
.kakeya-controls { display: grid; gap: 1rem; }
.kakeya-controls label { display: grid; gap: .35rem; }
.kakeya-disclaimer { color: var(--text-muted); font-size: .88em; }
@media (max-width: 56rem) { .kakeya-stage { grid-template-columns: 1fr; } .kakeya-scene { min-height: min(66dvh, 34rem); } }
@media (prefers-reduced-motion: reduce) { .kakeya-shell *, .kakeya-shell *::before, .kakeya-shell *::after { scroll-behavior: auto !important; animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; } }
```

- [ ] **Step 4: Commit the shared shell**

Run:

```powershell
git add src/components/kakeya/KakeyaModeNav.astro src/layouts/KakeyaLayout.astro src/styles/kakeya.css tests/e2e/kakeya.spec.ts
git commit -m "feat: add Kakeya page shell and mode navigation"
```

---

### Task 5: Interactive Science Page

**Files:**
- Create: `src/pages/kakeya/interactive.astro`
- Modify: `tests/e2e/kakeya.spec.ts`

**Interfaces:**
- Consumes: `KakeyaLayout`, `KakeyaScene`, `MODE_PRESETS.interactive`, and `mountKakeyaScene()`.
- Produces: controls with IDs `direction-count`, `tube-radius`, `dispersion`, `toggle-motion`, and `reset-scene`.

- [ ] **Step 1: Add the failing interactive-control test**

Append to `tests/e2e/kakeya.spec.ts`:

```ts
test("interactive page exposes bounded explanatory controls", async ({ page }) => {
  await page.goto("/kakeya/interactive/");
  await expect(page.getByRole("heading", { name: "用手轉動每一個方向" })).toBeVisible();
  await expect(page.getByLabel("方向取樣數")).toHaveAttribute("min", "8");
  await expect(page.getByLabel("方向取樣數")).toHaveAttribute("max", "768");
  await expect(page.getByText("有限取樣示意，不是數學證明", { exact: false })).toBeVisible();
});
```

- [ ] **Step 2: Build the interactive page and wire all controls**

Create `src/pages/kakeya/interactive.astro` with a two-column `.kakeya-stage`, `KakeyaScene`, semantic range inputs, live output elements, and the following browser script:

```ts
import { MODE_PRESETS } from "../../lib/kakeya/presets";
import { mountKakeyaScene } from "../../lib/kakeya/scene";

const host = document.querySelector<HTMLElement>("[data-kakeya-host]");
const loading = host?.querySelector<HTMLElement>("[data-kakeya-loading]");
const error = host?.querySelector<HTMLElement>("[data-kakeya-error]");
if (host) {
  try {
    const controller = mountKakeyaScene(host, MODE_PRESETS.interactive);
    loading?.setAttribute("hidden", "");
    const count = document.querySelector<HTMLInputElement>("#direction-count");
    const radius = document.querySelector<HTMLInputElement>("#tube-radius");
    const dispersion = document.querySelector<HTMLInputElement>("#dispersion");
    const toggle = document.querySelector<HTMLButtonElement>("#toggle-motion");
    const reset = document.querySelector<HTMLButtonElement>("#reset-scene");
    if (!count || !radius || !dispersion || !toggle || !reset) throw new Error("Interactive controls are missing");
    const apply = () => controller.update({ count: Number(count.value), tubeRadius: Number(radius.value), dispersion: Number(dispersion.value) });
    count?.addEventListener("input", apply);
    radius?.addEventListener("input", apply);
    dispersion?.addEventListener("input", apply);
    let paused = false;
    toggle.addEventListener("click", () => { paused = !paused; controller.setPaused(paused); toggle.textContent = paused ? "繼續動畫" : "暫停動畫"; toggle.setAttribute("aria-pressed", String(paused)); });
    reset.addEventListener("click", () => { count.value = "192"; radius.value = "0.009"; dispersion.value = "0.24"; apply(); });
    addEventListener("pagehide", () => controller.destroy(), { once: true });
  } catch {
    loading?.setAttribute("hidden", "");
    error?.removeAttribute("hidden");
  }
}
```

Use page copy that defines a unit line segment, explains finite directional sampling, and labels the tube radius as a visible `δ-tube` approximation.

- [ ] **Step 3: Run the focused page test and commit**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/kakeya.spec.ts --project=chromium --grep "interactive page"
git add src/pages/kakeya/interactive.astro tests/e2e/kakeya.spec.ts
git commit -m "feat: add interactive Kakeya explorer"
```

Expected: the interactive test PASSes.

---

### Task 6: Immersive Art Page

**Files:**
- Create: `src/pages/kakeya/immersive.astro`
- Modify: `src/styles/kakeya.css`
- Modify: `tests/e2e/kakeya.spec.ts`

**Interfaces:**
- Consumes: `MODE_PRESETS.immersive` and `mountKakeyaScene()`.
- Produces: `immersive-toggle` and an automatic camera-free root rotation that respects reduced motion.

- [ ] **Step 1: Add the failing immersive behavior test**

Append to `tests/e2e/kakeya.spec.ts`:

```ts
test("immersive page starts still when reduced motion is requested", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/kakeya/immersive/");
  await expect(page.getByRole("heading", { name: "把無數方向收進一道光" })).toBeVisible();
  await expect(page.locator("[data-motion-state]")).toHaveText("靜態模式");
  await context.close();
});
```

- [ ] **Step 2: Build the immersive page**

Create `src/pages/kakeya/immersive.astro` with a full-width scene, a short overlay, no audio element, and this motion-state initialization:

```ts
import { MODE_PRESETS } from "../../lib/kakeya/presets";
import { mountKakeyaScene } from "../../lib/kakeya/scene";

const host = document.querySelector<HTMLElement>("[data-kakeya-host]");
const status = document.querySelector<HTMLElement>("[data-motion-state]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (host) {
  try {
    const controller = mountKakeyaScene(host, MODE_PRESETS.immersive);
    controller.setPaused(reduced);
    host.querySelector("[data-kakeya-loading]")?.setAttribute("hidden", "");
    if (status) status.textContent = reduced ? "靜態模式" : "流動模式";
    host.addEventListener("pointerdown", () => { controller.setPaused(true); if (status) status.textContent = "靜態模式"; }, { once: true });
    document.querySelector<HTMLButtonElement>("#immersive-toggle")?.addEventListener("click", (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const nextPaused = status?.textContent !== "靜態模式";
      controller.setPaused(nextPaused);
      if (status) status.textContent = nextPaused ? "靜態模式" : "流動模式";
      button.textContent = nextPaused ? "開始流動" : "暫停流動";
    });
    addEventListener("pagehide", () => controller.destroy(), { once: true });
  } catch {
    host.querySelector("[data-kakeya-loading]")?.setAttribute("hidden", "");
    host.querySelector("[data-kakeya-error]")?.removeAttribute("hidden");
  }
}
```

Append immersive-specific styles:

```css
.kakeya-immersive { position: relative; min-height: calc(100dvh - var(--header-height) - 4.2rem); }
.kakeya-immersive .kakeya-scene { min-height: inherit; border: 0; border-radius: 0; }
.kakeya-immersive-copy { position: absolute; z-index: 2; inset: auto auto clamp(1rem, 5vw, 4rem) clamp(1rem, 5vw, 4rem); max-width: 38rem; padding: 1rem; text-shadow: 0 .15rem 1rem #000; }
```

- [ ] **Step 3: Run the focused test and commit**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/kakeya.spec.ts --project=chromium --grep "immersive page"
git add src/pages/kakeya/immersive.astro src/styles/kakeya.css tests/e2e/kakeya.spec.ts
git commit -m "feat: add immersive Kakeya artwork"
```

---

### Task 7: Six-Step Mathematical Learning Page

**Files:**
- Create: `src/pages/kakeya/learn.astro`
- Modify: `tests/e2e/kakeya.spec.ts`

**Interfaces:**
- Consumes: `MODE_PRESETS.learn`, `mountKakeyaScene()`, and controller `update()`.
- Produces: six ordered steps with `data-learn-step`, `learn-previous`, and `learn-next` controls.

- [ ] **Step 1: Add failing content and step-navigation tests**

Append to `tests/e2e/kakeya.spec.ts`:

```ts
test("learning page explains the 3D theorem and finite-sample boundary", async ({ page }) => {
  await page.goto("/kakeya/learn/");
  await expect(page.getByRole("heading", { name: "從一根針，到完整三維" })).toBeVisible();
  await expect(page.locator("[data-learn-step]")).toHaveCount(6);
  await expect(page.getByText("Minkowski 與 Hausdorff 維度 3", { exact: false })).toBeVisible();
  await expect(page.getByText("有限取樣示意，不是數學證明", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Wang.*Zahl/ })).toHaveAttribute("href", "https://arxiv.org/abs/2502.17655");
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.locator("[data-step-status]")).toHaveText("步驟 2／6");
});
```

- [ ] **Step 2: Build the six teaching steps and scene transitions**

Create `src/pages/kakeya/learn.astro` with these exact step headings:

```ts
const steps = [
  { title: "一條單位線段", count: 8, dispersion: 0.55 },
  { title: "平面中的更多方向", count: 32, dispersion: 0.42 },
  { title: "把方向展開到球面", count: 96, dispersion: 0.36 },
  { title: "把中心逐步收攏", count: 192, dispersion: 0.14 },
  { title: "體積與維度不是同一件事", count: 256, dispersion: 0.08 },
  { title: "三維猜想已獲證明", count: 384, dispersion: 0.06 },
] as const;
```

Render all six descriptions as HTML sections. Give each section `data-learn-step`, `data-count`, and `data-dispersion` values from the array, then use `hidden` plus `aria-current="step"` to expose the current one. Wire buttons and ArrowLeft/ArrowRight keys to the same `showStep(index)` function:

```ts
const showStep = (nextIndex: number) => {
  current = Math.min(panels.length - 1, Math.max(0, nextIndex));
  panels.forEach((panel, index) => { panel.hidden = index !== current; panel.setAttribute("aria-current", index === current ? "step" : "false"); });
  const activePanel = panels[current];
  if (status) status.textContent = `步驟 ${current + 1}／${panels.length}`;
  controller.update({ count: Number(activePanel.dataset.count), dispersion: Number(activePanel.dataset.dispersion) });
  previous.disabled = current === 0;
  next.disabled = current === panels.length - 1;
};
```

Step 6 must state that Wang and Zahl proved every Kakeya set in `R³` has Minkowski and Hausdorff dimension 3, link the paper, and separately state that the rendered finite tubes do not reproduce the proof.

- [ ] **Step 3: Run focused tests and commit**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/kakeya.spec.ts --project=chromium --grep "learning page"
git add src/pages/kakeya/learn.astro tests/e2e/kakeya.spec.ts
git commit -m "feat: add Kakeya mathematical learning path"
```

---

### Task 8: Project Discovery, SEO, Accessibility, and Build Contract

**Files:**
- Create: `src/content/projects/kakeya-3d-lab.md`
- Modify: `tests/e2e/content-routes.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `scripts/verify-build.mjs`
- Modify: `tests/e2e/kakeya.spec.ts`

**Interfaces:**
- Consumes: all three finished routes and the existing Astro content schema.
- Produces: one visible project entry without changing the homepage core list, route-level SEO, and deployment build assertions.

- [ ] **Step 1: Add failing discovery, SEO, accessibility, and build assertions**

Update `tests/e2e/content-routes.spec.ts` so preview expects 6 projects and includes `kakeya-3d-lab` in `projectSlugs`. Keep the existing homepage test at exactly 4 cards and the same order.

Append to `tests/e2e/kakeya.spec.ts`:

```ts
test("Kakeya routes expose distinct metadata and canonical URLs", async ({ page }) => {
  const cases = [
    ["/kakeya/interactive/", "互動科普", "https://simonsynapse.net/kakeya/interactive/"],
    ["/kakeya/immersive/", "沉浸藝術", "https://simonsynapse.net/kakeya/immersive/"],
    ["/kakeya/learn/", "數學教學", "https://simonsynapse.net/kakeya/learn/"],
  ] as const;
  for (const [route, titlePart, canonical] of cases) {
    await page.goto(route);
    await expect(page).toHaveTitle(new RegExp(titlePart));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
  }
});

test("WebGL context loss exposes the structured readable fallback", async ({ page }) => {
  await page.goto("/kakeya/interactive/");
  await page.locator("canvas").dispatchEvent("webglcontextlost");
  const fallback = page.locator("[data-kakeya-error]");
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("Status：");
  await expect(fallback).toContainText("Root Cause：");
  await expect(fallback).toContainText("Suggested Fix：");
});
```

Extend the accessibility route list with all three Kakeya routes. Append these paths to the existing `REQUIRED_OUTPUTS` array in `scripts/verify-build.mjs`:

```js
"kakeya/interactive/index.html",
"kakeya/immersive/index.html",
"kakeya/learn/index.html",
"projects/kakeya-3d-lab/index.html",
```

- [ ] **Step 2: Add the project record with primary sources**

Create `src/content/projects/kakeya-3d-lab.md` with production-visible frontmatter:

```yaml
---
title: 掛谷猜想 3D 實驗室：用三種視角探索方向與維度
description: 以互動科普、沉浸藝術與數學教學三個頁面，探索掛谷集合、有限方向取樣，以及三維掛谷猜想的最新結果與限制。
publishedAt: 2026-07-28
updatedAt: 2026-07-28
category: 實作教學
tags: [掛谷猜想, Three.js, 3D, 數學視覺化]
author: 賽腦耶
sources:
  - title: Wang–Zahl 三維掛谷猜想論文
    url: https://arxiv.org/abs/2502.17655
  - title: Three.js 官方文件
    url: https://threejs.org/docs/
aiAssisted: true
draft: false
featured: false
seoTitle: 掛谷猜想 3D 互動實驗室｜Simon Synapse
seoDescription: 透過互動操作、沉浸光影與分段教學，理解掛谷集合的方向、體積與維度，以及三維掛谷猜想的最新證明結果。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://simonsynapse.net/kakeya/interactive/
status: 運作中
---
```

The body must link all three internal routes, state the finite-sample limitation, summarize the 2025 result, and list the original paper under the existing sources component.

- [ ] **Step 3: Run the complete local quality gate**

Run:

```powershell
npm.cmd run check
$env:PUBLIC_SHOW_DRAFTS='false'; $env:PUBLIC_ADS_ENABLED='false'; npm.cmd run build
$env:PUBLIC_SHOW_DRAFTS='true'; $env:PUBLIC_ADS_ENABLED='false'; npm.cmd run test:e2e -- --project=chromium
```

Expected:

- Astro reports 0 diagnostics.
- All Vitest tests pass.
- The build verifier finds the 3 Kakeya pages and the project-detail page.
- All Chromium E2E tests pass, including reduced motion and accessibility.

- [ ] **Step 4: Commit the integration and quality gate**

Run:

```powershell
git add src/content/projects/kakeya-3d-lab.md tests/e2e/content-routes.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/kakeya.spec.ts scripts/verify-build.mjs
git commit -m "feat: integrate Kakeya lab into Simon Synapse"
```

---

### Task 9: Release Through the Existing Simon Synapse Pipeline

**Files:**
- No source edits expected.
- Verify: built files and the four public URLs.

**Interfaces:**
- Consumes: the completed feature branch and existing GitHub/Cloudflare deployment integration.
- Produces: reviewed main-branch source and live Simon Synapse routes.

- [ ] **Step 1: Verify branch scope before publishing**

Run:

```powershell
git status --short
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: no uncommitted files; changes are limited to approved Kakeya docs, dependencies, shared Kakeya modules, three pages, the project entry, and related tests/build verification.

- [ ] **Step 2: Push the isolated feature branch and open a ready pull request**

Run:

```powershell
git push -u origin codex/kakeya-3d-pages
gh pr create --base main --head codex/kakeya-3d-pages --title "feat: add Kakeya 3D page suite" --body "Adds three integrated Kakeya experiences: interactive science, immersive art, and mathematical learning. Includes deterministic geometry tests, reduced-motion behavior, WebGL fallback, project discovery, SEO, accessibility, and build verification."
```

Expected: GitHub returns a pull-request URL targeting `main`.

- [ ] **Step 3: Wait for CI and merge only after it succeeds**

Run:

```powershell
gh pr checks --watch
gh pr merge --squash --delete-branch
```

Expected: all required checks succeed and the pull request merges into `main`.

- [ ] **Step 4: Verify production routes read-only**

Check these URLs until the existing Cloudflare deployment completes:

```text
https://simonsynapse.net/kakeya/interactive/
https://simonsynapse.net/kakeya/immersive/
https://simonsynapse.net/kakeya/learn/
https://simonsynapse.net/projects/kakeya-3d-lab/
```

Expected for each URL:

- HTTP 200.
- Correct page title and one H1.
- Each Kakeya experience exposes all three mode links.
- The learning page includes the Wang–Zahl source and finite-sample disclaimer.
- `/projects/` links to the new project while the homepage still shows the same four core projects.

If deployment fails, report exactly:

```text
Status：發布未完成。
Root Cause：<copy the failed GitHub or Cloudflare check name and its concrete error>。
Suggested Fix：<the smallest corrective action supported by that error>。
```
