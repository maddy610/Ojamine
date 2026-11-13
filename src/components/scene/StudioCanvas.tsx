"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { StudioScene } from "./StudioScene";
import { studioStore, useStudioStore } from "@/store/studioStore";

export default function StudioCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [eventTarget, setEventTarget] = useState<HTMLElement | null>(null);
  const { isMobile } = useStudioStore();

  useEffect(() => {
    setEventTarget(document.body);

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    observer.observe(el);

    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-paper"
    >
      <Canvas
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop={isVisible ? "always" : "demand"}
        eventSource={eventTarget ?? undefined}
        eventPrefix="client"
        camera={{ position: [0, 0.4, 7.8], fov: 38, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#EDE5D3", 1);
          studioStore.setSceneReady(true);
        }}
      >
        <color attach="background" args={["#EDE5D3"]} />
        <fog attach="fog" args={["#EDE5D3", 13, 25]} />
        <Suspense fallback={null}>
          <StudioScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
