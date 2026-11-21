"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  SITE_CONFIG,
  getMailtoUrl,
  getWhatsAppUrl,
} from "@/config/siteConfig";
import {
  studioStore,
  useStudioStore,
  motionState,
} from "@/store/studioStore";
import { BlueprintHUD } from "./BlueprintHUD";
import { PersistentCTA } from "./PersistentCTA";
import { StudioLoader } from "./StudioLoader";
import { BuilderSection } from "./BuilderSection";

const StudioCanvas = dynamic(() => import("./scene/StudioCanvas"), {
  ssr: false,
});

export function StudioExperience() {
  const mainRef = useRef<HTMLElement>(null);
  const { hoveredServiceIndex, hoveredProcessIndex, reducedMotion } =
    useStudioStore();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const checkDevice = () => {
      const isMob = window.innerWidth < 1024;
      studioStore.setDeviceFlags(mediaQuery.matches, isMob);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);

    let lenis: Lenis | null = null;
    let updateLenis: ((time: number) => void) | null = null;

    if (!mediaQuery.matches) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });

      lenis.on("scroll", (e: { progress: number; velocity: number }) => {
        ScrollTrigger.update();
        studioStore.setScroll(e.progress, e.velocity);
      });

      updateLenis = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    } else {
      const onNativeScroll = () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        studioStore.setScroll(progress, 0);
      };
      window.addEventListener("scroll", onNativeScroll, { passive: true });
    }

    const masterST = ScrollTrigger.create({
      trigger: mainRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        studioStore.setScroll(self.progress, self.getVelocity() * 0.01);
      },
    });

    const ctx = gsap.context(() => {
      gsap.from(".hero-line-inner", {
        yPercent: 105,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.15,
      });

      const groups = gsap.utils.toArray<HTMLElement>(".scroll-reveal-group");
      groups.forEach((group) => {
        const lines = group.querySelectorAll(".scroll-line-inner");
        if (lines.length > 0) {
          gsap.from(lines, {
            yPercent: 105,
            duration: 1.05,
            stagger: 0.07,
            ease: "expo.out",
            scrollTrigger: {
              trigger: group,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
        }
      });

      const rows = gsap.utils.toArray<HTMLElement>(".arch-row");
      rows.forEach((row) => {
        gsap.from(row, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    }, mainRef);

    const onPointerMove = (e: MouseEvent) => {
      motionState.targetPointerX = (e.clientX / window.innerWidth) * 2 - 1;
      motionState.targetPointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", onPointerMove);
      masterST.kill();
      ctx.revert();
      if (updateLenis) {
        gsap.ticker.remove(updateLenis);
      }
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  const scrollToBuilderWithPreset = (baseId?: string) => {
    if (baseId) {
      studioStore.selectBaseBlock(baseId);
    }
    const el = document.getElementById("builder");
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  const walkthroughMessage =
    "Hi Ojamine, I'd like to ask for a private walkthrough of your work and discuss a project.";

  return (
    <div className="relative min-h-screen bg-paper text-ink selection:bg-vermilion selection:text-paper">
      <StudioLoader />
      <StudioCanvas />
      <BlueprintHUD />
      <PersistentCTA />

      <main ref={mainRef} className="relative z-20 pointer-events-none">
        {/* =========================================================
            SECTION 01: HERO
            Desktop: Left 6 cols Copy / Right 6 cols 3D
            Mobile: Top 36vh open for 3D Brand Mark / Bottom Copy
        ========================================================= */}
        <section
          id="hero"
          aria-labelledby="hero-heading"
          className="relative flex min-h-screen w-full flex-col justify-between px-4 pt-16 pb-8 sm:px-12 lg:pt-24 lg:pb-10 pointer-events-none"
        >
          {/* Mobile top 3D stage window so the 3D Brand Mark sits cleanly above the headline */}
          <div
            aria-hidden="true"
            className="h-[34vh] sm:h-[38vh] w-full shrink-0 lg:hidden pointer-events-none"
          />

          <div className="mx-auto w-full max-w-[1440px] lg:my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-6 bg-paper/90 lg:bg-transparent backdrop-blur-[2px] lg:backdrop-blur-none border border-ink/15 lg:border-0 p-5 sm:p-7 lg:p-0">
                <div className="mb-3 sm:mb-5 flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                  <span className="inline-block h-2 w-2 bg-vermilion" />
                  <span>{SITE_CONFIG.copy.hero.eyebrow}</span>
                </div>

                <h1
                  id="hero-heading"
                  className="font-display text-[clamp(2.5rem,8.4vw,8.6rem)] font-bold leading-[0.9] tracking-[-0.04em] text-ink"
                >
                  <span className="block overflow-hidden pb-1">
                    <span className="hero-line-inner block">
                      Websites that
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-1">
                    <span className="hero-line-inner block">
                      make people
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-1.5">
                    <span className="hero-line-inner block">
                      stop{" "}
                      <span className="text-vermilion">scrolling.</span>
                    </span>
                  </span>
                </h1>

                <p className="mt-4 sm:mt-7 max-w-lg font-sans text-base sm:text-xl font-normal leading-snug text-ink-muted">
                  {SITE_CONFIG.copy.hero.sub}
                </p>

                <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => scrollToBuilderWithPreset()}
                    className="group inline-flex items-center gap-3 sm:gap-4 bg-ink px-5 py-3.5 sm:px-7 sm:py-4 text-paper transition-colors hover:bg-vermilion"
                  >
                    <span className="inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 bg-vermilion transition-transform duration-300 group-hover:rotate-45 group-hover:bg-paper" />
                    <span className="font-display text-sm sm:text-lg font-bold tracking-[-0.02em]">
                      {SITE_CONFIG.copy.hero.cta}
                    </span>
                    <span className="font-mono text-xs opacity-70">↓</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(
                      SITE_CONFIG.contact.defaultQuickMessage
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-ink/30 bg-paper/80 px-4 py-3.5 sm:px-5 sm:py-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    WhatsApp Direct ↗
                  </a>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="hidden lg:block lg:col-span-6 min-h-[460px] pointer-events-none"
              />
            </div>
          </div>

          <div className="mx-auto mt-6 lg:mt-8 flex w-full max-w-[1440px] items-center justify-between border-t border-ink/15 pt-3 sm:pt-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            <span>{SITE_CONFIG.copy.hero.scrollCue} ↓</span>
          </div>
        </section>

        {/* =========================================================
            SECTION 02: SERVICES
        ========================================================= */}
        <section
          id="services"
          aria-labelledby="services-heading"
          className="relative flex min-h-screen w-full flex-col lg:flex-row lg:items-center px-4 py-16 sm:px-12 lg:py-24 pointer-events-none"
        >
          {/* Mobile top 3D stage window */}
          <div
            aria-hidden="true"
            className="h-[34vh] sm:h-[38vh] w-full shrink-0 lg:hidden pointer-events-none"
          />

          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div
                aria-hidden="true"
                className="hidden lg:block lg:col-span-6 min-h-[480px] pointer-events-none"
              />

              <div className="lg:col-span-6 pointer-events-auto bg-paper/92 backdrop-blur-[2px] p-5 sm:p-9 border border-ink/15">
                <div className="flex items-center gap-2 border-b border-ink/15 pb-3 mb-5 sm:mb-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                  <span className="h-2 w-2 bg-vermilion" />
                  <span>{SITE_CONFIG.copy.services.label}</span>
                </div>

                <h2
                  id="services-heading"
                  className="scroll-reveal-group font-display text-4xl sm:text-6xl font-bold leading-[0.9] tracking-[-0.04em] text-ink mb-6 sm:mb-8"
                >
                  <span className="block overflow-hidden pb-1">
                    <span className="scroll-line-inner block">
                      {SITE_CONFIG.copy.services.heading}
                    </span>
                  </span>
                </h2>

                <div className="divide-y divide-ink/15 border-t border-b border-ink/15">
                  {SITE_CONFIG.copy.services.items.map((service, idx) => {
                    const isHovered = hoveredServiceIndex === idx;

                    return (
                      <article
                        key={service.id}
                        onMouseEnter={() => studioStore.setHoveredService(idx)}
                        onMouseLeave={() => studioStore.setHoveredService(null)}
                        className="arch-row group py-5 sm:py-6 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1">
                          <span
                            className={`h-2 w-2 transition-colors ${
                              isHovered ? "bg-vermilion" : "bg-ink/25"
                            }`}
                          />
                          <span>{service.index}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-4">
                          <div>
                            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-ink group-hover:text-vermilion transition-colors">
                              {service.title}
                            </h3>
                            <p className="mt-1 font-sans text-sm sm:text-base text-ink-muted max-w-md">
                              {service.line}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              scrollToBuilderWithPreset(service.baseBlockId)
                            }
                            className="self-start sm:self-auto shrink-0 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-ink hover:text-vermilion underline underline-offset-4"
                          >
                            Start with this ↓
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 03: CRAFT
        ========================================================= */}
        <section
          id="craft"
          aria-labelledby="craft-heading"
          className="relative flex min-h-screen w-full flex-col lg:flex-row lg:items-center px-4 py-16 sm:px-12 lg:py-24 pointer-events-none"
        >
          {/* Mobile top 3D stage window */}
          <div
            aria-hidden="true"
            className="h-[34vh] sm:h-[38vh] w-full shrink-0 lg:hidden pointer-events-none"
          />

          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 pointer-events-auto bg-paper/92 backdrop-blur-[2px] p-5 sm:p-9 border border-ink/15">
                <div className="flex items-center gap-2 border-b border-ink/15 pb-3 mb-5 sm:mb-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                  <span className="h-2 w-2 bg-vermilion" />
                  <span>{SITE_CONFIG.copy.craft.label}</span>
                </div>

                <h2
                  id="craft-heading"
                  className="scroll-reveal-group font-display text-[clamp(2.3rem,5.8vw,5.6rem)] font-bold leading-[0.9] tracking-[-0.04em] text-ink mb-5 sm:mb-6"
                >
                  <span className="block overflow-hidden pb-1.5">
                    <span className="scroll-line-inner block">
                      {SITE_CONFIG.copy.craft.heading}
                    </span>
                  </span>
                </h2>

                <p className="font-sans text-base sm:text-xl leading-relaxed text-ink-muted max-w-xl mb-6 sm:mb-8">
                  {SITE_CONFIG.copy.craft.caption}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t border-ink/15 pt-5 sm:pt-6">
                  <a
                    href={getWhatsAppUrl(walkthroughMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-vermilion px-5 py-3.5 sm:px-6 sm:py-4 font-display text-sm sm:text-base font-bold tracking-tight text-paper transition-colors hover:bg-ink"
                  >
                    <span className="h-2.5 w-2.5 bg-paper" />
                    <span>{SITE_CONFIG.copy.craft.actionLabel} ↗</span>
                  </a>

                  <a
                    href={getMailtoUrl(
                      "Private Walkthrough Request — Ojamine",
                      walkthroughMessage
                    )}
                    className="border border-ink/30 bg-paper px-4 py-3.5 sm:px-5 sm:py-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    Ask via Email ↗
                  </a>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="hidden lg:block lg:col-span-6 min-h-[480px] pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 04: PROCESS
        ========================================================= */}
        <section
          id="process"
          aria-labelledby="process-heading"
          className="relative flex min-h-screen w-full flex-col lg:flex-row lg:items-center px-4 py-16 sm:px-12 lg:py-24 pointer-events-none"
        >
          {/* Mobile top 3D stage window */}
          <div
            aria-hidden="true"
            className="h-[34vh] sm:h-[38vh] w-full shrink-0 lg:hidden pointer-events-none"
          />

          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div
                aria-hidden="true"
                className="hidden lg:block lg:col-span-6 min-h-[480px] pointer-events-none"
              />

              <div className="lg:col-span-6 pointer-events-auto bg-paper/92 backdrop-blur-[2px] p-5 sm:p-9 border border-ink/15">
                <div className="flex items-center gap-2 border-b border-ink/15 pb-3 mb-5 sm:mb-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                  <span className="h-2 w-2 bg-vermilion" />
                  <span>{SITE_CONFIG.copy.process.label}</span>
                </div>

                <h2
                  id="process-heading"
                  className="scroll-reveal-group font-display text-4xl sm:text-6xl font-bold leading-[0.9] tracking-[-0.04em] text-ink mb-6 sm:mb-8"
                >
                  <span className="block overflow-hidden pb-1">
                    <span className="scroll-line-inner block">
                      {SITE_CONFIG.copy.process.heading}
                    </span>
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-ink/15">
                  {SITE_CONFIG.copy.process.steps.map((step, idx) => {
                    const isHovered = hoveredProcessIndex === idx;
                    return (
                      <div
                        key={step.id}
                        onMouseEnter={() => studioStore.setHoveredProcess(idx)}
                        onMouseLeave={() => studioStore.setHoveredProcess(null)}
                        className={`arch-row border-r border-b border-ink/15 p-4 sm:p-6 transition-colors ${
                          isHovered ? "bg-paper-deep/60" : "bg-transparent"
                        }`}
                      >
                        <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-vermilion font-semibold mb-2">
                          {step.index}
                        </div>

                        <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-[-0.04em] text-ink mb-1.5">
                          {step.word}
                        </h3>

                        <p className="font-sans text-sm sm:text-base leading-snug text-ink-muted">
                          {step.line}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 05: INTERACTIVE "BUILD YOUR SITE" CONVERSION FINALE
        ========================================================= */}
        <BuilderSection />
      </main>
    </div>
  );
}
