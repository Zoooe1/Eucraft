import type { CSSProperties } from "react";

const steps = [
  { x: 22, y: 102, rotate: -72, scale: 1.18, opacity: 0.98, color: "#760000" },
  { x: 29, y: 92, rotate: -56, scale: 1.08, opacity: 0.9, color: "#662027" },
  { x: 36, y: 82, rotate: -28, scale: 1.02, opacity: 0.78, color: "#8d3f4b" },
  { x: 43, y: 72, rotate: -4, scale: 0.98, opacity: 0.64, color: "#b4808d" },
  { x: 51, y: 63, rotate: 22, scale: 0.96, opacity: 0.68, color: "#b4808d" },
  { x: 61, y: 53, rotate: 14, scale: 0.98, opacity: 0.72, color: "#a46370" },
  { x: 68, y: 43, rotate: -12, scale: 1.02, opacity: 0.8, color: "#8e4550" },
  { x: 75, y: 32, rotate: -46, scale: 1.06, opacity: 0.9, color: "#74303a" },
  { x: 82, y: 20, rotate: -66, scale: 1.12, opacity: 0.98, color: "#6f0000" },
  { x: 87, y: 10, rotate: -62, scale: 1.06, opacity: 0.98, color: "#760000" },
];

function FootprintPair({
  x,
  y,
  rotate,
  scale,
  opacity,
  color,
  index,
}: (typeof steps)[number] & { index: number }) {
  return (
    <div
      className="footprint-pair"
      style={
        {
          "--footprint-x": `${x}%`,
          "--footprint-y": `${y}%`,
          "--footprint-rotate": `${rotate}deg`,
          "--footprint-scale": scale,
          "--target-opacity": opacity,
          "--footprint-color": color,
          "--footprint-delay": `${index * 430}ms`,
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 142 108" aria-hidden="true">
        <g className="footprint-left" transform="translate(18 22) rotate(-16)">
          <ellipse cx="28" cy="44" rx="20" ry="34" />
          <ellipse cx="28" cy="10" rx="14" ry="9" />
          <rect x="12" y="29" width="34" height="10" rx="5" />
        </g>
        <g className="footprint-right" transform="translate(82 6) rotate(20)">
          <ellipse cx="28" cy="44" rx="20" ry="34" />
          <ellipse cx="28" cy="10" rx="14" ry="9" />
          <rect x="12" y="29" width="34" height="10" rx="5" />
        </g>
      </svg>
    </div>
  );
}

export function FootprintTrail() {
  return (
    <div className="footprint-trail" aria-hidden="true">
      {steps.map((step, index) => (
        <FootprintPair key={`${step.x}-${step.y}`} {...step} index={index} />
      ))}
    </div>
  );
}
