"use client";

import { useSyncExternalStore } from "react";
import {
  buildProjectMessage,
  getMailtoUrl,
  getWhatsAppUrl,
} from "@/config/siteConfig";

export interface StudioState {
  /** Active section index (0 = hero, 1 = services, 2 = craft, 3 = process, 4 = builder) */
  activeChapterIndex: number;
  /** Hovered service index (0, 1, 2, or null) */
  hoveredServiceIndex: number | null;
  /** Hovered process index (0, 1, 2, 3, or null) */
  hoveredProcessIndex: number | null;
  /** Builder state: selected base project type */
  selectedBaseId: string;
  /** Builder state: selected extras */
  selectedExtraIds: string[];
  /** Hovered 3D or HTML builder block ID */
  hoveredBlockId: string | null;
  /** Whether the signature orange block is hovered */
  orangeHovered: boolean;
  /** Timestamp of last orange block press for physical stamp animation */
  orangeStampTime: number;
  /** Preferred dispatch channel when clicking the 3D Orange Send Block */
  preferredChannel: "whatsapp" | "email";
  /** Canvas loaded state */
  sceneReady: boolean;
  /** Accessibility & device flags */
  reducedMotion: boolean;
  isMobile: boolean;
}

/**
 * High-frequency 60fps scroll & pointer values read directly inside R3F useFrame
 */
export const motionState = {
  scrollProgress: 0,
  scrollVelocity: 0,
  pointerX: 0,
  pointerY: 0,
  targetPointerX: 0,
  targetPointerY: 0,
};

let state: StudioState = {
  activeChapterIndex: 0,
  hoveredServiceIndex: null,
  hoveredProcessIndex: null,
  selectedBaseId: "business-site",
  selectedExtraIds: ["3d", "animations"],
  hoveredBlockId: null,
  orangeHovered: false,
  orangeStampTime: 0,
  preferredChannel: "whatsapp",
  sceneReady: false,
  reducedMotion: false,
  isMobile: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function setState(patch: Partial<StudioState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const studioStore = {
  /** Returns immutable state snapshot for useSyncExternalStore and R3F */
  getState: () => state,

  /** Subscribe for React UI components */
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Update 60fps scroll values and emit React state only when chapter changes */
  setScroll: (progress: number, velocity: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    motionState.scrollProgress = clamped;
    motionState.scrollVelocity = velocity;

    let nextChapter = 0;
    if (clamped >= 0.84) nextChapter = 4;
    else if (clamped >= 0.66) nextChapter = 3;
    else if (clamped >= 0.43) nextChapter = 2;
    else if (clamped >= 0.19) nextChapter = 1;
    else nextChapter = 0;

    if (nextChapter !== state.activeChapterIndex) {
      setState({ activeChapterIndex: nextChapter });
    }
  },

  setHoveredService: (index: number | null) => {
    if (state.hoveredServiceIndex !== index) {
      setState({ hoveredServiceIndex: index });
    }
  },

  setHoveredProcess: (index: number | null) => {
    if (state.hoveredProcessIndex !== index) {
      setState({ hoveredProcessIndex: index });
    }
  },

  selectBaseBlock: (id: string) => {
    if (state.selectedBaseId !== id) {
      setState({ selectedBaseId: id });
    }
  },

  toggleExtraBlock: (id: string) => {
    const exists = state.selectedExtraIds.includes(id);
    const nextExtras = exists
      ? state.selectedExtraIds.filter((item) => item !== id)
      : [...state.selectedExtraIds, id];
    setState({ selectedExtraIds: nextExtras });
  },

  handleBlockClick: (id: string, category: "base" | "extra") => {
    if (category === "base") {
      studioStore.selectBaseBlock(id);
    } else {
      studioStore.toggleExtraBlock(id);
    }
  },

  setHoveredBlock: (id: string | null) => {
    if (state.hoveredBlockId !== id) {
      setState({ hoveredBlockId: id });
    }
  },

  setOrangeHovered: (hovered: boolean) => {
    if (state.orangeHovered !== hovered) {
      setState({ orangeHovered: hovered });
    }
  },

  setPreferredChannel: (channel: "whatsapp" | "email") => {
    if (state.preferredChannel !== channel) {
      setState({ preferredChannel: channel });
    }
  },

  setSceneReady: (ready: boolean) => {
    if (state.sceneReady !== ready) {
      setState({ sceneReady: ready });
    }
  },

  setDeviceFlags: (reducedMotion: boolean, isMobile: boolean) => {
    if (state.reducedMotion !== reducedMotion || state.isMobile !== isMobile) {
      setState({ reducedMotion, isMobile });
    }
  },

  triggerOrangeSend: (overrideChannel?: "whatsapp" | "email") => {
    setState({ orangeStampTime: performance.now() });

    const channel = overrideChannel || state.preferredChannel;
    const message = buildProjectMessage(
      state.selectedBaseId,
      state.selectedExtraIds
    );

    if (typeof window !== "undefined") {
      if (channel === "whatsapp") {
        window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      } else {
        window.location.href = getMailtoUrl(
          "New Project Inquiry — Ojamine",
          message
        );
      }
    }
  },
};

export function useStudioStore(): StudioState {
  return useSyncExternalStore(
    studioStore.subscribe,
    studioStore.getState,
    studioStore.getState
  );
}
