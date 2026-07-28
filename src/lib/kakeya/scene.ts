import {
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  FogExp2,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createAdaptiveQualityMonitor } from "./adaptive-quality";
import { createSegmentInstances } from "./math";
import { createKakeyaSceneController } from "./scene-controller";
import type {
  KakeyaSceneConfig,
  KakeyaSceneController,
} from "./types";

const UP = new Vector3(0, 1, 0);
const CYAN = new Color(0x58e6ff);
const VIOLET = new Color(0x9b7bff);
const MAGENTA = new Color(0xff5fd2);

function showSceneError(host: HTMLElement) {
  host.querySelector<HTMLElement>("[data-kakeya-loading]")?.setAttribute(
    "hidden",
    "",
  );
  host.querySelector<HTMLElement>("[data-kakeya-error]")?.removeAttribute(
    "hidden",
  );
  host.dataset.state = "error";
}

export function mountKakeyaScene(
  host: HTMLElement,
  initial: KakeyaSceneConfig,
): KakeyaSceneController {
  const canvas = host.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) throw new Error("Kakeya canvas is missing");

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.05, 20);
  camera.position.set(1.9, 1.35, 2.15);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 1.15;
  controls.maxDistance = 4.5;

  const root = new Group();
  scene.add(root);
  scene.add(new HemisphereLight(0xa8f4ff, 0x12082b, 2.1));
  const keyLight = new PointLight(0x58e6ff, 9, 6);
  keyLight.position.set(1.7, 1.4, 1.9);
  scene.add(keyLight);
  const rimLight = new PointLight(0xff5fd2, 7, 5);
  rimLight.position.set(-1.5, -0.8, -1.4);
  scene.add(rimLight);

  let tubes: InstancedMesh | undefined;
  let activeConfig = initial;
  let controller: KakeyaSceneController;
  let qualityUpdatePending = false;
  let live = true;
  const qualityMonitor = createAdaptiveQualityMonitor({
    sampleSize: 30,
    slowFrameThresholdMs: 24,
    slowFrameRatio: 0.7,
    minimumCount: 96,
  });

  const adapter = {
    rebuild(config: KakeyaSceneConfig) {
      activeConfig = config;
      if (tubes) {
        root.remove(tubes);
        tubes.geometry.dispose();
        (tubes.material as Material).dispose();
      }

      renderer.setClearColor(config.background, 1);
      scene.fog = new FogExp2(config.background, 0.32);

      const geometry = new CylinderGeometry(1, 1, 1, 8, 1, true);
      const material = new MeshStandardMaterial({
        color: 0xffffff,
        emissive: config.mode === "immersive" ? 0x4d267a : 0x172f74,
        emissiveIntensity: config.mode === "immersive" ? 1.15 : 0.72,
        metalness: 0.15,
        opacity: config.mode === "immersive" ? 0.42 : 0.72,
        roughness: 0.28,
        transparent: true,
        depthWrite: config.mode !== "immersive",
      });

      tubes = new InstancedMesh(geometry, material, config.count);
      tubes.instanceMatrix.setUsage(DynamicDrawUsage);
      const matrix = new Matrix4();
      const quaternion = new Quaternion();
      const scale = new Vector3();
      const position = new Vector3();
      const direction = new Vector3();
      const color = new Color();

      createSegmentInstances({
        count: config.count,
        dispersion: config.dispersion,
        seed: config.seed,
      }).forEach((segment, index) => {
        direction.set(
          segment.direction.x,
          segment.direction.y,
          segment.direction.z,
        );
        quaternion.setFromUnitVectors(UP, direction);
        position.set(segment.center.x, segment.center.y, segment.center.z);
        scale.set(config.tubeRadius, segment.length, config.tubeRadius);
        matrix.compose(position, quaternion, scale);
        tubes?.setMatrixAt(index, matrix);

        const phase = index / Math.max(1, config.count - 1);
        if (phase < 0.5) color.copy(CYAN).lerp(VIOLET, phase * 2);
        else color.copy(VIOLET).lerp(MAGENTA, (phase - 0.5) * 2);
        tubes?.setColorAt(index, color);
      });

      tubes.instanceMatrix.needsUpdate = true;
      if (tubes.instanceColor) tubes.instanceColor.needsUpdate = true;
      root.add(tubes);
    },
    render(rotation: number) {
      const renderStartedAt = performance.now();
      root.rotation.y = rotation;
      root.rotation.x =
        activeConfig.mode === "immersive" ? Math.sin(rotation * 0.5) * 0.16 : 0;
      renderer.render(scene, camera);
      const nextCount = qualityMonitor.record(
        performance.now() - renderStartedAt,
        activeConfig.count,
      );
      if (nextCount !== null && !qualityUpdatePending) {
        qualityUpdatePending = true;
        queueMicrotask(() => {
          qualityUpdatePending = false;
          if (!live) return;
          host.dataset.quality = "reduced";
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
          controller.update({ count: nextCount });
          resize();
        });
      }
    },
    dispose() {
      tubes?.geometry.dispose();
      (tubes?.material as Material | undefined)?.dispose();
      controls.dispose();
      renderer.dispose();
    },
  };

  controller = createKakeyaSceneController({
    initial,
    adapter,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
  });

  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    controller.renderOnce();
  };

  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const onMotionPreference = (event: MediaQueryListEvent) =>
    controller.setReducedMotion(event.matches);
  const onVisibility = () =>
    controller.setVisible(document.visibilityState !== "hidden");
  const onContextLost = (event: Event) => {
    event.preventDefault();
    controller.setVisible(false);
    showSceneError(host);
  };
  let restoreAttempts = 0;
  const onContextRestored = () => {
    restoreAttempts += 1;
    if (restoreAttempts > 1) {
      showSceneError(host);
      return;
    }
    host.querySelector<HTMLElement>("[data-kakeya-error]")?.setAttribute(
      "hidden",
      "",
    );
    renderer.resetState();
    controller.update({});
    controller.setVisible(document.visibilityState !== "hidden");
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  controls.addEventListener("change", controller.renderOnce);
  motionQuery.addEventListener("change", onMotionPreference);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  controller.setReducedMotion(motionQuery.matches);
  resize();
  host.dataset.ready = "true";
  host.dataset.state = "ready";
  host.dataset.quality = "full";
  host.querySelector<HTMLElement>("[data-kakeya-loading]")?.setAttribute(
    "hidden",
    "",
  );

  return {
    ...controller,
    destroy() {
      live = false;
      resizeObserver.disconnect();
      controls.removeEventListener("change", controller.renderOnce);
      motionQuery.removeEventListener("change", onMotionPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      controller.destroy();
    },
  };
}
