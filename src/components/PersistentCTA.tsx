"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  SITE_CONFIG,
  buildProjectMessage,
  getMailtoUrl,
  getWhatsAppUrl,
} from "@/config/siteConfig";
import { useStudioStore } from "@/store/studioStore";

export function PersistentCTA() {
  const { selectedBaseId, selectedExtraIds, activeChapterIndex, reducedMotion } =
    useStudioStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const liveMessage = buildProjectMessage(selectedBaseId, selectedExtraIds);
  const whatsappHref = getWhatsAppUrl(liveMessage);
  const emailHref = getMailtoUrl("Project Inquiry — Ojamine", liveMessage);

  useEffect(() => {
    if (reducedMotion) return;
    const el = buttonRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", {
      duration: 0.45,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.45,
      ease: "power3.out",
    });

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * 0.24);
      yTo(relY * 0.24);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close menu when reaching the final Builder section
  useEffect(() => {
    if (activeChapterIndex === 4) {
      setMenuOpen(false);
    }
  }, [activeChapterIndex]);

  const scrollToBuilder = () => {
    setMenuOpen(false);
    const target = document.getElementById("builder");
    if (target) {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  // Hide the corner button when the user is already inside the "Build your site" finale
  if (activeChapterIndex === 4) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 sm:bottom-8 sm:right-10">
      {menuOpen && (
        <div
          role="dialog"
          aria-label="Start a project contact options"
          className="w-[290px] sm:w-[320px] border border-ink bg-paper-card p-5 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-ink/15 pb-2.5 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Start a project
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:text-ink"
              aria-label="Close contact options"
            >
              Close
            </button>
          </div>

          <p className="font-sans text-xs leading-relaxed text-ink mb-4 border-l-2 border-vermilion pl-3 py-0.5">
            &ldquo;{liveMessage}&rdquo;
          </p>

          <div className="flex flex-col gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-vermilion px-4 py-2.5 text-paper font-display text-sm font-semibold tracking-tight transition-colors hover:bg-ink"
            >
              <span>WhatsApp Direct</span>
              <span className="font-mono text-[10px] tracking-wider opacity-90">
                {SITE_CONFIG.contact.whatsappDisplay} ↗
              </span>
            </a>

            <a
              href={emailHref}
              className="flex items-center justify-between border border-ink/30 bg-paper px-4 py-2.5 text-ink font-display text-sm font-semibold tracking-tight transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <span>Email</span>
              <span className="font-mono text-[10px] tracking-wider opacity-75">
                {SITE_CONFIG.contact.email} ↗
              </span>
            </a>

            <button
              type="button"
              onClick={scrollToBuilder}
              className="mt-1 flex items-center justify-between pt-2 border-t border-ink/10 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-vermilion"
            >
              <span>Build your site in 3D</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="group flex items-center gap-3 border border-ink bg-ink px-5 py-3.5 text-paper transition-colors hover:bg-vermilion hover:border-vermilion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
      >
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 bg-vermilion transition-transform duration-300 group-hover:rotate-45 group-hover:bg-paper"
        />
        <span className="font-display text-sm font-bold tracking-[-0.02em]">
          {SITE_CONFIG.copy.hero.cta}
        </span>
      </button>
    </div>
  );
}
