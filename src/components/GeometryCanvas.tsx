import { useMemo, useRef, useState, type CSSProperties } from "react";
import type { Circle, ExtendedLine, GeometryObject, Point, ProofHighlight, Segment } from "../geometry/types";
import { findNearbyIntersection } from "../geometry/intersections";
import {
  circleRadius,
  findNearbyPoint,
  getPoint,
  INTERSECTION_TOLERANCE,
  isCircle,
  isExtendedLine,
  isPoint,
  isSegment,
  snapToPointRay,
} from "../geometry/operations";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

const VIEW_BOX = { minX: -120, minY: 0, width: 1000, height: 660 };
const DRAG_THRESHOLD = 5;

const geometryColor: Record<string, string> = {
  red: "#bd342a",
  blue: "#2461a8",
  gold: "#c9971a",
  black: "#2b251f",
  ink: "#2b251f",
};

type DrawStyle = CSSProperties & {
  "--draw-length"?: string;
};

function colorFor(object: GeometryObject) {
  return geometryColor[object.color ?? "ink"] ?? object.color ?? geometryColor.ink;
}

type CanvasPoint = {
  x: number;
  y: number;
};

type DragPreview = {
  tool: "compass" | "straightedge" | "extend";
  start: CanvasPoint;
  current: CanvasPoint;
  startPoint: Point;
  startPointId: string | null;
  hasMoved: boolean;
};

function highlightIdsFromContext(highlights: ProofHighlight[], context: ReturnType<typeof useGeometryStore.getState>["proofContext"]) {
  if (!context) {
    return new Set<string>();
  }

  const ids = new Set<string>();
  for (const highlight of highlights) {
    const id = context[highlight];
    if (id) {
      ids.add(id);
    }
  }
  return ids;
}

function SegmentElement({
  segment,
  objects,
  highlighted,
  selected,
  animated,
  replaying,
}: {
  segment: Segment;
  objects: GeometryObject[];
  highlighted: boolean;
  selected: boolean;
  animated: boolean;
  replaying: boolean;
}) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!p1 || !p2) {
    return null;
  }

  const drawLength = Math.hypot(p1.x - p2.x, p1.y - p2.y) + 2;
  const drawStyle: DrawStyle = { "--draw-length": `${drawLength}` };

  return (
    <>
      <line
        className={[
          "svg-segment",
          highlighted ? "highlighted" : "",
          animated ? "draw-in" : "",
          replaying ? "replay-draw" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        style={drawStyle}
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
  animated,
  replaying,
}: {
  circle: Circle;
  objects: GeometryObject[];
  highlighted: boolean;
  animated: boolean;
  replaying: boolean;
}) {
  const center = getPoint(objects, circle.center);
  const radius = circleRadius(circle, objects);
  if (!center || radius === 0) {
    return null;
  }

  const drawLength = 2 * Math.PI * radius * 1.04;
  const drawStyle: DrawStyle = { "--draw-length": `${drawLength}` };

  return (
    <circle
      className={[
        "svg-circle",
        highlighted ? "highlighted" : "",
        animated ? "draw-in" : "",
        replaying ? "replay-draw" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      cx={center.x}
      cy={center.y}
      r={radius}
      style={drawStyle}
      fill="none"
      stroke={colorFor(circle)}
      strokeWidth={highlighted ? 4 : 2}
    />
  );
}

function ExtendedLineElement({
  line,
  objects,
  highlighted,
  animated,
  replaying,
}: {
  line: ExtendedLine;
  objects: GeometryObject[];
  highlighted: boolean;
  animated: boolean;
  replaying: boolean;
}) {
  const from = getPoint(objects, line.from);
  const through = getPoint(objects, line.through);
  if (!from || !through) {
    return null;
  }

  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return null;
  }

  const scale = 1600 / length;
  const end = {
    x: from.x + dx * scale,
    y: from.y + dy * scale,
  };
  const drawLength = Math.hypot(from.x - end.x, from.y - end.y) + 2;
  const drawStyle: DrawStyle = { "--draw-length": `${drawLength}` };

  return (
    <line
      className={[
        "svg-extended-line",
        highlighted ? "highlighted" : "",
        animated ? "draw-in" : "",
        replaying ? "replay-draw" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      x1={from.x}
      y1={from.y}
      x2={end.x}
      y2={end.y}
      style={drawStyle}
      stroke={colorFor(line)}
      strokeWidth={highlighted ? 5 : 2.5}
      strokeLinecap="round"
    />
  );
}

function PointElement({
  point,
  highlighted,
  selected,
  animated,
}: {
  point: Point;
  highlighted: boolean;
  selected: boolean;
  animated: boolean;
}) {
  return (
    <g
      className={["svg-point", point.auxiliary ? "auxiliary" : "", highlighted ? "highlighted" : "", animated ? "point-pop" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <circle
        cx={point.x}
        cy={point.y}
        r={point.auxiliary ? 3 : selected ? 8 : highlighted ? 7 : 5}
        fill={selected ? "#f6ead6" : point.auxiliary ? "#7d725f" : colorFor(point)}
        stroke={selected || highlighted ? "#2b251f" : "#f6ead6"}
        strokeWidth={point.auxiliary ? 0 : selected || highlighted ? 2 : 1}
      />
      {point.label && (
        <text x={point.x + 12} y={point.y - 12}>
          {point.label}
        </text>
      )}
    </g>
  );
}

function DragPreviewElement({ preview, objects }: { preview: DragPreview; objects: GeometryObject[] }) {
  const snappedPoint = findNearbyPoint(objects, preview.current.x, preview.current.y);
  const guidedEnd =
    preview.tool === "extend" && !snappedPoint
      ? snapToPointRay(objects, preview.startPoint, preview.current.x, preview.current.y)
      : undefined;
  const end = snappedPoint ?? guidedEnd ?? preview.current;

  if (preview.tool === "compass") {
    const radius = Math.hypot(preview.startPoint.x - end.x, preview.startPoint.y - end.y);
    return (
      <g className="tool-preview">
        <circle
          className="preview-circle"
          cx={preview.startPoint.x}
          cy={preview.startPoint.y}
          r={radius}
          pathLength={1}
        />
        <line
          className="preview-radius"
          x1={preview.startPoint.x}
          y1={preview.startPoint.y}
          x2={end.x}
          y2={end.y}
        />
        <circle className="preview-anchor" cx={preview.startPoint.x} cy={preview.startPoint.y} r="6" />
      </g>
    );
  }

  return (
    <g className="tool-preview">
      <line
        className="preview-segment"
        x1={preview.startPoint.x}
        y1={preview.startPoint.y}
        x2={end.x}
        y2={end.y}
      />
      <circle className="preview-anchor" cx={preview.startPoint.x} cy={preview.startPoint.y} r="6" />
      {guidedEnd && <circle className="preview-guide" cx={guidedEnd.guide.x} cy={guidedEnd.guide.y} r="9" />}
    </g>
  );
}

function IntersectionPreviewElement({ point }: { point: CanvasPoint }) {
  return (
    <g className="intersection-snap-preview" aria-hidden="true">
      <circle cx={point.x} cy={point.y} r="18" />
      <circle cx={point.x} cy={point.y} r="6" />
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

  const A = getPoint(objects, context.pointA ?? "");
  const B = getPoint(objects, context.pointB ?? "");
  const C = getPoint(objects, context.pointC ?? "");
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
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [intersectionPreview, setIntersectionPreview] = useState<CanvasPoint | null>(null);
  const phase = useGeometryStore((state) => state.phase);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const objects = useGeometryStore((state) => state.objects);
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const handleCanvasClick = useGeometryStore((state) => state.handleCanvasClick);
  const handleCanvasDrag = useGeometryStore((state) => state.handleCanvasDrag);
  const animatedObjectId = useGeometryStore((state) => state.animatedObjectId);
  const proofContext = useGeometryStore((state) => state.proofContext);
  const currentReplayStep = useGeometryStore((state) => state.currentReplayStep);

  const selectedIds = useMemo(() => new Set(selectedPointIds), [selectedPointIds]);
  const proposition = getProposition(currentPropositionId);
  const currentReplay =
    phase === "logicReplay" || phase === "completionAnimation" || phase === "completed"
      ? proposition.replaySteps[currentReplayStep]
      : null;
  const highlightedIds = useMemo(
    () => highlightIdsFromContext(currentReplay?.highlight ?? [], proofContext),
    [currentReplay?.highlight, proofContext],
  );
  const shouldHighlightTriangle = currentReplay?.highlight.includes("triangleABC") ?? false;
  const replayAnimationKey = currentReplay?.id ?? "static";

  const eventToCanvasPoint = (event: React.PointerEvent<SVGSVGElement>): CanvasPoint | null => {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / VIEW_BOX.width, rect.height / VIEW_BOX.height);
    const renderedWidth = VIEW_BOX.width * scale;
    const renderedHeight = VIEW_BOX.height * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    return {
      x: VIEW_BOX.minX + (event.clientX - rect.left - offsetX) / scale,
      y: VIEW_BOX.minY + (event.clientY - rect.top - offsetY) / scale,
    };
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = eventToCanvasPoint(event);
    if (!point || phase !== "construction") {
      return;
    }

    setIntersectionPreview(null);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (selectedTool === "compass" || selectedTool === "straightedge") {
      const startPoint =
        findNearbyPoint(objects, point.x, point.y) ??
        ({
          id: "__preview-start",
          type: "point",
          x: point.x,
          y: point.y,
        } as Point);

      setDragPreview({
        tool: selectedTool,
        start: point,
        current: point,
        startPoint,
        startPointId: startPoint.id === "__preview-start" ? null : startPoint.id,
        hasMoved: false,
      });
    }

    if (selectedTool === "extend") {
      const startPoint = findNearbyPoint(objects, point.x, point.y);
      if (!startPoint) {
        return;
      }

      setDragPreview({
        tool: selectedTool,
        start: point,
        current: point,
        startPoint,
        startPointId: startPoint.id,
        hasMoved: false,
      });
    }
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = eventToCanvasPoint(event);
    if (!point) {
      return;
    }

    if (!dragPreview && selectedTool === "intersection" && phase === "construction") {
      const intersection = findNearbyIntersection(objects, point.x, point.y, INTERSECTION_TOLERANCE);
      setIntersectionPreview(intersection ? { x: intersection.x, y: intersection.y } : null);
      return;
    }

    if (!dragPreview) {
      return;
    }

    setDragPreview({
      ...dragPreview,
      current: point,
      hasMoved: dragPreview.hasMoved || Math.hypot(point.x - dragPreview.start.x, point.y - dragPreview.start.y) > DRAG_THRESHOLD,
    });
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = eventToCanvasPoint(event);
    if (!point) {
      setDragPreview(null);
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragPreview) {
      const moved =
        dragPreview.hasMoved ||
        Math.hypot(point.x - dragPreview.start.x, point.y - dragPreview.start.y) > DRAG_THRESHOLD;
      const startPointId = dragPreview.startPointId;
      setDragPreview(null);
      setIntersectionPreview(null);

      if (moved) {
        handleCanvasDrag(startPointId, dragPreview.start.x, dragPreview.start.y, point.x, point.y);
        return;
      }
    }

    setIntersectionPreview(null);
    handleCanvasClick(point.x, point.y);
  };

  const onPointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragPreview(null);
    setIntersectionPreview(null);
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
        viewBox={`${VIEW_BOX.minX} ${VIEW_BOX.minY} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
        role="img"
        aria-label={`A geometric construction of Proposition ${proposition.id}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
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

        <rect x={VIEW_BOX.minX} y={VIEW_BOX.minY} width={VIEW_BOX.width} height={VIEW_BOX.height} fill="url(#paper-grain)" />

        {shouldHighlightTriangle && <TriangleHighlight context={proofContext} objects={objects} />}

        {objects.filter(isCircle).map((circle) => (
          <CircleElement
            circle={circle}
            animated={animatedObjectId === circle.id}
            highlighted={highlightedIds.has(circle.id)}
            key={highlightedIds.has(circle.id) ? `${circle.id}-${replayAnimationKey}` : circle.id}
            objects={objects}
            replaying={phase === "logicReplay" && highlightedIds.has(circle.id)}
          />
        ))}

        {objects.filter(isExtendedLine).map((line) => (
          <ExtendedLineElement
            animated={animatedObjectId === line.id}
            highlighted={highlightedIds.has(line.id)}
            key={highlightedIds.has(line.id) ? `${line.id}-${replayAnimationKey}` : line.id}
            line={line}
            objects={objects}
            replaying={phase === "logicReplay" && highlightedIds.has(line.id)}
          />
        ))}

        {objects.filter(isSegment).map((segment) => (
          <SegmentElement
            animated={animatedObjectId === segment.id}
            highlighted={highlightedIds.has(segment.id)}
            key={highlightedIds.has(segment.id) ? `${segment.id}-${replayAnimationKey}` : segment.id}
            objects={objects}
            segment={segment}
            selected={selectedIds.has(segment.p1) && selectedIds.has(segment.p2)}
            replaying={phase === "logicReplay" && highlightedIds.has(segment.id)}
          />
        ))}

        {objects.filter(isPoint).map((point) => (
          <PointElement
            animated={animatedObjectId === point.id}
            highlighted={highlightedIds.has(point.id)}
            key={point.id}
            point={point}
            selected={selectedIds.has(point.id)}
          />
        ))}

        {selectedTool === "intersection" && intersectionPreview && <IntersectionPreviewElement point={intersectionPreview} />}
        {dragPreview && <DragPreviewElement preview={dragPreview} objects={objects} />}
      </svg>
    </section>
  );
}
