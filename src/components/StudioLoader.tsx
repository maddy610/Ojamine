"use client";

import React, { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import { useStudioStore, studioStore } from "@/store/studioStore";

export function StudioLoader() {
  const { sceneReady } = useStudioStore();
  const [localDone, setLocalDone] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  const isReady = sceneReady || localDone;

  useEffect(() => {
    const fallback = setTimeout(() => {
      setLocalDone(true);
      studioStore.setSceneReady(true);
    }, 550);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (isReady) {
      const t = setTimeout(() => setUnmounted(true), 350);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  if (unmounted) return null;

  return (
    <div
      aria-hidden={isReady}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-paper p-6 transition-opacity duration-300 pointer-events-none ${
        isReady ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <BrandMark size={44} showWordmark={false} />
        <div className="w-32 h-0.5 bg-ink/15 overflow-hidden">
          <div className="h-full w-full bg-vermilion origin-left animate-pulse" />
        </div>
      </div>
    </div>
  );
}
