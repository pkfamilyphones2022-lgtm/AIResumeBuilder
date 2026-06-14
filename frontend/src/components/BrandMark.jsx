/* Reusable brand mark — the gradient square with the white "R" inside.
 *
 * The "R" is drawn as an SVG path (not a text character) to eliminate font
 * dependencies. The previous text-based version could render thin/invisible
 * if Space Grotesk hadn't loaded and the fallback font's geometry didn't
 * contrast against the teal-to-warm gradient.
 *
 * Sized via the .brand-mark CSS rule (42x42 default, 46x46 on builder /
 * footer). The SVG fills 60% of the container and inherits currentColor.
 */
import React from "react";

export default function BrandMark({ className = "brand-mark" }) {
  return (
    <span className={className} role="img" aria-label="ResumeAlignAI">
      <svg
        viewBox="0 0 64 64"
        width="60%"
        height="60%"
        aria-hidden="true"
        focusable="false"
        style={{ display: "block" }}
      >
        <path
          d="M 18 14 L 36 14 C 44 14 48 19 48 25 C 48 29 45 33 41 34 L 50 50 L 41 50 L 33 36 L 27 36 L 27 50 L 18 50 Z M 27 22 L 27 28 L 34 28 C 37 28 39 27 39 25 C 39 23 37 22 34 22 Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
}
