/**
 * OJAMINE — SINGLE SOURCE OF TRUTH
 * Edit contact details, website copy, builder options, and 3D scroll choreography here.
 */

export interface TimelineChapter {
  id: "hero" | "services" | "craft" | "process" | "builder";
  label: string;
  /** Normalized scroll range [start, end] from 0 to 1 */
  range: [number, number];
  /** Camera position in 3D studio units */
  cameraPos: [number, number, number];
  /** Camera target lookAt in 3D studio units */
  cameraLookAt: [number, number, number];
  /** Position of the 3D sculpture stage center so it sits cleanly in the open half of the viewport */
  stageOffset: [number, number, number];
  /** Rotation of the 3D sculpture stage */
  stageRot: [number, number, number];
  /** Uniform scale of the 3D stage */
  stageScale: number;
  /** Local position of the signature vermilion block (#E8502A) relative to the stage */
  orangeBlockPos: [number, number, number];
  /** Rotation of the signature vermilion block in radians */
  orangeBlockRot: [number, number, number];
  /** Scale of the signature vermilion block */
  orangeBlockScale: [number, number, number];
  /** How assembled the website blocks are (0 = drifting around brand mark, 1 = locked website layout) */
  assemblyFactor: number;
  /** Z-layer separation factor for the Craft section axonometric view */
  explodedFactor: number;
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  line: string;
  baseBlockId: string;
}

export interface ProcessStep {
  id: string;
  index: string;
  word: string;
  line: string;
}

export interface BuilderBlockOption {
  id: string;
  label: string;
  shortLabel: string;
  category: "base" | "extra";
  phrase: string;
  /** Local 3D block position in the Parts Tray below the frame when unselected */
  trayPos: [number, number, number];
  /** Local 3D block position inside the Website Frame when selected */
  slotPos: [number, number, number];
  /** Block size [w, h, d] */
  size: [number, number, number];
}

export const SITE_CONFIG = {
  brand: {
    name: "Ojamine",
    tagline: "Websites & Personal Portfolios",
  },

  /**
   * 1. CONTACT & CONVERSION CONFIG
   */
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "madhavivanesh@gmail.com",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9442088994",
    whatsappCountryCode: "91",
    whatsappDisplay: "+91 94420 88994",
    defaultQuickMessage:
      "Hi Ojamine, I'd like to talk about building a website.",
  },

  /**
   * 2. ALL PAGE COPY (Voice: confident, blunt, zero corporate filler)
   */
  copy: {
    hero: {
      eyebrow: "Web & Portfolio Studio",
      heading: "Websites that make people stop scrolling.",
      sub: "Ojamine builds websites and portfolios for people who'd rather be remembered than templated.",
      cta: "Start a project",
      scrollCue: "Scroll to see how it comes together",
    },

    services: {
      label: "01 / Services",
      heading: "What we build.",
      items: [
        {
          id: "business",
          index: "01",
          title: "Business websites",
          line: "Built around what makes people buy from you, stripped of every word they skip.",
          baseBlockId: "business-site",
        },
        {
          id: "portfolio",
          index: "02",
          title: "Personal portfolios",
          line: "A room of your own on the internet that proves your taste before you say a word.",
          baseBlockId: "portfolio",
        },
        {
          id: "redesign",
          index: "03",
          title: "Redesigns & landing pages",
          line: "Tear down what looks like everyone else and rebuild it around a single action.",
          baseBlockId: "redesign",
        },
      ] as ServiceItem[],
    },

    craft: {
      label: "02 / Craft",
      heading: "You're standing inside our work.",
      caption:
        "Everything on this page, the 3D, the scroll, the type, was built by us. Client projects stay confidential. Ask for a private walkthrough.",
      actionLabel: "Ask for a private walkthrough",
    },

    process: {
      label: "03 / Process",
      heading: "Brief. Design. Build. Launch.",
      steps: [
        {
          id: "brief",
          index: "01",
          word: "Brief.",
          line: "One sharp conversation to find the hook and cut everything you don't need.",
        },
        {
          id: "design",
          index: "02",
          word: "Design.",
          line: "Type, proportion, and motion worked out directly in the browser, not buried in slide decks.",
        },
        {
          id: "build",
          index: "03",
          word: "Build.",
          line: "Clean code, real 60fps 3D, and tactile details tuned until every interaction clicks.",
        },
        {
          id: "launch",
          index: "04",
          word: "Launch.",
          line: "Deployed, fast on every screen, and handed over ready to bring in work.",
        },
      ] as ProcessStep[],
    },

    builder: {
      label: "04 / Start a project",
      heading: "Build your site.",
      instruction:
        "Click the 3D blocks on the left—or toggle them below—to put your project together. Click the orange block to send.",
      calmLine:
        "No pricing page. Every project is quoted for what it actually is. Usually within 24 hours.",
      fallbackToggleLabel: "Prefer a plain form? Fill in your details",
    },
  },

  /**
   * 3. INTERACTIVE "BUILD YOUR SITE" BLOCK OPTIONS
   */
  builderBlocks: [
    // Base project types (displayed on the main Hero Banner block at the top of the 3D website)
    {
      id: "business-site",
      label: "Business site",
      shortLabel: "BUSINESS SITE",
      category: "base",
      phrase: "a business site",
      trayPos: [-0.4, 0.52, 0.14],
      slotPos: [-0.4, 0.52, 0.14],
      size: [2.08, 0.48, 0.14],
    },
    {
      id: "portfolio",
      label: "Portfolio",
      shortLabel: "PORTFOLIO",
      category: "base",
      phrase: "a personal portfolio",
      trayPos: [-0.4, 0.52, 0.14],
      slotPos: [-0.4, 0.52, 0.14],
      size: [2.08, 0.48, 0.14],
    },
    {
      id: "redesign",
      label: "Redesign",
      shortLabel: "REDESIGN",
      category: "base",
      phrase: "a redesign",
      trayPos: [-0.4, 0.52, 0.14],
      slotPos: [-0.4, 0.52, 0.14],
      size: [2.08, 0.48, 0.14],
    },
    // Extra modules (each has its own dedicated slot on the 3D website and in the 4-slot tray below)
    {
      id: "3d",
      label: "3D animation",
      shortLabel: "3D ANIMATION",
      category: "extra",
      phrase: "3D animation",
      trayPos: [-1.29, -1.58, 0.18],
      slotPos: [-0.98, -0.1, 0.14],
      size: [0.92, 0.48, 0.14],
    },
    {
      id: "animations",
      label: "Scroll animations",
      shortLabel: "ANIMATIONS",
      category: "extra",
      phrase: "scroll animations",
      trayPos: [-0.43, -1.58, 0.18],
      slotPos: [0.0, -0.1, 0.14],
      size: [0.92, 0.48, 0.14],
    },
    {
      id: "ecommerce",
      label: "E-commerce",
      shortLabel: "E-COMMERCE",
      category: "extra",
      phrase: "e-commerce",
      trayPos: [0.43, -1.58, 0.18],
      slotPos: [0.98, -0.1, 0.14],
      size: [0.92, 0.48, 0.14],
    },
    {
      id: "copy-direction",
      label: "Copy & direction",
      shortLabel: "COPY & DIRECTION",
      category: "extra",
      phrase: "custom copy and direction",
      trayPos: [1.29, -1.58, 0.18],
      slotPos: [-0.4, -0.7, 0.14],
      size: [2.08, 0.36, 0.14],
    },
  ] as BuilderBlockOption[],

  /**
   * 4. 3D SCROLL TIMELINE CHOREOGRAPHY
   * Keeps the 3D Website Maquette strictly inside its open 50% column so it never clips under HTML panels.
   */
  timeline: [
    {
      id: "hero",
      label: "01 / Intro",
      range: [0.0, 0.2],
      cameraPos: [0.0, 0.35, 8.0],
      cameraLookAt: [0.0, 0.0, 0.0],
      stageOffset: [2.3, 0.1, 0.0],
      stageRot: [0.08, -0.24, 0.0],
      stageScale: 0.92,
      orangeBlockPos: [1.14, 1.14, 0.18],
      orangeBlockRot: [0.16, -0.24, 0.08],
      orangeBlockScale: [0.54, 0.54, 0.28],
      assemblyFactor: 0.0,
      explodedFactor: 0.0,
    },
    {
      id: "services",
      label: "02 / Services",
      range: [0.2, 0.45],
      cameraPos: [0.0, 0.35, 8.0],
      cameraLookAt: [0.0, 0.0, 0.0],
      stageOffset: [-2.3, 0.08, 0.0],
      stageRot: [0.08, 0.24, 0.0],
      stageScale: 0.9,
      orangeBlockPos: [1.06, 0.52, 0.18],
      orangeBlockRot: [0.0, 0.0, 0.0],
      orangeBlockScale: [0.72, 0.48, 0.2],
      assemblyFactor: 1.0,
      explodedFactor: 0.0,
    },
    {
      id: "craft",
      label: "03 / Craft",
      range: [0.45, 0.68],
      cameraPos: [0.0, 0.45, 7.9],
      cameraLookAt: [0.0, 0.0, 0.0],
      stageOffset: [2.25, 0.08, 0.0],
      stageRot: [0.2, -0.44, 0.02],
      stageScale: 0.88,
      orangeBlockPos: [1.06, 0.52, 0.62],
      orangeBlockRot: [0.1, -0.18, 0.06],
      orangeBlockScale: [0.72, 0.48, 0.22],
      assemblyFactor: 1.0,
      explodedFactor: 1.0,
    },
    {
      id: "process",
      label: "04 / Process",
      range: [0.68, 0.85],
      cameraPos: [0.0, 0.35, 8.0],
      cameraLookAt: [0.0, 0.0, 0.0],
      stageOffset: [-2.3, 0.08, 0.0],
      stageRot: [0.1, 0.22, 0.0],
      stageScale: 0.9,
      orangeBlockPos: [1.06, 0.52, 0.2],
      orangeBlockRot: [0.0, 0.0, 0.0],
      orangeBlockScale: [0.72, 0.48, 0.2],
      assemblyFactor: 1.0,
      explodedFactor: 0.12,
    },
    {
      id: "builder",
      label: "05 / Build your site",
      range: [0.85, 1.0],
      cameraPos: [0.0, 0.05, 8.0],
      cameraLookAt: [0.0, -0.1, 0.0],
      stageOffset: [-2.35, 0.18, 0.0],
      stageRot: [0.04, 0.12, 0.0],
      stageScale: 0.86,
      // In Builder, Orange Block docks into the bottom-right CTA slot as the physical "SEND" button
      orangeBlockPos: [1.06, -0.7, 0.2],
      orangeBlockRot: [0.0, 0.0, 0.0],
      orangeBlockScale: [0.72, 0.36, 0.22],
      assemblyFactor: 1.0,
      explodedFactor: 0.0,
    },
  ] as TimelineChapter[],
};

/**
 * Helper to generate the live pre-filled message from selected builder blocks
 */
export function buildProjectMessage(
  selectedBaseId: string,
  selectedExtraIds: string[]
): string {
  const baseBlock = SITE_CONFIG.builderBlocks.find(
    (b) => b.id === selectedBaseId && b.category === "base"
  );
  const extraBlocks = SITE_CONFIG.builderBlocks.filter(
    (b) => selectedExtraIds.includes(b.id) && b.category === "extra"
  );

  const basePhrase = baseBlock ? baseBlock.phrase : "a website";

  if (extraBlocks.length === 0) {
    return `Hi Ojamine, I need ${basePhrase}. When can we talk?`;
  }

  const extraPhrases = extraBlocks.map((b) => b.phrase);
  let extrasJoined = "";
  if (extraPhrases.length === 1) {
    extrasJoined = extraPhrases[0];
  } else if (extraPhrases.length === 2) {
    extrasJoined = `${extraPhrases[0]} and ${extraPhrases[1]}`;
  } else {
    extrasJoined = `${extraPhrases.slice(0, -1).join(", ")}, and ${
      extraPhrases[extraPhrases.length - 1]
    }`;
  }

  return `Hi Ojamine, I need ${basePhrase} with ${extrasJoined}. When can we talk?`;
}

/**
 * Helper to build a direct WhatsApp deep link using the configured number
 */
export function getWhatsAppUrl(message: string): string {
  const raw = SITE_CONFIG.contact.whatsappNumber.replace(/\D/g, "");
  const fullNumber =
    raw.length === 10
      ? `${SITE_CONFIG.contact.whatsappCountryCode}${raw}`
      : raw;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Helper to build a direct mailto link using the configured email
 */
export function getMailtoUrl(subject: string, body: string): string {
  return `mailto:${SITE_CONFIG.contact.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
