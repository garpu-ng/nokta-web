"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import styles from "./CubeLogo3D.module.css";

const LOGO_COLOR = 0x4c5ebf;
const LOGO_SOURCE = "/nokta_cube_logo.svg";
const ROTATION_PERIOD_MS = 14000;

/**
 * Converts the supplied vector mark into a shallow, bevelled mesh in the
 * browser. Keeping the SVG as the source avoids shipping a second large model
 * asset while preserving a crisp fallback for unsupported or reduced-motion
 * contexts.
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

    const loader = new SVGLoader();
    loader.load(
      LOGO_SOURCE,
      (data) => {
        if (disposed) return;

        const depth = 0.22;
        const material = new THREE.MeshPhysicalMaterial({
          color: LOGO_COLOR,
          roughness: 0.24,
          metalness: 0.04,
          clearcoat: 0.9,
          clearcoatRoughness: 0.12,
          side: THREE.DoubleSide,
        });
        materials.push(material);

        for (const path of data.paths) {
          const shapes = SVGLoader.createShapes(path);
          for (const shape of shapes) {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              bevelEnabled: true,
              bevelSegments: 3,
              bevelSize: 0.035,
              bevelThickness: 0.035,
              curveSegments: 8,
              depth,
              steps: 1,
            });
            // SVG coordinates point down the screen and extrusion starts at z=0.
            geometry.scale(1, -1, 1);
            geometry.translate(0, 0, -depth / 2);
            geometry.computeVertexNormals();
            geometries.push(geometry);
            logo.add(new THREE.Mesh(geometry, material));
          }
        }

        const bounds = new THREE.Box3().setFromObject(logo);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const uniformScale = Math.min(3.9 / size.x, 2.15 / size.y);
        logo.scale.setScalar(uniformScale);
        // Scale the centering offset as well; otherwise the unscaled SVG
        // coordinates would place the finished mesh hundreds of units away.
        logo.position.set(
          -center.x * uniformScale,
          -center.y * uniformScale,
          -center.z * uniformScale,
        );
        logo.rotation.x = -0.12;
        setFallback(false);
      },
      undefined,
      () => {
        if (!disposed) setFallback(true);
      },
    );

    const resize = () => {
      if (!renderer) return;
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const startedAt = performance.now();
    const render = (now: number) => {
      if (disposed || !renderer) return;
      const elapsed = now - startedAt;
      logo.rotation.x = -0.12 + (elapsed / ROTATION_PERIOD_MS) * Math.PI * 2;
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
        src={LOGO_SOURCE}
        alt=""
        fill
        sizes="(max-width: 960px) 94vw, 960px"
        unoptimized
      />
    </div>
  );
}
