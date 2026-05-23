import { useMemo, useRef } from "react";
import type { Circle, GeometryObject, Point, ProofHighlight, Segment } from "../geometry/types";
import { allCircleIntersections } from "../geometry/intersections";
import { circleRadius, getPoint, isCircle, isPoint, isSegment } from "../geometry/operations";
import { book1Prop1 } from "../propositions/book1prop1";
import { useGeometryStore } from "../state/useGeometryStore";

const VIEW_BOX = { width: 760, height: 620 };

const geometryColor: Record<string, string> = {
  red: "#bd342a",
  blue: "#2461a8",
  gold: "#c9971a",
  black: "#2b251f",
  ink: "#2b251f",
};

function colorFor(object: GeometryObject) {
  return geometryColor[object.color ?? "ink"] ?? object.color ?? geometryColor.ink;
}

function highlightIdsFromContext(highlights: ProofHighlight[], context: ReturnType<typeof useGeometryStore.getState>["proofContext"]) {
  if (!context) {
    return new Set<string>();
  }

  const ids = new Set<string>();
  for (const highlight of highlights) {
    if (highlight === "pointA") ids.add(context.A);
    if (highlight === "pointB") ids.add(context.B);
    if (highlight === "pointC") ids.add(context.C);
    if (highlight === "segmentAB") ids.add(context.segmentAB);
    if (highlight === "segmentAC") ids.add(context.segmentAC);
    if (highlight === "segmentBC") ids.add(context.segmentBC);
    if (highlight === "circleA" && context.circleA) ids.add(context.circleA);
    if (highlight === "circleB" && context.circleB) ids.add(context.circleB);
  }
  return ids;
}

function SegmentElement({
  segment,
  objects,
  highlighted,
  selected,
}: {
  segment: Segment;
  objects: GeometryObject[];
  highlighted: boolean;
  selected: boolean;
}) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!p1 || !p2) {
    return null;
  }

  return (
    <>
      <line
        className={highlighted ? "svg-segment highlighted" : "svg-segment"}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={selected ? "#16120e" : colorFor(segment)}
        strokeWidth={highlighted ? 7 : segment.given ? 4 : 3}
        strokeLinecap="round"
      />
      {segment.label && (
        <text className="svg-segment-label" x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 + 24}>
          {segment.label}
        </text>
      )}
    </>
  );
}

function CircleElement({
  circle,
  objects,
  highlighted,
}: {
  circle: Circle;
  objects: GeometryObject[];
  highlighted: boolean;
}) {
  const center = getPoint(objects, circle.center);
  const radius = circleRadius(circle, objects);
  if (!center || radius === 0) {
    return null;
  }

  return (
    <circle
      className={highlighted ? "svg-circle highlighted" : "svg-circle"}
      cx={center.x}
      cy={center.y}
      r={radius}
      fill="none"
      stroke={colorFor(circle)}
      strokeWidth={highlighted ? 4 : 2}
    />
  );
}

function PointElement({
  point,
  highlighted,
  selected,
}: {
  point: Point;
  highlighted: boolean;
  selected: boolean;
}) {
  return (
    <g className={highlighted ? "svg-point highlighted" : "svg-point"}>
      <circle
        cx={point.x}
        cy={point.y}
        r={selected ? 8 : highlighted ? 7 : 5}
        fill={selected ? "#f6ead6" : colorFor(point)}
        stroke={selected || highlighted ? "#2b251f" : "#f6ead6"}
        strokeWidth={selected || highlighted ? 2 : 1}
      />
      {point.label && (
        <text x={point.x + 12} y={point.y - 12}>
          {point.label}
        </text>
      )}
    </g>
  );
}

function TriangleHighlight({
  context,
  objects,
}: {
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"];
  objects: GeometryObject[];
}) {
  if (!context) {
    return null;
  }

  const A = getPoint(objects, context.A);
  const B = getPoint(objects, context.B);
  const C = getPoint(objects, context.C);
  if (!A || !B || !C) {
    return null;
  }

  return (
    <polygon
      className="triangle-wash"
      points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
      fill="#c9971a"
      opacity="0.16"
    />
  );
}

export function GeometryCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const phase = useGeometryStore((state) => state.phase);
  const objects = useGeometryStore((state) => state.objects);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const handleCanvasClick = useGeometryStore((state) => state.handleCanvasClick);
  const proofContext = useGeometryStore((state) => state.proofContext);
  const currentReplayStep = useGeometryStore((state) => state.currentReplayStep);

  const selectedIds = useMemo(() => new Set(selectedPointIds), [selectedPointIds]);
  const currentReplay =
    phase === "logicReplay" || phase === "completed" ? book1Prop1.replaySteps[currentReplayStep] : null;
  const highlightedIds = useMemo(
    () => highlightIdsFromContext(currentReplay?.highlight ?? [], proofContext),
    [currentReplay?.highlight, proofContext],
  );
  const shouldHighlightTriangle = currentReplay?.highlight.includes("triangleABC") ?? false;
  const intersections = useMemo(() => allCircleIntersections(objects), [objects]);

  const onClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_BOX.width;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_BOX.height;
    handleCanvasClick(x, y);
  };

  return (
    <section className="canvas-shell" aria-label="Euclidean construction canvas">
      <svg
        ref={svgRef}
        className={[
          "geometry-canvas",
          phase === "success" ? "success-pulse" : "",
          phase === "construction" ? "" : "is-readonly",
        ]
          .filter(Boolean)
          .join(" ")}
        viewBox={`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`}
        role="img"
        aria-label="A geometric construction of Proposition I.1"
        onClick={onClick}
      >
        <defs>
          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="paper-grain" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="#fbf4e6" />
            <path d="M0 22H80M0 54H80M18 0V80M56 0V80" stroke="#eadcc5" strokeWidth="0.5" opacity="0.28" />
          </pattern>
        </defs>

        <rect width={VIEW_BOX.width} height={VIEW_BOX.height} fill="url(#paper-grain)" />

        {phase === "construction" &&
          intersections.map((intersection) => (
            <g
              className="intersection-target"
              key={`${intersection.circles[0].id}-${intersection.circles[1].id}-${intersection.x}-${intersection.y}`}
            >
              <circle className="intersection-halo" cx={intersection.x} cy={intersection.y} r="16" />
              <circle className="intersection-ghost" cx={intersection.x} cy={intersection.y} r="6" />
            </g>
          ))}

        {shouldHighlightTriangle && <TriangleHighlight context={proofContext} objects={objects} />}

        {objects.filter(isCircle).map((circle) => (
          <CircleElement
            circle={circle}
            highlighted={highlightedIds.has(circle.id)}
            key={circle.id}
            objects={objects}
          />
        ))}

        {objects.filter(isSegment).map((segment) => (
          <SegmentElement
            highlighted={highlightedIds.has(segment.id)}
            key={segment.id}
            objects={objects}
            segment={segment}
            selected={selectedIds.has(segment.p1) && selectedIds.has(segment.p2)}
          />
        ))}

        {objects.filter(isPoint).map((point) => (
          <PointElement
            highlighted={highlightedIds.has(point.id)}
            key={point.id}
            point={point}
            selected={selectedIds.has(point.id)}
          />
        ))}
      </svg>
    </section>
  );
}
