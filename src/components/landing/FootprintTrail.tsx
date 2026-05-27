import type { CSSProperties } from "react";

type FootprintStep = {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  color: string;
};

type FootprintPoint = Omit<FootprintStep, "rotate">;
type Coordinate = Pick<FootprintPoint, "x" | "y">;

const CENTER_GAP = {
  xMin: 46,
  xMax: 54,
  yMin: 44,
  yMax: 56,
};

const MEETING_LEFT_TARGET = { x: CENTER_GAP.xMin, y: 52 };
const MEETING_RIGHT_TARGET = { x: CENTER_GAP.xMax, y: 48 };
const FOOTPRINT_FORWARD_OFFSET_DEG = 25;

const leftTrailPoints: FootprintPoint[] = [
  { id: "left-1", x: 14, y: 82, scale: 1.06, opacity: 0.95, color: "#7a0000" },
  { id: "left-2", x: 20, y: 79, scale: 1.01, opacity: 0.88, color: "#6b2528" },
  { id: "left-3", x: 27, y: 73, scale: 0.97, opacity: 0.8, color: "#8d4248" },
  { id: "left-4", x: 33, y: 65, scale: 0.93, opacity: 0.72, color: "#b98591" },
  { id: "left-5", x: 38.5, y: 57.5, scale: 0.89, opacity: 0.64, color: "#c29aa0" },
  { id: "left-6", x: 43, y: 53.5, scale: 0.84, opacity: 0.58, color: "#c9a5a5" },
];

const rightTrailPoints: FootprintPoint[] = [
  { id: "right-1", x: 80, y: 18, scale: 1.03, opacity: 0.94, color: "#7a0000" },
  { id: "right-2", x: 76, y: 22, scale: 0.99, opacity: 0.86, color: "#6b2528" },
  { id: "right-3", x: 72, y: 28, scale: 0.95, opacity: 0.78, color: "#8d4248" },
  { id: "right-4", x: 67, y: 36, scale: 0.91, opacity: 0.7, color: "#b98591" },
  { id: "right-5", x: 61.5, y: 44, scale: 0.87, opacity: 0.62, color: "#c29aa0" },
  { id: "right-6", x: 56.5, y: 48.5, scale: 0.82, opacity: 0.56, color: "#c9a5a5" },
];

function angleToTarget(from: Coordinate, to: Coordinate) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

function withInwardRotations(points: FootprintPoint[], target: Coordinate): FootprintStep[] {
  return points.map((point, index) => {
    const nextPoint = points[index + 1] ?? target;

    return {
      ...point,
      rotate: angleToTarget(point, nextPoint) + FOOTPRINT_FORWARD_OFFSET_DEG,
    };
  });
}

const leftTrail = withInwardRotations(leftTrailPoints, MEETING_LEFT_TARGET);
const rightTrail = withInwardRotations(rightTrailPoints, MEETING_RIGHT_TARGET);

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
          "--footprint-x": `${step.x}%`,
          "--footprint-y": `${step.y}%`,
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
