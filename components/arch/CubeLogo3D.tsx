"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./CubeLogo3D.module.css";

const LOGO_COLOR = 0x4c5ebf;
const LOGO_SOURCE = "/nokta_cube_logo.glb";
const FALLBACK_SOURCE = "/nokta_cube_logo.svg";
const ROTATION_PERIOD_MS = 14000;
const MODEL_WIDTH = 3.9;
const MODEL_SCREEN_FRACTION = 0.55;
// Keep in sync with .canvas in CubeLogo3D.module.css. The canvas renders
// beyond the headline box so rotating depth/bevels cannot hit its edges.
const CANVAS_OVERSCAN_X = 0.04;
const CANVAS_OVERSCAN_Y = 0.35;
// Leave a small horizontal safety inset so the model's bevel never touches
// the WebGL viewport edge while preserving its measured 55% width.
const LOGO_OFFSET_X = -1.43;

/**
 * Loads the handmade GLB and gives it the branch's cobalt/gloss treatment.
 * The SVG remains available as a crisp fallback for unsupported or
 * reduced-motion contexts.
 */
export default function CubeLogo3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  // Keep the fallback visible during the initial client render and until the
  // mesh has loaded. This also avoids a server/client markup mismatch.
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    let renderer: THREE.WebGLRenderer | undefined;
    let frameId = 0;
    let disposed = false;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
    camera.position.set(0, 0.16, 4.8);
    camera.lookAt(0, 0, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.className = styles.canvas;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff8ea, 0x20264e, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.8);
    keyLight.position.set(-2.8, 3.6, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa9b4ff, 3.4);
    rimLight.position.set(3.2, -1.4, -2.4);
    scene.add(rimLight);

    const logo = new THREE.Group();
    scene.add(logo);

    const loader = new GLTFLoader();
    loader.load(
      LOGO_SOURCE,
      (gltf) => {
        if (disposed) return;

        const material = new THREE.MeshPhysicalMaterial({
          color: LOGO_COLOR,
          roughness: 0.2,
          metalness: 0.04,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          side: THREE.DoubleSide,
        });
        materials.push(material);

        let meshCount = 0;
        gltf.scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          meshCount += 1;
          geometries.push(object.geometry);
          object.material = Array.isArray(object.material)
            ? object.material.map(() => material)
            : material;
          object.castShadow = true;
          object.receiveShadow = true;
        });

        if (meshCount === 0) {
          setFallback(true);
          return;
        }

        logo.add(gltf.scene);
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const uniformScale = Math.min(MODEL_WIDTH / size.x, 2.15 / size.y);
        gltf.scene.scale.setScalar(uniformScale);
        // Scale the centering offset as well because the loaded model's
        // translation is applied outside its local scale.
        gltf.scene.position.set(
          -center.x * uniformScale,
          -center.y * uniformScale,
          -center.z * uniformScale,
        );
        // Keep the parent rotation free of yaw/roll. The imported model's
        // local orientation is preserved; only this parent rotates on X.
        logo.position.x = LOGO_OFFSET_X;
        logo.rotation.set(0, 0, 0);
        setFallback(false);
      },
      undefined,
      () => {
        if (!disposed) setFallback(true);
      },
    );

    const resize = () => {
      if (!renderer) return;
      const stageWidth = Math.max(mount.clientWidth, 1);
      const stageHeight = Math.max(mount.clientHeight, 1);
      const renderWidth = stageWidth * (1 + CANVAS_OVERSCAN_X * 2);
      const renderHeight = stageHeight * (1 + CANVAS_OVERSCAN_Y * 2);
      const aspect = renderWidth / renderHeight;
      renderer.setSize(renderWidth, renderHeight, false);
      camera.aspect = aspect;
      // Fit the normalized model to the same percentage of the lockup at every
      // breakpoint. This lets the 3D mark behave like the fixed-ratio SVG logos
      // used by /point and /line. Compensate for the larger overscan canvas so
      // its visible size inside the original headline box does not change.
      const renderFraction = MODEL_SCREEN_FRACTION * (stageWidth / renderWidth);
      const horizontalHalfView = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspect;
      camera.position.z = MODEL_WIDTH / (2 * renderFraction * horizontalHalfView);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const startedAt = performance.now();
    const render = (now: number) => {
      if (disposed || !renderer) return;
      const elapsed = now - startedAt;
      logo.rotation.set((elapsed / ROTATION_PERIOD_MS) * Math.PI * 2, 0, 0);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={styles.stage}
      data-fallback={fallback ? "true" : "false"}
      aria-hidden="true"
    >
      <Image
        className={styles.fallback}
        src={FALLBACK_SOURCE}
        alt=""
        width={1276}
        height={262}
        sizes="(max-width: 960px) 55vw, 528px"
        unoptimized
      />
    </div>
  );
}
