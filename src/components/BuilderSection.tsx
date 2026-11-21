"use client";

import React, { useState } from "react";
import {
  SITE_CONFIG,
  buildProjectMessage,
  getMailtoUrl,
  getWhatsAppUrl,
} from "@/config/siteConfig";
import { studioStore, useStudioStore } from "@/store/studioStore";

export function BuilderSection() {
  const {
    selectedBaseId,
    selectedExtraIds,
    hoveredBlockId,
    preferredChannel,
  } = useStudioStore();

  const [showFallbackForm, setShowFallbackForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formNeed, setFormNeed] = useState("");
  const [formTimeline, setFormTimeline] = useState("1–2 months");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const baseBlocks = SITE_CONFIG.builderBlocks.filter(
    (b) => b.category === "base"
  );
  const extraBlocks = SITE_CONFIG.builderBlocks.filter(
    (b) => b.category === "extra"
  );

  const generatedMessage = buildProjectMessage(
    selectedBaseId,
    selectedExtraIds
  );
  const whatsappUrl = getWhatsAppUrl(generatedMessage);
  const mailtoUrl = getMailtoUrl(
    "New Project Inquiry — Ojamine",
    generatedMessage
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleFallbackSubmit = (
    e: React.FormEvent,
    channel: "whatsapp" | "email"
  ) => {
    e.preventDefault();
    const lines = [
      `Hi Ojamine,`,
      formName ? `Name: ${formName}` : null,
      formContact ? `Contact: ${formContact}` : null,
      `What I need: ${formNeed || generatedMessage}`,
      formTimeline ? `Timeline: ${formTimeline}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setFormSubmitted(true);
    if (channel === "whatsapp") {
      window.open(getWhatsAppUrl(lines), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = getMailtoUrl(
        `Project Inquiry from ${formName || "Visitor"} — Ojamine`,
        lines
      );
    }
  };

  return (
    <section
      id="builder"
      aria-labelledby="builder-heading"
      className="relative z-20 flex min-h-screen w-full flex-col justify-between px-4 pt-16 pb-6 sm:px-12 lg:pt-20 pointer-events-none"
    >
      {/* Mobile top 3D interactive window so phone users can see and tap the 3D Website Blocks directly above the panel */}
      <div
        aria-hidden="true"
        className="h-[36vh] sm:h-[40vh] w-full shrink-0 lg:hidden pointer-events-none"
      />

      <div className="mx-auto w-full max-w-[1440px] lg:my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 6 columns on desktop: Unobstructed space for the 3D Website Maquette & Block Tray */}
          <div
            aria-hidden="true"
            className="hidden lg:block lg:col-span-6 pointer-events-none"
          />

          {/* Right 6 columns: Responsive Builder Panel */}
          <div className="lg:col-span-6 flex flex-col pointer-events-auto bg-paper/92 backdrop-blur-[2px] border border-ink/15 p-4 sm:p-7">
            <div className="flex items-center justify-between border-b border-ink/15 pb-3 mb-3.5">
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                <span className="h-2 w-2 bg-vermilion" />
                <span>{SITE_CONFIG.copy.builder.label}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                Tap 3D blocks or buttons
              </span>
            </div>

            <h2
              id="builder-heading"
              className="font-display text-3xl sm:text-5xl font-bold leading-[0.92] tracking-[-0.04em] text-ink mb-2"
            >
              {SITE_CONFIG.copy.builder.heading}
            </h2>

            <p className="font-sans text-xs sm:text-base text-ink-muted mb-4 sm:mb-5">
              <span className="lg:hidden">
                Tap the 3D blocks above—or toggle them below—to put your project together. Tap the orange block to send.
              </span>
              <span className="hidden lg:inline">
                {SITE_CONFIG.copy.builder.instruction}
              </span>
            </p>

            {/* 1. Base Project Type */}
            <div className="mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-2">
                1. What are we building?
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {baseBlocks.map((block) => {
                  const active = selectedBaseId === block.id;
                  const hovered = hoveredBlockId === block.id;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => studioStore.selectBaseBlock(block.id)}
                      onMouseEnter={() => studioStore.setHoveredBlock(block.id)}
                      onMouseLeave={() => studioStore.setHoveredBlock(null)}
                      className={`flex items-center justify-between border px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all ${
                        active
                          ? "border-ink bg-ink text-paper"
                          : hovered
                          ? "border-ink bg-paper-deep text-ink"
                          : "border-ink/25 bg-paper-card text-ink hover:border-ink"
                      }`}
                    >
                      <span className="font-display text-xs sm:text-base font-bold tracking-[-0.02em] truncate mr-1">
                        {block.label}
                      </span>
                      <span
                        className={`h-2 w-2 shrink-0 ${
                          active ? "bg-vermilion" : "bg-ink/20"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Extras */}
            <div className="mb-4 sm:mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted mb-2">
                2. Add what you need
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {extraBlocks.map((block) => {
                  const active = selectedExtraIds.includes(block.id);
                  const hovered = hoveredBlockId === block.id;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => studioStore.toggleExtraBlock(block.id)}
                      onMouseEnter={() => studioStore.setHoveredBlock(block.id)}
                      onMouseLeave={() => studioStore.setHoveredBlock(null)}
                      className={`flex items-center justify-between border px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all ${
                        active
                          ? "border-ink bg-ink text-paper"
                          : hovered
                          ? "border-ink bg-paper-deep text-ink"
                          : "border-ink/25 bg-paper-card text-ink hover:border-ink"
                      }`}
                    >
                      <span className="font-display text-xs sm:text-sm font-bold tracking-[-0.02em] truncate">
                        {block.label}
                      </span>
                      <span
                        className={`font-mono text-xs ml-1 shrink-0 ${
                          active ? "text-vermilion" : "text-ink-muted"
                        }`}
                      >
                        {active ? "✓" : "+"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Live Pre-filled Message */}
            <div className="border-t border-ink/15 pt-3.5 sm:pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  Your message
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-vermilion"
                >
                  {copied ? "Copied ✓" : "Copy message"}
                </button>
              </div>

              <div
                aria-live="polite"
                className="border-l-2 border-vermilion bg-paper-card px-3.5 py-2.5 sm:px-4 sm:py-3 font-sans text-xs sm:text-base leading-snug text-ink mb-3.5 sm:mb-4"
              >
                &ldquo;{generatedMessage}&rdquo;
              </div>

              {/* One-tap WhatsApp & Email Dispatch */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => {
                    studioStore.setPreferredChannel("whatsapp");
                    studioStore.setOrangeHovered(true);
                  }}
                  onMouseLeave={() => studioStore.setOrangeHovered(false)}
                  className="sm:col-span-7 flex items-center justify-between bg-vermilion px-4 py-3 sm:px-5 sm:py-3.5 text-paper transition-colors hover:bg-ink"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 bg-paper shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="font-display text-sm sm:text-base font-bold tracking-[-0.02em] leading-none">
                        Send on WhatsApp
                      </span>
                      <span className="font-mono text-[10px] opacity-90 mt-1">
                        {SITE_CONFIG.contact.whatsappDisplay}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-base">↗</span>
                </a>

                <a
                  href={mailtoUrl}
                  onMouseEnter={() => {
                    studioStore.setPreferredChannel("email");
                    studioStore.setOrangeHovered(true);
                  }}
                  onMouseLeave={() => studioStore.setOrangeHovered(false)}
                  className="sm:col-span-5 flex items-center justify-between border border-ink bg-paper-card px-4 py-3 sm:py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-display text-sm sm:text-base font-bold tracking-[-0.02em] leading-none">
                      Send via Email
                    </span>
                    <span className="font-mono text-[10px] opacity-75 mt-1 truncate max-w-[165px]">
                      {SITE_CONFIG.contact.email}
                    </span>
                  </div>
                  <span className="font-mono text-base">↗</span>
                </a>
              </div>

              {/* Calm Line */}
              <p className="mt-3 font-sans text-xs sm:text-sm leading-relaxed text-ink-muted">
                {SITE_CONFIG.copy.builder.calmLine}
              </p>

              {/* Plain Fallback Form */}
              <div className="mt-3 border-t border-ink/15 pt-2.5">
                <button
                  type="button"
                  aria-expanded={showFallbackForm}
                  onClick={() => setShowFallbackForm((v) => !v)}
                  className="flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
                >
                  <span>{SITE_CONFIG.copy.builder.fallbackToggleLabel}</span>
                  <span>{showFallbackForm ? "Hide —" : "Open +"}</span>
                </button>

                {showFallbackForm && (
                  <form
                    onSubmit={(e) => handleFallbackSubmit(e, preferredChannel)}
                    className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border border-ink/20 bg-paper p-3"
                  >
                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                        Name
                      </span>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Your name"
                        className="border border-ink/30 bg-paper-card px-2.5 py-1.5 font-sans text-sm text-ink focus:border-vermilion focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                        Email or WhatsApp
                      </span>
                      <input
                        type="text"
                        required
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder="you@domain.com"
                        className="border border-ink/30 bg-paper-card px-2.5 py-1.5 font-sans text-sm text-ink focus:border-vermilion focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                        What you need
                      </span>
                      <textarea
                        rows={2}
                        value={formNeed}
                        onChange={(e) => setFormNeed(e.target.value)}
                        placeholder={generatedMessage}
                        className="border border-ink/30 bg-paper-card px-2.5 py-1.5 font-sans text-sm text-ink focus:border-vermilion focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                        Timeline
                      </span>
                      <select
                        value={formTimeline}
                        onChange={(e) => setFormTimeline(e.target.value)}
                        className="border border-ink/30 bg-paper-card px-2.5 py-1.5 font-sans text-sm text-ink focus:border-vermilion focus:outline-none"
                      >
                        <option value="2–3 weeks">2–3 weeks</option>
                        <option value="1–2 months">1–2 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </label>

                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        onClick={() =>
                          studioStore.setPreferredChannel("whatsapp")
                        }
                        className="flex-1 bg-vermilion px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-paper hover:bg-ink"
                      >
                        WhatsApp ↗
                      </button>
                      <button
                        type="submit"
                        onClick={() => studioStore.setPreferredChannel("email")}
                        className="flex-1 border border-ink bg-ink px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-paper hover:bg-vermilion hover:border-vermilion"
                      >
                        Email ↗
                      </button>
                    </div>

                    {formSubmitted && (
                      <p className="sm:col-span-2 font-sans text-xs text-vermilion mt-1">
                        ✓ Message ready. We reply within 24 hours.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-6 w-full max-w-[1440px] border-t border-ink/15 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-ink-muted pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 bg-vermilion" />
          <span className="text-ink font-semibold">Ojamine</span>
          <span>— {SITE_CONFIG.brand.tagline}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-vermilion text-ink"
          >
            WhatsApp: {SITE_CONFIG.contact.whatsappDisplay}
          </a>
          <a href={mailtoUrl} className="hover:text-vermilion text-ink">
            {SITE_CONFIG.contact.email}
          </a>
        </div>
      </footer>
    </section>
  );
}
