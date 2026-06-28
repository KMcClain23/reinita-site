type Variant = "light" | "dark";

interface WaveDividerProps {
  variant?: Variant;
  className?: string;
}

/**
 * Soft sea-green wave that flows between sections.
 *
 * The path extends well beyond the SVG viewBox on both sides — the
 * ScrollReveal component updates a `--wave-shift` CSS variable as the
 * user scrolls, translating the path horizontally. Because each
 * wavelength is 32px, modulo math keeps the loop seamless: when the
 * shift wraps from -32 back to 0, the visible pattern is identical, so
 * the user sees a continuous flowing wave instead of a snap.
 */
export function WaveDivider({ variant = "light", className = "" }: WaveDividerProps) {
  const stroke = variant === "dark" ? "var(--color-mist)" : "var(--color-kelp)";
  const opacity = variant === "dark" ? 0.45 : 0.6;

  return (
    <div
      aria-hidden="true"
      data-reveal
      className={`flex justify-center py-4 ${className}`}
    >
      <svg
        width="240"
        height="32"
        viewBox="0 0 240 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -60 16 Q -44 4, -28 16 T 4 16 T 36 16 T 68 16 T 100 16 T 132 16 T 164 16 T 196 16 T 228 16 T 260 16 T 292 16"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity={opacity}
          className="reveal-stroke wave-flow"
        />
      </svg>
    </div>
  );
}
