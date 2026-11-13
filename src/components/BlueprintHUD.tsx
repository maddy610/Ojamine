"use client";

import React from "react";
import { BrandMark } from "./BrandMark";
import { useStudioStore } from "@/store/studioStore";

const NAV_CHAPTERS = [
  { id: "hero", num: "01", name: "Intro" },
  { id: "services", num: "02", name: "Services" },
  { id: "craft", num: "03", name: "Craft" },
  { id: "process", num: "04", name: "Process" },
  { id: "builder", num: "05", name: "Start a project" },
];

export function BlueprintHUD() {
  const { activeChapterIndex, reducedMotion } = useStudioStore();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <>
      {/* Subtle Architectural Grid Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      >
        <div className="mx-auto h-full max-w-[1440px] px-6 sm:px-12 grid grid-cols-2 lg:grid-cols-12">
          <div className="border-l border-ink/[0.06] h-full lg:col-span-6" />
          <div className="border-l border-r border-ink/[0.06] h-full lg:col-span-6" />
        </div>
      </div>

      {/* Full-width Top Navigation Bar (prevents scrolling text from showing above/behind the header) */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3.5 sm:px-12">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            aria-label="Ojamine home"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermilion"
          >
            <BrandMark size={28} />
          </a>

          <nav
            aria-label="Page sections"
            className="flex items-center gap-1 sm:gap-2"
          >
            {NAV_CHAPTERS.map((chap, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => scrollToSection(chap.id)}
                  className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? "bg-ink text-paper font-medium"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <span
                    className={
                      isActive ? "text-vermilion mr-1" : "text-ink/40 mr-1"
                    }
                  >
                    {chap.num}
                  </span>
                  <span className="hidden sm:inline">{chap.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
