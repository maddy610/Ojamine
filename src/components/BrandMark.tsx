"use client";

import React from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  animatedBlock?: boolean;
}

/**
 * Ojamine Brand Mark:
 * A rounded-square ink frame with an architectural corner gap,
 * and a solid vermilion (#E8502A) square block resting inside the gap.
 */
export function BrandMark({
  size = 34,
  className = "",
  showWordmark = true,
  animatedBlock = true,
}: BrandMarkProps) {
  return (
    <div
      className={`group inline-flex items-center gap-3 select-none ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        {/* Rounded-square frame with a top-right architectural gap */}
        <path
          d="M 22 5 H 12 C 8.134 5 5 8.134 5 12 V 28 C 5 31.866 8.134 35 12 35 H 28 C 31.866 35 35 31.866 35 28 V 18"
          stroke="#0E0D0B"
          strokeWidth="3.5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        {/* Subtle blueprint crosshair inside the frame */}
        <path
          d="M 13 20 H 21 M 17 16 V 24"
          stroke="#0E0D0B"
          strokeWidth="1.2"
          strokeOpacity="0.28"
        />
        {/* Solid vermilion square block sitting in the gap */}
        <rect
          x="24.5"
          y="4.5"
          width="11"
          height="11"
          rx="1.5"
          fill="#E8502A"
          className={
            animatedBlock
              ? "origin-[30px_10px] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:rotate-12"
              : ""
          }
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
            OJAMINE
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-muted mt-0.5">
            WEB &amp; PORTFOLIO STUDIO
          </span>
        </div>
      )}
    </div>
  );
}

