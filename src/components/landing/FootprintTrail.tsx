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
  xMin: 50,
  xMax: 63,
  yMin: 45,
  yMax: 61,
};

const LOWER_LEFT_TARGET = { x: 50, y: 50 };
const UPPER_RIGHT_TARGET = { x: 63, y: 55 };
const FOOTPRINT_BASE_ROTATION = 90;

const lowerLeftTrailPoints: FootprintPoint[] = [
  { id: "lower-left-1", x: 18, y: 91, scale: 1.12, color: "#7a0000", opacity: 0.96 },
  { id: "lower-left-2", x: 23, y: 87, scale: 1.08, color: "#6d1518", opacity: 0.92 },
  { id: "lower-left-3", x: 29, y: 82, scale: 1.02, color: "#743036", opacity: 0.86 },
  { id: "lower-left-4", x: 35, y: 76, scale: 0.98, color: "#8d4a55", opacity: 0.78 },
  { id: "lower-left-5", x: 41, y: 68, scale: 0.94, color: "#a66b78", opacity: 0.68 },
  { id: "lower-left-6", x: 47, y: 58, scale: 0.9, color: "#c1a0a8", opacity: 0.56 },
];

const upperRightTrailPoints: FootprintPoint[] = [
  { id: "upper-right-1", x: 84, y: 6, scale: 1.1, color: "#7a0000", opacity: 0.96 },
  { id: "upper-right-2", x: 80, y: 12, scale: 1.06, color: "#6d1518", opacity: 0.92 },
  { id: "upper-right-3", x: 75, y: 20, scale: 1.02, color: "#743036", opacity: 0.84 },
  { id: "upper-right-4", x: 71, y: 30, scale: 0.98, color: "#8d4a55", opacity: 0.76 },
  { id: "upper-right-5", x: 68, y: 41, scale: 0.94, color: "#a66b78", opacity: 0.66 },
  { id: "upper-right-6", x: 66, y: 54, scale: 0.9, color: "#c1a0a8", opacity: 0.54 },
];

function angleToTarget(fromX: number, fromY: number, toX: number, toY: number) {
  return (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;
}

function getRotationForTrail(points: FootprintPoint[], index: number, fallbackTarget: Coordinate) {
  const current = points[index];
  const next = points[index + 1] ?? fallbackTarget;

  return angleToTarget(current.x, current.y, next.x, next.y) + FOOTPRINT_BASE_ROTATION;
}

function assertOutsideCenterGap(points: FootprintPoint[]) {
  return points.map((point) => {
    const insideGap =
      point.x >= CENTER_GAP.xMin && point.x <= CENTER_GAP.xMax && point.y >= CENTER_GAP.yMin && point.y <= CENTER_GAP.yMax;

    if (!insideGap) {
      return point;
    }

    return {
      ...point,
      x: point.x < (CENTER_GAP.xMin + CENTER_GAP.xMax) / 2 ? CENTER_GAP.xMin - 1 : CENTER_GAP.xMax + 1,
    };
  });
}

function withInwardRotations(points: FootprintPoint[], target: Coordinate): FootprintStep[] {
  const safePoints = assertOutsideCenterGap(points);

  return safePoints.map((point, index) => {
    return {
      ...point,
      rotate: getRotationForTrail(safePoints, index, target),
    };
  });
}

const lowerLeftTrail = withInwardRotations(lowerLeftTrailPoints, LOWER_LEFT_TARGET);
const upperRightTrail = withInwardRotations(upperRightTrailPoints, UPPER_RIGHT_TARGET);

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
          "--target-opacity": step.opacity,
          "--footprint-delay": `${index * 430 + delayOffset}ms`,
        } as CSSProperties
      }
    >
      <div
        className="footprint-pair-inner"
        style={
          {
            "--footprint-rotate": `${step.rotate}deg`,
            "--footprint-scale": step.scale,
            "--footprint-color": step.color,
          } as CSSProperties
        }
      >
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
        {lowerLeftTrail.map((step, index) => (
          <FootprintPair key={step.id} step={step} index={index} />
        ))}
      </div>
      <div className="footprint-trail right-trail" aria-hidden="true">
        {upperRightTrail.map((step, index) => (
          <FootprintPair key={step.id} step={step} index={index} delayOffset={190} />
        ))}
      </div>
    </>
  );
}
