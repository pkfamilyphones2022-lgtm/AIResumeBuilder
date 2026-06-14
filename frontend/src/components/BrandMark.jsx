/* Reusable brand mark — gradient square with the white "R" inside.
 *
 * Rendered as a complete SVG (gradient backdrop + shine overlay + R path)
 * so it matches the favicon (frontend/public/favicon.svg) byte-for-byte
 * visually at any size. CSS only handles the square's outer dimensions.
 *
 * useId() gives every instance unique gradient defs IDs — multiple
 * BrandMark instances on the same page won't fight over a shared id.
 */
import React, { useId } from "react";

export default function BrandMark({ className = "brand-mark" }) {
  const id = useId();
  const bgId = `bm-bg-${id}`;
  const shineId = `bm-shine-${id}`;

  return (
    <span className={className} role="img" aria-label="ResumeAlignAI">
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        aria-hidden="true"
        focusable="false"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={bgId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="55%" stopColor="#1f9d8f" />
            <stop offset="100%" stopColor="#d99152" />
          </linearGradient>
          <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill={`url(#${bgId})`} />
        <rect width="64" height="64" rx="14" fill={`url(#${shineId})`} />
        <path
          d="M 18 14 L 36 14 C 44 14 48 19 48 25 C 48 29 45 33 41 34 L 50 50 L 41 50 L 33 36 L 27 36 L 27 50 L 18 50 Z M 27 22 L 27 28 L 34 28 C 37 28 39 27 39 25 C 39 23 37 22 34 22 Z"
          fill="#ffffff"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
}
