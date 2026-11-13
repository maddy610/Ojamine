# Ojamine — Scroll-Driven 3D Studio Website

A light-first, architectural scroll-driven 3D website for **Ojamine**, built with Next.js (App Router), TypeScript, Tailwind CSS, React Three Fiber + drei, GSAP + ScrollTrigger, and Lenis.

## Art Direction & Palette

- **Bone Paper Background**: `#EDE5D3` (`#F4EFE2` card stock, `#E2D8C1` deep paper)
- **Architectural Ink**: `#0E0D0B`
- **Signal Vermilion**: `#E8502A`
- **Materials & Lighting**: Matte paper and painted wood blocks under a warm directional studio lamp with real shadows—no dark-mode purple/blue glow, no glassmorphism, no gradients.

## Single Place to Edit Copy, Scroll Timeline & Contact Details

All copy, WhatsApp number, email address, builder blocks, and 3D camera/block keyframes live in:

- [`src/config/siteConfig.ts`](./src/config/siteConfig.ts)

### Quick Edits in `src/config/siteConfig.ts`:
1. **Contact Details (`SITE_CONFIG.contact`)**:
   - Configure studio `email` and `whatsappNumber` (or set `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`).
2. **All Copy (`SITE_CONFIG.copy`)**:
   - `hero`, `services` (3 modules), `craft`, `process` (4 steps), and `builder`.
3. **Interactive Builder Blocks (`SITE_CONFIG.builderBlocks`)**:
   - Base project blocks (`business-site`, `portfolio`, `redesign`) and extras (`3d`, `animations`, `ecommerce`, `copy-direction`), including their 3D tray coordinates (`trayPos`) and assembled maquette coordinates (`slotPos`).
4. **3D Scroll Timeline (`SITE_CONFIG.timeline`)**:
   - Camera position (`cameraPos`), camera target (`cameraLookAt`), signature orange block position/rotation/scale (`orangeBlockPos`, `orangeBlockRot`, `orangeBlockScale`), `assemblyFactor`, and `explodedFactor` for each of the 5 chapters.

## File Structure

```text
src/
├── app/
│   ├── globals.css            # Paper palette, Lenis rules, subtle tactile grain
│   ├── icon.tsx               # Dynamic brand mark favicon
│   ├── layout.tsx             # Fonts (Space Grotesk, Inter, IBM Plex Mono) & SEO metadata
│   ├── opengraph-image.tsx    # Dynamic 1200×630 Open Graph card
│   └── page.tsx               # Entry route rendering StudioExperience
├── components/
│   ├── scene/
│   │   ├── StudioCanvas.tsx   # R3F Canvas (DPR cap [1,2], offscreen pause, shadows)
│   │   └── StudioScene.tsx    # 3D architectural blocks, damped camera, Orange Block
│   ├── BlueprintHUD.tsx       # Architectural grid lines, coordinates & top nav
│   ├── BrandMark.tsx          # Rounded-square ink frame with gap + vermilion block
│   ├── BuilderSection.tsx     # "Build your site" 3D/HTML configurator + fallback form
│   ├── PersistentCTA.tsx      # Magnetic corner "Start a project" button (WhatsApp + Email)
│   ├── StudioExperience.tsx   # Lenis + GSAP ScrollTrigger + 5 narrative sections
│   └── StudioLoader.tsx       # Minimal branded studio loader
├── config/
│   └── siteConfig.ts          # Single source of truth for timeline, copy & WhatsApp/email
└── store/
    └── studioStore.ts         # Shared 60fps scroll & interactive builder store
```

## Running Locally

```bash
npm install
npm run dev
```

