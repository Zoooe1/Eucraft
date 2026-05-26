import type { CSSProperties } from "react";

type FootprintStep = {
  id: string;
  x: string;
  y: string;
  rotate: number;
  scale: number;
  opacity: number;
  color: string;
};

const leftTrail: FootprintStep[] = [
  { id: "left-1", x: "18%", y: "87%", rotate: -24, scale: 1.08, opacity: 0.92, color: "#760000" },
  { id: "left-2", x: "25%", y: "78%", rotate: -16, scale: 1.02, opacity: 0.82, color: "#783139" },
  { id: "left-3", x: "32%", y: "69%", rotate: -8, scale: 0.98, opacity: 0.72, color: "#8f4f5b" },
  { id: "left-4", x: "39%", y: "60%", rotate: 4, scale: 0.94, opacity: 0.62, color: "#b98591" },
  { id: "left-5", x: "46%", y: "53%", rotate: 13, scale: 0.92, opacity: 0.58, color: "#a56a76" },
];

const rightTrail: FootprintStep[] = [
  { id: "right-1", x: "78%", y: "18%", rotate: 152, scale: 1.08, opacity: 0.94, color: "#760000" },
  { id: "right-2", x: "72%", y: "27%", rotate: 146, scale: 1.02, opacity: 0.84, color: "#79323b" },
  { id: "right-3", x: "66%", y: "36%", rotate: 140, scale: 0.98, opacity: 0.74, color: "#8f4f5b" },
  { id: "right-4", x: "59%", y: "44%", rotate: 132, scale: 0.94, opacity: 0.64, color: "#b98591" },
  { id: "right-5", x: "52%", y: "50%", rotate: 124, scale: 0.92, opacity: 0.58, color: "#a56a76" },
];

function FootprintPair({
  step,
  index,
  delayOffset = 0,
}: {
  step: FootprintStep;
  index: number;
  delayOffset?: number;
}) {
  return (
    <div
      className="footprint-pair"
      style={
        {
          "--footprint-x": step.x,
          "--footprint-y": step.y,
          "--footprint-rotate": `${step.rotate}deg`,
          "--footprint-scale": step.scale,
          "--target-opacity": step.opacity,
          "--footprint-color": step.color,
          "--footprint-delay": `${index * 430 + delayOffset}ms`,
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
    <>
      <div className="footprint-trail left-trail" aria-hidden="true">
        {leftTrail.map((step, index) => (
          <FootprintPair key={step.id} step={step} index={index} />
        ))}
      </div>
      <div className="footprint-trail right-trail" aria-hidden="true">
        {rightTrail.map((step, index) => (
          <FootprintPair key={step.id} step={step} index={index} delayOffset={190} />
        ))}
      </div>
    </>
  );
}
