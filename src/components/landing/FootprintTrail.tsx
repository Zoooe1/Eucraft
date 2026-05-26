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
  { id: "left-1", x: "18%", y: "87%", rotate: -24, scale: 1.08, opacity: 0.92, color: "#7a0000" },
  { id: "left-2", x: "25%", y: "78%", rotate: -16, scale: 1.02, opacity: 0.82, color: "#6b2528" },
  { id: "left-3", x: "32%", y: "69%", rotate: -8, scale: 0.98, opacity: 0.72, color: "#8d4248" },
  { id: "left-4", x: "39%", y: "60%", rotate: 4, scale: 0.94, opacity: 0.62, color: "#b98591" },
  { id: "left-5", x: "46%", y: "53%", rotate: 13, scale: 0.92, opacity: 0.58, color: "#c9a5a5" },
];

const rightTrail: FootprintStep[] = [
  { id: "right-1", x: "78%", y: "18%", rotate: 152, scale: 1.08, opacity: 0.94, color: "#7a0000" },
  { id: "right-2", x: "72%", y: "27%", rotate: 146, scale: 1.02, opacity: 0.84, color: "#6b2528" },
  { id: "right-3", x: "66%", y: "36%", rotate: 140, scale: 0.98, opacity: 0.74, color: "#8d4248" },
  { id: "right-4", x: "59%", y: "44%", rotate: 132, scale: 0.94, opacity: 0.64, color: "#b98591" },
  { id: "right-5", x: "52%", y: "50%", rotate: 124, scale: 0.92, opacity: 0.58, color: "#c9a5a5" },
];

function FootprintMark({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`footprint-mark ${side}`} viewBox="0 0 42 70" aria-hidden="true">
      <path
        className="footprint-sole"
        d="M23.4 3.8C32.8 4.6 37.4 14.2 34.8 27.3C31.9 42.2 22.4 52.7 12.3 49.6C3.3 46.8 1.1 35.4 5.3 22.1C9.4 9.3 14.4 3.1 23.4 3.8Z"
      />
      <path
        className="footprint-heel"
        d="M10.6 53.1C18.3 50.3 26.1 54.4 26.6 61.2C27.1 68.2 16.3 72 8.8 67C3.1 63.1 4.1 55.5 10.6 53.1Z"
      />
    </svg>
  );
}

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
      <div className="footprint-pair-inner">
        <FootprintMark side="left" />
        <FootprintMark side="right" />
      </div>
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
