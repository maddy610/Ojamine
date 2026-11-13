"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { SITE_CONFIG } from "@/config/siteConfig";
import {
  studioStore,
  useStudioStore,
  motionState,
} from "@/store/studioStore";

interface BlockFaceLabelProps {
  text: string;
  subtext?: string;
  width: number;
  height: number;
  zOffset: number;
  variant: "dark" | "light" | "orange";
}

/**
 * Renders crisp architectural typography directly onto the 3D front face of a block
 * using a high-DPI CanvasTexture so labels sit in true 3D perspective and never fail to render.
 */
function BlockFaceLabel({
  text,
  subtext,
  width,
  height,
  zOffset,
  variant,
}: BlockFaceLabelProps) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    const aspect = Math.max(1.2, width / Math.max(0.2, height));
    const cw = 512;
    const ch = Math.round(cw / aspect);
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, cw, ch);

      const fg =
        variant === "light"
          ? "#0E0D0B"
          : variant === "orange"
          ? "#EDE5D3"
          : "#EDE5D3";
      const accent = variant === "orange" ? "#EDE5D3" : "#E8502A";

      // Status indicator square on top-left or left
      const padX = Math.round(cw * 0.08);
      const centerY = ch / 2;

      // Accent dot
      ctx.fillStyle = accent;
      const dotSize = Math.max(10, Math.round(ch * 0.09));
      ctx.fillRect(
        padX,
        subtext ? centerY - dotSize - 8 : centerY - dotSize / 2,
        dotSize,
        dotSize
      );

      // Main label text
      ctx.fillStyle = fg;
      const mainFontSize = Math.min(
        Math.round(ch * (subtext ? 0.24 : 0.28)),
        Math.round((cw * 0.76) / Math.max(5, text.length * 0.58))
      );
      ctx.font = `700 ${mainFontSize}px "Space Grotesk", "Inter", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(
        text,
        padX + dotSize + 14,
        subtext ? centerY - mainFontSize * 0.35 : centerY + 1
      );

      // Optional subtext
      if (subtext) {
        ctx.fillStyle =
          variant === "light"
            ? "rgba(14,13,11,0.62)"
            : "rgba(237,229,211,0.65)";
        const subFontSize = Math.max(13, Math.round(mainFontSize * 0.54));
        ctx.font = `500 ${subFontSize}px monospace`;
        ctx.fillText(
          subtext,
          padX + dotSize + 14,
          centerY + mainFontSize * 0.55
        );
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }, [text, subtext, width, height, variant]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, zOffset]}>
      <planeGeometry args={[width * 0.92, height * 0.84]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function sampleTimeline(progress: number) {
  const chapters = SITE_CONFIG.timeline;
  const clamped = Math.max(0, Math.min(1, progress));
  const anchors = [0.0, 0.26, 0.52, 0.74, 0.92];

  let idx = 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (clamped >= anchors[i] && clamped <= anchors[i + 1]) {
      idx = i;
      break;
    }
    if (clamped > anchors[anchors.length - 1]) {
      idx = anchors.length - 2;
    }
  }

  const startP = anchors[idx];
  const endP = anchors[idx + 1];
  const rawT =
    endP > startP
      ? Math.max(0, Math.min(1, (clamped - startP) / (endP - startP)))
      : 1;
  const t = rawT * rawT * (3 - 2 * rawT);

  const cA = chapters[idx];
  const cB = chapters[idx + 1];

  const lerp3 = (
    a: [number, number, number],
    b: [number, number, number]
  ): [number, number, number] => [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ];

  return {
    cameraPos: lerp3(cA.cameraPos, cB.cameraPos),
    cameraLookAt: lerp3(cA.cameraLookAt, cB.cameraLookAt),
    stageOffset: lerp3(cA.stageOffset, cB.stageOffset),
    stageRot: lerp3(cA.stageRot, cB.stageRot),
    stageScale: THREE.MathUtils.lerp(cA.stageScale, cB.stageScale, t),
    orangePos: lerp3(cA.orangeBlockPos, cB.orangeBlockPos),
    orangeRot: lerp3(cA.orangeBlockRot, cB.orangeBlockRot),
    orangeScale: lerp3(cA.orangeBlockScale, cB.orangeBlockScale),
    assemblyFactor: THREE.MathUtils.lerp(
      cA.assemblyFactor,
      cB.assemblyFactor,
      t
    ),
    explodedFactor: THREE.MathUtils.lerp(
      cA.explodedFactor,
      cB.explodedFactor,
      t
    ),
  };
}

export function StudioScene() {
  const {
    selectedBaseId,
    selectedExtraIds,
    hoveredBlockId,
    orangeHovered,
    activeChapterIndex,
    hoveredServiceIndex,
    hoveredProcessIndex,
    reducedMotion,
    isMobile,
  } = useStudioStore();

  const stageGroupRef = useRef<THREE.Group>(null);

  // Outer Frame & Screen Backplate Refs
  const frameTopRef = useRef<THREE.Mesh>(null);
  const frameBottomRef = useRef<THREE.Mesh>(null);
  const frameLeftRef = useRef<THREE.Mesh>(null);
  const frameRightRef = useRef<THREE.Mesh>(null);
  const screenBoardRef = useRef<THREE.Mesh>(null);
  const navbarRef = useRef<THREE.Group>(null);

  // Hero Base Block & Extra Module Block Refs
  const heroBlockRef = useRef<THREE.Group>(null);
  const extraBlockRefs = useRef<Record<string, THREE.Group | null>>({});
  const orangeGroupRef = useRef<THREE.Group>(null);

  const currentCamPos = useRef(new THREE.Vector3(0, 0.35, 8.0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((stateThree, delta) => {
    const dt = Math.min(delta, 0.05);
    const store = studioStore.getState();
    const scroll = motionState.scrollProgress;
    const sampled = sampleTimeline(scroll);
    const clockTime = stateThree.clock.elapsedTime;

    // 1. Damped pointer parallax
    motionState.pointerX = THREE.MathUtils.damp(
      motionState.pointerX,
      motionState.targetPointerX,
      6,
      dt
    );
    motionState.pointerY = THREE.MathUtils.damp(
      motionState.pointerY,
      motionState.targetPointerY,
      6,
      dt
    );

    const px = store.reducedMotion ? 0 : motionState.pointerX * 0.14;
    const py = store.reducedMotion ? 0 : motionState.pointerY * 0.1;

    // 2. Damped Camera
    const camZOffset = store.isMobile ? 2.2 : 0;
    currentCamPos.current.x = THREE.MathUtils.damp(
      currentCamPos.current.x,
      sampled.cameraPos[0] + px,
      6,
      dt
    );
    currentCamPos.current.y = THREE.MathUtils.damp(
      currentCamPos.current.y,
      sampled.cameraPos[1] + py,
      6,
      dt
    );
    currentCamPos.current.z = THREE.MathUtils.damp(
      currentCamPos.current.z,
      sampled.cameraPos[2] + camZOffset,
      6,
      dt
    );

    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      sampled.cameraLookAt[0] + px * 0.18,
      6.5,
      dt
    );
    currentLookAt.current.y = THREE.MathUtils.damp(
      currentLookAt.current.y,
      sampled.cameraLookAt[1] + py * 0.18,
      6.5,
      dt
    );
    currentLookAt.current.z = THREE.MathUtils.damp(
      currentLookAt.current.z,
      sampled.cameraLookAt[2],
      6.5,
      dt
    );

    stateThree.camera.position.copy(currentCamPos.current);
    stateThree.camera.lookAt(currentLookAt.current);

    // 3. Stage Group Position, Rotation & Scale (strictly fits in its 50% viewport half)
    if (stageGroupRef.current) {
      const targetStageX = store.isMobile
        ? sampled.stageOffset[0] * 0.28
        : sampled.stageOffset[0];
      const targetStageY = store.isMobile
        ? sampled.stageOffset[1] - 0.2
        : sampled.stageOffset[1];
      const targetStageZ = sampled.stageOffset[2];

      stageGroupRef.current.position.x = THREE.MathUtils.damp(
        stageGroupRef.current.position.x,
        targetStageX,
        6,
        dt
      );
      stageGroupRef.current.position.y = THREE.MathUtils.damp(
        stageGroupRef.current.position.y,
        targetStageY,
        6,
        dt
      );
      stageGroupRef.current.position.z = THREE.MathUtils.damp(
        stageGroupRef.current.position.z,
        targetStageZ,
        6,
        dt
      );

      const rotX =
        sampled.stageRot[0] +
        (store.reducedMotion ? 0 : -motionState.pointerY * 0.035);
      const rotY =
        sampled.stageRot[1] +
        (store.reducedMotion ? 0 : motionState.pointerX * 0.06);

      stageGroupRef.current.rotation.x = THREE.MathUtils.damp(
        stageGroupRef.current.rotation.x,
        rotX,
        6,
        dt
      );
      stageGroupRef.current.rotation.y = THREE.MathUtils.damp(
        stageGroupRef.current.rotation.y,
        rotY,
        6,
        dt
      );
      stageGroupRef.current.rotation.z = THREE.MathUtils.damp(
        stageGroupRef.current.rotation.z,
        sampled.stageRot[2],
        6,
        dt
      );

      const s = THREE.MathUtils.damp(
        stageGroupRef.current.scale.x,
        sampled.stageScale,
        6,
        dt
      );
      stageGroupRef.current.scale.set(s, s, s);
    }

    const a = sampled.assemblyFactor;
    const exp = sampled.explodedFactor;
    const builderBlend = Math.max(0, Math.min(1, (scroll - 0.78) / 0.1));

    // 4. Outer Frame Rails
    if (frameTopRef.current) {
      const tx = THREE.MathUtils.lerp(-0.42, 0.0, a);
      const ty = THREE.MathUtils.lerp(1.14, 1.16, a);
      const tz = 0.04 + exp * 0.18;
      const sx = THREE.MathUtils.lerp(0.75, 1.0, a);

      frameTopRef.current.position.set(
        THREE.MathUtils.damp(frameTopRef.current.position.x, tx, 7, dt),
        THREE.MathUtils.damp(frameTopRef.current.position.y, ty, 7, dt),
        THREE.MathUtils.damp(frameTopRef.current.position.z, tz, 7, dt)
      );
      frameTopRef.current.scale.x = THREE.MathUtils.damp(
        frameTopRef.current.scale.x,
        sx,
        7,
        dt
      );
    }

    if (frameBottomRef.current) {
      const tx = THREE.MathUtils.lerp(-0.08, 0.0, a);
      const ty = THREE.MathUtils.lerp(-1.14, -1.16, a);
      const tz = 0.04 + exp * 0.18;
      const sx = THREE.MathUtils.lerp(0.84, 1.0, a);

      frameBottomRef.current.position.set(
        THREE.MathUtils.damp(frameBottomRef.current.position.x, tx, 7, dt),
        THREE.MathUtils.damp(frameBottomRef.current.position.y, ty, 7, dt),
        THREE.MathUtils.damp(frameBottomRef.current.position.z, tz, 7, dt)
      );
      frameBottomRef.current.scale.x = THREE.MathUtils.damp(
        frameBottomRef.current.scale.x,
        sx,
        7,
        dt
      );
    }

    if (frameLeftRef.current) {
      const tx = THREE.MathUtils.lerp(-1.38, -1.62, a);
      const tz = 0.04 + exp * 0.18;

      frameLeftRef.current.position.set(
        THREE.MathUtils.damp(frameLeftRef.current.position.x, tx, 7, dt),
        0,
        THREE.MathUtils.damp(frameLeftRef.current.position.z, tz, 7, dt)
      );
    }

    if (frameRightRef.current) {
      const tx = THREE.MathUtils.lerp(1.38, 1.62, a);
      const ty = THREE.MathUtils.lerp(-0.28, 0.0, a);
      const tz = 0.04 + exp * 0.18;
      const sy = THREE.MathUtils.lerp(0.74, 1.0, a);

      frameRightRef.current.position.set(
        THREE.MathUtils.damp(frameRightRef.current.position.x, tx, 7, dt),
        THREE.MathUtils.damp(frameRightRef.current.position.y, ty, 7, dt),
        THREE.MathUtils.damp(frameRightRef.current.position.z, tz, 7, dt)
      );
      frameRightRef.current.scale.y = THREE.MathUtils.damp(
        frameRightRef.current.scale.y,
        sy,
        7,
        dt
      );
    }

    // 5. Website Screen Backplate
    if (screenBoardRef.current) {
      const tz = THREE.MathUtils.lerp(-0.38, -0.05, a) - exp * 0.24;
      const s = THREE.MathUtils.lerp(0.78, 1.0, a);
      screenBoardRef.current.position.z = THREE.MathUtils.damp(
        screenBoardRef.current.position.z,
        tz,
        7,
        dt
      );
      screenBoardRef.current.scale.set(
        THREE.MathUtils.damp(screenBoardRef.current.scale.x, s, 7, dt),
        THREE.MathUtils.damp(screenBoardRef.current.scale.y, s, 7, dt),
        1
      );
    }

    // 6. Top Browser Navigation Bar
    if (navbarRef.current) {
      const driftFloat = !store.reducedMotion
        ? Math.sin(clockTime * 1.2) * 0.05 * (1 - a)
        : 0;
      const tx = THREE.MathUtils.lerp(-1.5, 0.0, a);
      const ty = THREE.MathUtils.lerp(1.55, 0.92, a) + driftFloat;
      const processBoostZ = store.hoveredProcessIndex === 0 ? 0.18 : 0;
      const tz =
        THREE.MathUtils.lerp(-0.26, 0.08, a) + exp * 0.34 + processBoostZ;

      const rx = THREE.MathUtils.lerp(0.14, 0, a);
      const ry = THREE.MathUtils.lerp(0.22, 0, a);

      navbarRef.current.position.set(
        THREE.MathUtils.damp(navbarRef.current.position.x, tx, 7, dt),
        THREE.MathUtils.damp(navbarRef.current.position.y, ty, 7, dt),
        THREE.MathUtils.damp(navbarRef.current.position.z, tz, 7, dt)
      );
      navbarRef.current.rotation.set(
        THREE.MathUtils.damp(navbarRef.current.rotation.x, rx, 7, dt),
        THREE.MathUtils.damp(navbarRef.current.rotation.y, ry, 7, dt),
        0
      );
    }

    // 7. Main Hero Website Block (Displays active Base Type: Business Site / Portfolio / Redesign)
    if (heroBlockRef.current) {
      const isBaseHovered =
        store.hoveredBlockId === "business-site" ||
        store.hoveredBlockId === "portfolio" ||
        store.hoveredBlockId === "redesign";
      const driftFloat = !store.reducedMotion
        ? Math.cos(clockTime * 1.1) * 0.05 * (1 - a)
        : 0;
      const tx = THREE.MathUtils.lerp(-2.05, -0.4, a);
      const ty = THREE.MathUtils.lerp(0.42, 0.52, a) + driftFloat;
      const processBoostZ = store.hoveredProcessIndex === 1 ? 0.18 : 0;
      const hoverBoostZ = isBaseHovered ? 0.08 : 0;
      const tz =
        THREE.MathUtils.lerp(-0.2, 0.14, a) +
        exp * 0.4 +
        processBoostZ +
        hoverBoostZ;

      const rx = THREE.MathUtils.lerp(0.12, 0, a);
      const ry = THREE.MathUtils.lerp(0.24, 0, a);

      heroBlockRef.current.position.set(
        THREE.MathUtils.damp(heroBlockRef.current.position.x, tx, 7.5, dt),
        THREE.MathUtils.damp(heroBlockRef.current.position.y, ty, 7.5, dt),
        THREE.MathUtils.damp(heroBlockRef.current.position.z, tz, 7.5, dt)
      );
      heroBlockRef.current.rotation.set(
        THREE.MathUtils.damp(heroBlockRef.current.rotation.x, rx, 7.5, dt),
        THREE.MathUtils.damp(heroBlockRef.current.rotation.y, ry, 7.5, dt),
        0
      );
    }

    // 8. Modular Extra Blocks (3 Feature Columns + Bottom Bar)
    // When unselected in Builder, they slide down into the 4-slot Parts Tray below the frame
    const extraOptions = SITE_CONFIG.builderBlocks.filter(
      (b) => b.category === "extra"
    );
    const heroDriftCoords: [number, number, number][] = [
      [-1.9, -1.38, 0.2],
      [0.0, -1.72, -0.22],
      [1.95, -1.32, -0.16],
      [2.05, 0.32, -0.28],
    ];

    extraOptions.forEach((bBlock, idx) => {
      const group = extraBlockRefs.current[bBlock.id];
      if (!group) return;

      const isSelected = store.selectedExtraIds.includes(bBlock.id);
      const isHovered = store.hoveredBlockId === bBlock.id;
      const driftOrigin = heroDriftCoords[idx] ?? [0, -1.7, 0];

      const driftFloat = !store.reducedMotion
        ? Math.sin(clockTime * 1.15 + idx * 1.1) * 0.05 * (1 - a)
        : 0;

      const trayFactor = isSelected ? 0 : builderBlend;
      const assembledX = THREE.MathUtils.lerp(
        bBlock.slotPos[0],
        bBlock.trayPos[0],
        trayFactor
      );
      const assembledY = THREE.MathUtils.lerp(
        bBlock.slotPos[1],
        bBlock.trayPos[1],
        trayFactor
      );
      const assembledZ = THREE.MathUtils.lerp(
        bBlock.slotPos[2],
        bBlock.trayPos[2],
        trayFactor
      );

      const tx = THREE.MathUtils.lerp(driftOrigin[0], assembledX, a);
      const ty =
        THREE.MathUtils.lerp(driftOrigin[1], assembledY, a) +
        driftFloat +
        (isHovered ? 0.04 : 0);

      const serviceBoostZ =
        idx < 3 && store.hoveredServiceIndex === idx ? 0.22 : 0;
      const processBoostZ =
        (idx < 3 && store.hoveredProcessIndex === 2) ||
        (idx === 3 && store.hoveredProcessIndex === 3)
          ? 0.18
          : 0;
      const hoverBoostZ = isHovered ? 0.09 : 0;

      const tz =
        THREE.MathUtils.lerp(driftOrigin[2], assembledZ, a) +
        exp * 0.4 +
        serviceBoostZ +
        processBoostZ +
        hoverBoostZ;

      const rx = THREE.MathUtils.lerp(0.18 * (idx % 2 === 0 ? 1 : -1), 0, a);
      const ry = THREE.MathUtils.lerp(-0.2 * (idx % 2 === 0 ? 1 : -1), 0, a);

      group.position.set(
        THREE.MathUtils.damp(group.position.x, tx, 8, dt),
        THREE.MathUtils.damp(group.position.y, ty, 8, dt),
        THREE.MathUtils.damp(group.position.z, tz, 8, dt)
      );
      group.rotation.set(
        THREE.MathUtils.damp(group.rotation.x, rx, 8, dt),
        THREE.MathUtils.damp(group.rotation.y, ry, 8, dt),
        0
      );
    });

    // 9. THE SIGNATURE ORANGE BLOCK (#E8502A)
    if (orangeGroupRef.current) {
      let ox = sampled.orangePos[0];
      let oy = sampled.orangePos[1];
      let oz = sampled.orangePos[2];

      let orx = sampled.orangeRot[0];
      let ory = sampled.orangeRot[1];
      let orz = sampled.orangeRot[2];

      if (!store.reducedMotion && a < 0.5) {
        oy += Math.sin(clockTime * 2.2) * 0.05 * (1 - a);
        orz += Math.cos(clockTime * 1.6) * 0.08 * (1 - a);
      }

      if (store.hoveredServiceIndex !== null && scroll >= 0.16 && scroll <= 0.5) {
        const cardX = [-0.98, 0.0, 0.98][store.hoveredServiceIndex] ?? 1.06;
        ox = cardX;
        oy = 0.52;
        oz = 0.28;
      }

      if (
        store.hoveredProcessIndex !== null &&
        scroll >= 0.62 &&
        scroll <= 0.86
      ) {
        const stepY =
          [0.92, 0.52, -0.1, -0.7][store.hoveredProcessIndex] ?? 0.52;
        ox = 1.06;
        oy = stepY;
        oz = 0.26;
      }

      const elapsedSinceStamp = performance.now() - store.orangeStampTime;
      const stampZ =
        elapsedSinceStamp > 0 && elapsedSinceStamp < 360
          ? -Math.sin((elapsedSinceStamp / 360) * Math.PI) * 0.14
          : 0;
      const hoverZ = store.orangeHovered ? 0.08 : 0;

      orangeGroupRef.current.position.set(
        THREE.MathUtils.damp(orangeGroupRef.current.position.x, ox, 9, dt),
        THREE.MathUtils.damp(orangeGroupRef.current.position.y, oy, 9, dt),
        THREE.MathUtils.damp(
          orangeGroupRef.current.position.z,
          oz + hoverZ + stampZ,
          10,
          dt
        )
      );

      orangeGroupRef.current.rotation.set(
        THREE.MathUtils.damp(orangeGroupRef.current.rotation.x, orx, 8, dt),
        THREE.MathUtils.damp(orangeGroupRef.current.rotation.y, ory, 8, dt),
        THREE.MathUtils.damp(orangeGroupRef.current.rotation.z, orz, 8, dt)
      );

      const hScale = store.orangeHovered ? 1.05 : 1.0;
      orangeGroupRef.current.scale.set(
        THREE.MathUtils.damp(
          orangeGroupRef.current.scale.x,
          sampled.orangeScale[0] * hScale,
          9,
          dt
        ),
        THREE.MathUtils.damp(
          orangeGroupRef.current.scale.y,
          sampled.orangeScale[1] * hScale,
          9,
          dt
        ),
        THREE.MathUtils.damp(
          orangeGroupRef.current.scale.z,
          sampled.orangeScale[2] * hScale,
          9,
          dt
        )
      );
    }
  });

  const baseBlocks = SITE_CONFIG.builderBlocks.filter(
    (b) => b.category === "base"
  );
  const activeBaseBlock =
    baseBlocks.find((b) => b.id === selectedBaseId) ?? baseBlocks[0];
  const extraBlocks = SITE_CONFIG.builderBlocks.filter(
    (b) => b.category === "extra"
  );

  // Clicking the main Hero Banner block in 3D cycles through Business site -> Portfolio -> Redesign
  const cycleBaseBlock = () => {
    const idx = baseBlocks.findIndex((b) => b.id === selectedBaseId);
    const next = baseBlocks[(idx + 1) % baseBlocks.length];
    if (next) {
      studioStore.selectBaseBlock(next.id);
    }
  };

  const isHeroBaseHovered =
    hoveredBlockId === "business-site" ||
    hoveredBlockId === "portfolio" ||
    hoveredBlockId === "redesign";

  return (
    <group>
      {/* Warm Architectural Studio Lamp Lighting */}
      <ambientLight intensity={1.2} color="#FFF8EA" />

      <directionalLight
        castShadow
        position={[6.0, 9.5, 8.0]}
        intensity={2.4}
        color="#FFF4DE"
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />

      <directionalLight
        position={[-6.5, 4.0, 4.0]}
        intensity={1.05}
        color="#F7EFE0"
      />

      <directionalLight
        position={[0.0, -5.0, 4.0]}
        intensity={0.6}
        color="#EDE5D3"
      />

      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.28}
        scale={15}
        blur={2.4}
        far={5.5}
        color="#2B261F"
      />

      {/* Main 3D Website Maquette Stage */}
      <group ref={stageGroupRef} position={[2.3, 0.1, 0]} scale={0.92}>
        {/* 1. Outer Frame Rails */}
        <RoundedBox
          ref={frameTopRef}
          position={[-0.42, 1.14, 0.04]}
          scale={[0.75, 1, 1]}
          args={[3.38, 0.14, 0.22]}
          radius={0.035}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1A1816" roughness={0.72} metalness={0.04} />
        </RoundedBox>

        <RoundedBox
          ref={frameBottomRef}
          position={[-0.08, -1.14, 0.04]}
          scale={[0.84, 1, 1]}
          args={[3.38, 0.14, 0.22]}
          radius={0.035}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1A1816" roughness={0.72} metalness={0.04} />
        </RoundedBox>

        <RoundedBox
          ref={frameLeftRef}
          position={[-1.38, 0, 0.04]}
          args={[0.14, 2.18, 0.22]}
          radius={0.035}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1A1816" roughness={0.72} metalness={0.04} />
        </RoundedBox>

        <RoundedBox
          ref={frameRightRef}
          position={[1.38, -0.28, 0.04]}
          scale={[1, 0.74, 1]}
          args={[0.14, 2.18, 0.22]}
          radius={0.035}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1A1816" roughness={0.72} metalness={0.04} />
        </RoundedBox>

        {/* 2. Website Screen Backplate + Empty Slot Guides */}
        <RoundedBox
          ref={screenBoardRef}
          position={[0, 0, -0.38]}
          args={[3.1, 2.18, 0.08]}
          radius={0.025}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#F7F2E6" roughness={0.88} metalness={0.02} />

          {/* Subtle recessed slot placeholders on the Website Screen */}
          <mesh position={[1.06, 0.52, 0.045]}>
            <planeGeometry args={[0.72, 0.46]} />
            <meshBasicMaterial color="#E6DEC8" />
          </mesh>
          <mesh position={[-0.98, -0.1, 0.045]}>
            <planeGeometry args={[0.9, 0.46]} />
            <meshBasicMaterial color="#E6DEC8" />
          </mesh>
          <mesh position={[0.0, -0.1, 0.045]}>
            <planeGeometry args={[0.9, 0.46]} />
            <meshBasicMaterial color="#E6DEC8" />
          </mesh>
          <mesh position={[0.98, -0.1, 0.045]}>
            <planeGeometry args={[0.9, 0.46]} />
            <meshBasicMaterial color="#E6DEC8" />
          </mesh>
          <mesh position={[-0.4, -0.7, 0.045]}>
            <planeGeometry args={[2.04, 0.34]} />
            <meshBasicMaterial color="#E6DEC8" />
          </mesh>
        </RoundedBox>

        {/* 3. Website Top Browser Bar */}
        <group ref={navbarRef} position={[-1.5, 1.55, -0.26]}>
          <RoundedBox
            args={[2.9, 0.18, 0.1]}
            radius={0.025}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#1F1D1A" roughness={0.74} metalness={0.04} />
          </RoundedBox>
          <mesh position={[-1.28, 0, 0.055]}>
            <circleGeometry args={[0.026, 16]} />
            <meshBasicMaterial color="#E8502A" />
          </mesh>
          <mesh position={[-1.18, 0, 0.055]}>
            <circleGeometry args={[0.026, 16]} />
            <meshBasicMaterial color="#DED3BC" />
          </mesh>
          <mesh position={[-1.08, 0, 0.055]}>
            <circleGeometry args={[0.026, 16]} />
            <meshBasicMaterial color="#DED3BC" />
          </mesh>
        </group>

        {/* 4. Main Hero Banner Block (Displays selected Base Website Type directly on its 3D face) */}
        <group ref={heroBlockRef} position={[-2.05, 0.42, -0.2]}>
          <RoundedBox
            args={[2.08, 0.48, 0.14]}
            radius={0.035}
            smoothness={5}
            castShadow
            receiveShadow
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              cycleBaseBlock();
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              studioStore.setHoveredBlock(activeBaseBlock.id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              studioStore.setHoveredBlock(null);
              document.body.style.cursor = "auto";
            }}
          >
            <meshStandardMaterial
              color={isHeroBaseHovered ? "#2E2B26" : "#1E1C19"}
              roughness={0.76}
              metalness={0.04}
            />
          </RoundedBox>

          <BlockFaceLabel
            text={activeBaseBlock.shortLabel}
            subtext={
              activeChapterIndex === 4
                ? "CLICK TO SWITCH TYPE"
                : "BASE LAYOUT"
            }
            width={2.08}
            height={0.48}
            zOffset={0.074}
            variant="dark"
          />
        </group>

        {/* 5. Modular Website Content Blocks (3 Feature Columns + Bottom Bar)
            Each block has its label printed directly onto its 3D front face! */}
        {extraBlocks.map((bBlock, idx) => {
          const isSelected = selectedExtraIds.includes(bBlock.id);
          const isHovered = hoveredBlockId === bBlock.id;

          // In Services (chapter 1), display the 3 Service names on the 3 cards; otherwise show the module name
          const serviceTitles = ["BUSINESS", "PORTFOLIO", "REDESIGN"];
          const trayShortTitles = ["+ 3D", "+ MOTION", "+ SHOP", "+ COPY"];
          const slotTitles = [
            "3D SCENE",
            "ANIMATIONS",
            "E-COMMERCE",
            "COPY & DIRECTION",
          ];

          const inTray = activeChapterIndex === 4 && !isSelected;
          const blockWidth = inTray && idx === 3 ? 0.82 : bBlock.size[0];
          const blockHeight = bBlock.size[1];
          const blockDepth = bBlock.size[2];

          const faceTitle =
            activeChapterIndex === 1 && idx < 3
              ? serviceTitles[idx]
              : inTray
              ? trayShortTitles[idx]
              : slotTitles[idx];

          const faceSubtext =
            activeChapterIndex === 1 && idx < 3
              ? `0${idx + 1} / SERVICE`
              : activeChapterIndex === 4
              ? isSelected
                ? "INCLUDED (CLICK TO REMOVE)"
                : "CLICK TO ADD"
              : undefined;

          return (
            <group
              key={bBlock.id}
              ref={(el) => {
                extraBlockRefs.current[bBlock.id] = el;
              }}
              position={[-1.9, -1.38, 0.2]}
            >
              <RoundedBox
                args={[blockWidth, blockHeight, blockDepth]}
                radius={0.035}
                smoothness={5}
                castShadow
                receiveShadow
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  studioStore.toggleExtraBlock(bBlock.id);
                }}
                onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation();
                  studioStore.setHoveredBlock(bBlock.id);
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  if (hoveredBlockId === bBlock.id) {
                    studioStore.setHoveredBlock(null);
                  }
                  document.body.style.cursor = "auto";
                }}
              >
                <meshStandardMaterial
                  color={
                    !inTray
                      ? isHovered
                        ? "#34302A"
                        : "#26231F"
                      : isHovered
                      ? "#CFC2A8"
                      : "#DED3BC"
                  }
                  roughness={0.76}
                  metalness={0.04}
                />
              </RoundedBox>

              <BlockFaceLabel
                text={faceTitle}
                subtext={faceSubtext}
                width={blockWidth}
                height={blockHeight}
                zOffset={blockDepth / 2 + 0.004}
                variant={inTray ? "light" : "dark"}
              />
            </group>
          );
        })}

        {/* 6. THE SIGNATURE ORANGE BLOCK (#E8502A) */}
        <group
          ref={orangeGroupRef}
          position={[1.14, 1.14, 0.18]}
          scale={[0.54, 0.54, 0.28]}
        >
          <RoundedBox
            args={[1.0, 1.0, 1.0]}
            radius={0.07}
            smoothness={6}
            castShadow
            receiveShadow
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              if (activeChapterIndex === 4) {
                studioStore.triggerOrangeSend();
              } else {
                const target = document.getElementById("builder");
                if (target) {
                  target.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth",
                  });
                }
              }
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              studioStore.setOrangeHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              studioStore.setOrangeHovered(false);
              document.body.style.cursor = "auto";
            }}
          >
            <meshStandardMaterial
              color={orangeHovered ? "#D13E1B" : "#E8502A"}
              roughness={0.68}
              metalness={0.05}
            />
          </RoundedBox>

          {activeChapterIndex === 4 && (
            <BlockFaceLabel
              text="SEND ↗"
              width={0.96}
              height={0.85}
              zOffset={0.51}
              variant="orange"
            />
          )}
        </group>
      </group>
    </group>
  );
}
