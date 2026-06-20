import { useMemo, useRef, useState, type CSSProperties } from "react";
import type {
  Circle,
  ExtendedLine,
  GeometryObject,
  Point,
  ProofHighlight,
  ReasoningRelation,
  ReplayAngleHighlight,
  ReplayHighlightStyle,
  Segment,
} from "../geometry/types";
import { findNearbyIntersection } from "../geometry/intersections";
import { resolveBook1Prop7Context, resolveBook1Prop34Context, resolveBook1Prop36Context } from "../geometry/objectResolution";
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
import { WorkspaceToolGuide } from "./WorkspaceToolGuide";

const VIEW_BOX = { minX: -120, minY: 0, width: 1000, height: 660 };
const DRAG_THRESHOLD = 5;
const LINE_RENDER_SPAN = 1800;

const geometryColor: Record<string, string> = {
  red: "#8e1410",
  blue: "#15549a",
  gold: "#b98a2d",
  green: "#2f7350",
  rose: "#9d3152",
  teal: "#0f766e",
  violet: "#6d3b8f",
  black: "#240e08",
  ink: "#240e08",
};

type DrawStyle = CSSProperties & {
  "--draw-length"?: string;
};

function colorFor(object: GeometryObject) {
  return geometryColor[object.color ?? "ink"] ?? object.color ?? geometryColor.ink;
}

function replayColor(color?: string) {
  return color ? (geometryColor[color] ?? color) : geometryColor.gold;
}

type CanvasPoint = {
  x: number;
  y: number;
};

type LabelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlacedPointLabel = {
  id: string;
  text: string;
  rect: LabelRect;
};

type DragPreview = {
  tool: "compass" | "straightedge" | "extend" | "congruence" | "equilateral";
  start: CanvasPoint;
  current: CanvasPoint;
  startPoint: Point;
  startPointId: string | null;
  baseEndPointId?: string | null;
  hasMoved: boolean;
};

type TriangleDragPreview = {
  mode: "translate" | "rotate";
  start: CanvasPoint;
  current: CanvasPoint;
  center: CanvasPoint;
  startAngle: number;
  sourcePointIds: readonly string[];
  initialPoints: Record<string, CanvasPoint>;
  hasMoved: boolean;
};

const I4_SOURCE_POINT_IDS = ["A", "B", "C"] as const;
const I4_TARGET_POINT_IDS = ["D", "E", "F"] as const;
const I8_SOURCE_POINT_IDS = ["D", "E", "F"] as const;
const I8_TARGET_POINT_IDS = ["A", "B", "C"] as const;

function lineEndpointsThroughPoints(p1: CanvasPoint, p2: CanvasPoint, span = LINE_RENDER_SPAN) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return null;
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return {
    start: {
      x: midX - unitX * span,
      y: midY - unitY * span,
    },
    end: {
      x: midX + unitX * span,
      y: midY + unitY * span,
    },
  };
}

function equilateralApexForPreview(p1: CanvasPoint, p2: CanvasPoint, pull: CanvasPoint) {
  const heightScale = Math.sqrt(3) / 2;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const baseX = p2.x - p1.x;
  const baseY = p2.y - p1.y;
  const pullX = pull.x - p1.x;
  const pullY = pull.y - p1.y;
  const side = baseX * pullY - baseY * pullX < 0 ? -1 : 1;

  return {
    x: midX - baseY * heightScale * side,
    y: midY + baseX * heightScale * side,
  };
}

function rayEndpointThroughPoints(p1: CanvasPoint, p2: CanvasPoint, span = LINE_RENDER_SPAN) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return null;
  }

  return {
    start: p1,
    end: {
      x: p1.x + (dx / length) * span,
      y: p1.y + (dy / length) * span,
    },
  };
}

function trianglePointsByIds<T extends readonly string[]>(objects: GeometryObject[], ids: T) {
  const points = ids.map((id) => getPoint(objects, id));
  return points.every(Boolean) ? (points as { [K in keyof T]: Point }) : null;
}

function triangleCentroid(points: readonly CanvasPoint[]) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

function pointDistanceToSegment(point: CanvasPoint, a: CanvasPoint, b: CanvasPoint) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }

  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function rectWithPadding(rect: LabelRect, padding: number): LabelRect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function rectsOverlap(a: LabelRect, b: LabelRect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInRect(point: CanvasPoint, rect: LabelRect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function segmentIntersectsSegment(a: CanvasPoint, b: CanvasPoint, c: CanvasPoint, d: CanvasPoint) {
  const orientation = (p: CanvasPoint, q: CanvasPoint, r: CanvasPoint) =>
    (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

function segmentIntersectsRect(a: CanvasPoint, b: CanvasPoint, rect: LabelRect) {
  if (pointInRect(a, rect) || pointInRect(b, rect)) {
    return true;
  }

  const topLeft = { x: rect.x, y: rect.y };
  const topRight = { x: rect.x + rect.width, y: rect.y };
  const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height };
  const bottomLeft = { x: rect.x, y: rect.y + rect.height };
  return (
    segmentIntersectsSegment(a, b, topLeft, topRight) ||
    segmentIntersectsSegment(a, b, topRight, bottomRight) ||
    segmentIntersectsSegment(a, b, bottomRight, bottomLeft) ||
    segmentIntersectsSegment(a, b, bottomLeft, topLeft)
  );
}

function rectSamplePoints(rect: LabelRect): CanvasPoint[] {
  return [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x + rect.width / 2, y: rect.y },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height / 2 },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
  ];
}

function labelRectForPoint(point: Point, label: string, dx: number, dy: number): LabelRect {
  const width = Math.max(15, label.length * 13);
  const height = 24;
  return {
    x: dx < 0 ? point.x + dx - width : point.x + dx,
    y: dy < 0 ? point.y + dy - height : point.y + dy,
    width,
    height,
  };
}

function lineRenderEndpointsForSegment(segment: Segment, objects: GeometryObject[]) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!p1 || !p2) {
    return undefined;
  }

  if (segment.ray) {
    return rayEndpointThroughPoints(p1, p2);
  }

  if (segment.given) {
    return { start: p1, end: p2 };
  }

  return lineEndpointsThroughPoints(p1, p2);
}

function lineRenderEndpointsForExtendedLine(line: ExtendedLine, objects: GeometryObject[]) {
  const from = getPoint(objects, line.from);
  const through = getPoint(objects, line.through);
  return from && through ? lineEndpointsThroughPoints(from, through) : undefined;
}

function rectIntersectsLine(rect: LabelRect, start: CanvasPoint, end: CanvasPoint) {
  const padded = rectWithPadding(rect, 4);
  return segmentIntersectsRect(start, end, padded) || rectSamplePoints(padded).some((point) => pointDistanceToSegment(point, start, end) <= 5);
}

function rectIntersectsCircle(rect: LabelRect, center: CanvasPoint, radius: number) {
  const padded = rectWithPadding(rect, 4);
  const closestX = Math.max(padded.x, Math.min(center.x, padded.x + padded.width));
  const closestY = Math.max(padded.y, Math.min(center.y, padded.y + padded.height));
  const closestDistance = Math.hypot(closestX - center.x, closestY - center.y);
  const farthestDistance = Math.max(...rectSamplePoints(padded).map((point) => Math.hypot(point.x - center.x, point.y - center.y)));
  return closestDistance <= radius + 5 && farthestDistance >= radius - 5;
}

function sampledAngleArcPoints(vertex: CanvasPoint, firstSide: CanvasPoint, secondSide: CanvasPoint, radius: number) {
  const firstAngle = Math.atan2(firstSide.y - vertex.y, firstSide.x - vertex.x);
  const secondAngle = Math.atan2(secondSide.y - vertex.y, secondSide.x - vertex.x);
  let delta = secondAngle - firstAngle;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  const steps = Math.max(8, Math.ceil(Math.abs(delta) / 0.18));
  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = firstAngle + (delta * index) / steps;
    return {
      x: vertex.x + Math.cos(angle) * radius,
      y: vertex.y + Math.sin(angle) * radius,
    };
  });
}

function angleArcObstacles(
  objects: GeometryObject[],
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"],
  angles: ReplayAngleHighlight[],
  propositionId: string,
) {
  const replayArcs = angles.flatMap((angle) => {
    const [firstRef, vertexRef, secondRef] = angle.points;
    const first = pointFromReplayRef(objects, context, firstRef);
    const vertex = pointFromReplayRef(objects, context, vertexRef);
    const second = pointFromReplayRef(objects, context, secondRef);
    return first && vertex && second ? [sampledAngleArcPoints(vertex, first, second, angle.radius ?? 42)] : [];
  });

  if (propositionId !== "I.6") {
    return replayArcs;
  }

  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  return A && B && C
    ? [...replayArcs, sampledAngleArcPoints(B, A, C, 42), sampledAngleArcPoints(C, B, A, 42)]
    : replayArcs;
}

function labelCollisionScore(
  rect: LabelRect,
  point: Point,
  objects: GeometryObject[],
  placedLabels: PlacedPointLabel[],
  arcObstacles: CanvasPoint[][],
) {
  const padded = rectWithPadding(rect, 3);
  let score = 0;

  for (const object of objects) {
    if (object.type === "point") {
      const markerRadius = object.id === point.id ? 10 : object.auxiliary ? 7 : 11;
      if (rectIntersectsCircle(padded, object, markerRadius)) {
        score += object.id === point.id ? 5 : 20;
      }
    }

    if (object.type === "segment") {
      const endpoints = lineRenderEndpointsForSegment(object, objects);
      if (endpoints && rectIntersectsLine(padded, endpoints.start, endpoints.end)) {
        score += 18;
      }
    }

    if (object.type === "extended-line") {
      const endpoints = lineRenderEndpointsForExtendedLine(object, objects);
      if (endpoints && rectIntersectsLine(padded, endpoints.start, endpoints.end)) {
        score += 18;
      }
    }

    if (object.type === "circle") {
      const center = getPoint(objects, object.center);
      const radius = circleRadius(object, objects);
      if (center && radius > 0 && rectIntersectsCircle(padded, center, radius)) {
        score += 16;
      }
    }
  }

  for (const label of placedLabels) {
    if (rectsOverlap(padded, rectWithPadding(label.rect, 4))) {
      score += 30;
    }
  }

  for (const arc of arcObstacles) {
    if (arc.some((arcPoint) => pointInRect(arcPoint, padded))) {
      score += 16;
    }
  }

  return score;
}

function placePointLabels(
  objects: GeometryObject[],
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"],
  angles: ReplayAngleHighlight[],
  propositionId: string,
) {
  const candidateOffsets = [
    [18, -18],
    [18, 16],
    [-18, -18],
    [-18, 16],
    [30, -4],
    [-30, -4],
    [4, -34],
    [4, 30],
    [34, -28],
    [-34, -28],
    [34, 28],
    [-34, 28],
    [46, 6],
    [-46, 6],
  ] as const;
  const arcs = angleArcObstacles(objects, context, angles, propositionId);
  const placed: PlacedPointLabel[] = [];

  for (const point of objects.filter(isPoint).filter((candidate) => candidate.label && !candidate.auxiliary)) {
    const label = point.label ?? point.id;
    const candidates = candidateOffsets.map(([dx, dy], index) => {
      const rect = labelRectForPoint(point, label, dx, dy);
      return {
        index,
        rect,
        score: labelCollisionScore(rect, point, objects, placed, arcs),
      };
    });
    const best = candidates.sort((a, b) => a.score - b.score || a.index - b.index)[0];
    placed.push({
      id: point.id,
      text: label,
      rect: best.rect,
    });
  }

  return placed;
}

function pointInTriangle(point: CanvasPoint, a: CanvasPoint, b: CanvasPoint, c: CanvasPoint) {
  const area = (p1: CanvasPoint, p2: CanvasPoint, p3: CanvasPoint) =>
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2;
  const total = Math.abs(area(a, b, c));
  const split = Math.abs(area(point, b, c)) + Math.abs(area(a, point, c)) + Math.abs(area(a, b, point));
  return Math.abs(total - split) <= 1.5;
}

function triangleArrangementIds(propositionId: string) {
  if (propositionId === "I.4") {
    return { source: I4_SOURCE_POINT_IDS, target: I4_TARGET_POINT_IDS };
  }

  if (propositionId === "I.8") {
    return { source: I8_SOURCE_POINT_IDS, target: I8_TARGET_POINT_IDS };
  }

  return null;
}

function createTriangleDragPreview(
  objects: GeometryObject[],
  point: CanvasPoint,
  sourcePointIds: readonly string[],
): TriangleDragPreview | null {
  const points = trianglePointsByIds(objects, sourcePointIds);
  if (!points) {
    return null;
  }

  const [A, B, C] = points;
  const nearVertex = points.some((candidate) => Math.hypot(candidate.x - point.x, candidate.y - point.y) <= 28);
  const nearEdge =
    pointDistanceToSegment(point, A, B) <= 20 ||
    pointDistanceToSegment(point, A, C) <= 20 ||
    pointDistanceToSegment(point, B, C) <= 20;
  const inside = pointInTriangle(point, A, B, C);

  if (!nearVertex && !nearEdge && !inside) {
    return null;
  }

  const center = triangleCentroid(points);

  return {
    mode: nearVertex ? "rotate" : "translate",
    start: point,
    current: point,
    center,
    startAngle: Math.atan2(point.y - center.y, point.x - center.x),
    sourcePointIds,
    initialPoints: Object.fromEntries(points.map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }])),
    hasMoved: false,
  };
}

function transformedTrianglePositions(preview: TriangleDragPreview, current = preview.current) {
  if (preview.mode === "translate") {
    const dx = current.x - preview.start.x;
    const dy = current.y - preview.start.y;
    return Object.fromEntries(
      preview.sourcePointIds.map((id) => [id, { x: preview.initialPoints[id].x + dx, y: preview.initialPoints[id].y + dy }]),
    ) as Record<string, CanvasPoint>;
  }

  const currentAngle = Math.atan2(current.y - preview.center.y, current.x - preview.center.x);
  const angle = currentAngle - preview.startAngle;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return Object.fromEntries(
    preview.sourcePointIds.map((id) => {
      const initial = preview.initialPoints[id];
      const dx = initial.x - preview.center.x;
      const dy = initial.y - preview.center.y;

      return [
        id,
        {
          x: preview.center.x + dx * cosine - dy * sine,
          y: preview.center.y + dx * sine + dy * cosine,
        },
      ];
    }),
  ) as Record<string, CanvasPoint>;
}

function objectsWithTransformedPoints(objects: GeometryObject[], positions: Record<string, CanvasPoint> | null) {
  if (!positions) {
    return objects;
  }

  return objects.map((object) =>
    object.type === "point" && positions[object.id]
      ? {
          ...object,
          x: positions[object.id].x,
          y: positions[object.id].y,
        }
      : object,
  );
}

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

function highlightStyleMapFromContext(
  styles: ReplayHighlightStyle[],
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"],
) {
  if (!context) {
    return new Map<string, string>();
  }

  const styleMap = new Map<string, string>();
  for (const style of styles) {
    const id = context[style.target];
    if (id) {
      styleMap.set(id, replayColor(style.color));
    }
  }
  return styleMap;
}

function pointFromReplayRef(
  objects: GeometryObject[],
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"],
  ref: ProofHighlight,
) {
  const contextId = context?.[ref] ?? context?.[`point${ref}`] ?? ref;
  return getPoint(objects, contextId);
}

function SegmentElement({
  segment,
  objects,
  highlighted,
  highlightColor,
  selected,
  animated,
  replaying,
}: {
  segment: Segment;
  objects: GeometryObject[];
  highlighted: boolean;
  highlightColor?: string;
  selected: boolean;
  animated: boolean;
  replaying: boolean;
}) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!p1 || !p2) {
    return null;
  }

  const isGivenInfiniteLine = segment.source === "given" && !segment.given && !segment.ray;
  const renderedLine = segment.ray ? rayEndpointThroughPoints(p1, p2) : segment.given ? null : lineEndpointsThroughPoints(p1, p2);
  const start = renderedLine?.start ?? p1;
  const end = renderedLine?.end ?? p2;
  const drawLength = Math.hypot(start.x - end.x, start.y - end.y) + 2;
  const drawStyle: DrawStyle = { "--draw-length": `${drawLength}` };
  const centerDrawLength = Math.hypot(p1.x - p2.x, p1.y - p2.y) + 2;
  const centerDrawStyle: DrawStyle = { "--draw-length": `${centerDrawLength}` };

  return (
    <>
      {renderedLine && !segment.ray && !isGivenInfiniteLine && (
        <line
          className={[
            "svg-segment-extension",
            segment.source === "target" ? "target-guide" : "",
            highlighted ? "highlighted" : "",
            animated ? "draw-in" : "",
            replaying ? "replay-draw" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          style={drawStyle}
          strokeLinecap="round"
        />
      )}
      <line
        className={[
          "svg-segment",
          segment.source === "target" ? "target-guide" : "",
          highlighted ? "highlighted" : "",
          animated ? "draw-in" : "",
          replaying ? "replay-draw" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        x1={segment.given || segment.ray || isGivenInfiniteLine ? start.x : p1.x}
        y1={segment.given || segment.ray || isGivenInfiniteLine ? start.y : p1.y}
        x2={segment.given || segment.ray || isGivenInfiniteLine ? end.x : p2.x}
        y2={segment.given || segment.ray || isGivenInfiniteLine ? end.y : p2.y}
        style={segment.given || segment.ray || isGivenInfiniteLine ? drawStyle : centerDrawStyle}
        stroke={selected ? "#16120e" : highlightColor ?? colorFor(segment)}
        strokeWidth={highlighted ? 7 : segment.given ? 4 : 3}
        strokeLinecap="round"
      />
    </>
  );
}

function CircleElement({
  circle,
  objects,
  highlighted,
  highlightColor,
  animated,
  replaying,
}: {
  circle: Circle;
  objects: GeometryObject[];
  highlighted: boolean;
  highlightColor?: string;
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
      stroke={highlightColor ?? colorFor(circle)}
      strokeWidth={highlighted ? 4 : 2}
    />
  );
}

function ExtendedLineElement({
  line,
  objects,
  highlighted,
  highlightColor,
  animated,
  replaying,
}: {
  line: ExtendedLine;
  objects: GeometryObject[];
  highlighted: boolean;
  highlightColor?: string;
  animated: boolean;
  replaying: boolean;
}) {
  const from = getPoint(objects, line.from);
  const through = getPoint(objects, line.through);
  if (!from || !through) {
    return null;
  }

  const renderedLine = lineEndpointsThroughPoints(from, through);
  if (!renderedLine) {
    return null;
  }

  const drawLength = Math.hypot(renderedLine.start.x - renderedLine.end.x, renderedLine.start.y - renderedLine.end.y) + 2;
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
      x1={renderedLine.start.x}
      y1={renderedLine.start.y}
      x2={renderedLine.end.x}
      y2={renderedLine.end.y}
      style={drawStyle}
      stroke={highlightColor ?? colorFor(line)}
      strokeWidth={highlighted ? 5 : 2.5}
      strokeLinecap="round"
    />
  );
}

function PointElement({
  point,
  highlighted,
  highlightColor,
  selected,
  animated,
}: {
  point: Point;
  highlighted: boolean;
  highlightColor?: string;
  selected: boolean;
  animated: boolean;
}) {
  return (
    <g
      className={[
        "svg-point",
        point.auxiliary ? "auxiliary" : "",
        point.source === "target" ? "target-guide" : "",
        highlighted ? "highlighted" : "",
        animated ? "point-pop" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <circle
        cx={point.x}
        cy={point.y}
        r={point.auxiliary ? 3 : selected ? 8 : highlighted ? 7 : 5}
        fill={selected ? "#f6ead6" : point.auxiliary ? "#7d725f" : highlightColor ?? colorFor(point)}
        stroke={selected || highlighted ? "#2b251f" : "#f6ead6"}
        strokeWidth={point.auxiliary ? 0 : selected || highlighted ? 2 : 1}
      />
    </g>
  );
}

function PointLabelElement({ label }: { label: PlacedPointLabel }) {
  return (
    <text className="svg-point-label" x={label.rect.x} y={label.rect.y} dominantBaseline="hanging">
      {label.text}
    </text>
  );
}

function DragPreviewElement({ preview, objects }: { preview: DragPreview; objects: GeometryObject[] }) {
  const snappedPoint = findNearbyPoint(objects, preview.current.x, preview.current.y);
  const guidedEnd =
    preview.tool === "extend" && !snappedPoint
      ? snapToPointRay(objects, preview.startPoint, preview.current.x, preview.current.y)
      : undefined;
  const end = snappedPoint ?? guidedEnd ?? preview.current;

  if (preview.tool === "equilateral" && preview.startPointId && preview.baseEndPointId) {
    const baseStart = getPoint(objects, preview.startPointId);
    const baseEnd = getPoint(objects, preview.baseEndPointId);
    if (baseStart && baseEnd) {
      const apex = equilateralApexForPreview(baseStart, baseEnd, preview.current);

      return (
        <g className="tool-preview">
          <line
            className="preview-segment"
            x1={baseStart.x}
            y1={baseStart.y}
            x2={baseEnd.x}
            y2={baseEnd.y}
          />
          <line
            className="preview-segment"
            x1={baseStart.x}
            y1={baseStart.y}
            x2={apex.x}
            y2={apex.y}
          />
          <line
            className="preview-segment"
            x1={baseEnd.x}
            y1={baseEnd.y}
            x2={apex.x}
            y2={apex.y}
          />
          <circle className="preview-anchor" cx={baseStart.x} cy={baseStart.y} r="6" />
          <circle className="preview-guide" cx={baseEnd.x} cy={baseEnd.y} r="9" />
          <circle className="preview-guide" cx={apex.x} cy={apex.y} r="7" />
        </g>
      );
    }
  }

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

  const previewLine = lineEndpointsThroughPoints(preview.startPoint, end);

  return (
    <g className="tool-preview">
      {previewLine && (
        <line
          className="preview-line-extension"
          x1={previewLine.start.x}
          y1={previewLine.start.y}
          x2={previewLine.end.x}
          y2={previewLine.end.y}
        />
      )}
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

function angleArcPath(vertex: CanvasPoint, firstSide: CanvasPoint, secondSide: CanvasPoint, radius: number) {
  const firstAngle = Math.atan2(firstSide.y - vertex.y, firstSide.x - vertex.x);
  const secondAngle = Math.atan2(secondSide.y - vertex.y, secondSide.x - vertex.x);
  let delta = secondAngle - firstAngle;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  const start = {
    x: vertex.x + Math.cos(firstAngle) * radius,
    y: vertex.y + Math.sin(firstAngle) * radius,
  };
  const end = {
    x: vertex.x + Math.cos(secondAngle) * radius,
    y: vertex.y + Math.sin(secondAngle) * radius,
  };

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${delta >= 0 ? 1 : 0} ${end.x} ${end.y}`;
}

function angleSectorPath(vertex: CanvasPoint, firstSide: CanvasPoint, secondSide: CanvasPoint, radius: number) {
  const firstAngle = Math.atan2(firstSide.y - vertex.y, firstSide.x - vertex.x);
  const secondAngle = Math.atan2(secondSide.y - vertex.y, secondSide.x - vertex.x);
  let delta = secondAngle - firstAngle;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  const start = {
    x: vertex.x + Math.cos(firstAngle) * radius,
    y: vertex.y + Math.sin(firstAngle) * radius,
  };
  const end = {
    x: vertex.x + Math.cos(firstAngle + delta) * radius,
    y: vertex.y + Math.sin(firstAngle + delta) * radius,
  };

  return `M ${vertex.x} ${vertex.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${delta >= 0 ? 1 : 0} ${end.x} ${end.y} Z`;
}

function rightAnglePath(vertex: CanvasPoint, firstSide: CanvasPoint, secondSide: CanvasPoint, size: number) {
  const firstLength = Math.hypot(firstSide.x - vertex.x, firstSide.y - vertex.y);
  const secondLength = Math.hypot(secondSide.x - vertex.x, secondSide.y - vertex.y);
  if (firstLength < 1 || secondLength < 1) {
    return undefined;
  }

  const first = {
    x: (firstSide.x - vertex.x) / firstLength,
    y: (firstSide.y - vertex.y) / firstLength,
  };
  const second = {
    x: (secondSide.x - vertex.x) / secondLength,
    y: (secondSide.y - vertex.y) / secondLength,
  };
  const p1 = { x: vertex.x + first.x * size, y: vertex.y + first.y * size };
  const p2 = { x: vertex.x + second.x * size, y: vertex.y + second.y * size };
  const corner = { x: p1.x + second.x * size, y: p1.y + second.y * size };

  return `M ${p1.x} ${p1.y} L ${corner.x} ${corner.y} L ${p2.x} ${p2.y}`;
}

function ReplayAngleHighlights({
  angles,
  context,
  objects,
}: {
  angles: ReplayAngleHighlight[];
  context: ReturnType<typeof useGeometryStore.getState>["proofContext"];
  objects: GeometryObject[];
}) {
  if (!context || angles.length === 0) {
    return null;
  }

  return (
    <g className="replay-angle-highlights" aria-hidden="true">
      {angles.map((angle, index) => {
        const [firstRef, vertexRef, secondRef] = angle.points;
        const first = pointFromReplayRef(objects, context, firstRef);
        const vertex = pointFromReplayRef(objects, context, vertexRef);
        const second = pointFromReplayRef(objects, context, secondRef);
        if (!first || !vertex || !second) {
          return null;
        }

        const color = replayColor(angle.color);
        const radius = angle.radius ?? (angle.rightAngle ? 34 : 42);
        const style = { "--replay-angle-color": color } as CSSProperties;
        const rightPath = angle.rightAngle ? rightAnglePath(vertex, first, second, Math.max(18, radius * 0.54)) : undefined;

        return (
          <g className="replay-angle-highlight" key={`${firstRef}-${vertexRef}-${secondRef}-${index}`} style={style}>
            {angle.rightAngle ? (
              rightPath && <path className="replay-right-angle-square" d={rightPath} />
            ) : (
              <>
                <path className="replay-angle-sector" d={angleSectorPath(vertex, first, second, radius)} />
                <path className="replay-angle-arc" d={angleArcPath(vertex, first, second, radius)} />
              </>
            )}
            {angle.amplifyVertex && <circle className="replay-angle-vertex" cx={vertex.x} cy={vertex.y} r="11" />}
          </g>
        );
      })}
    </g>
  );
}

function Prop6GivenAngleMarks({
  objects,
  propositionId,
}: {
  objects: GeometryObject[];
  propositionId: string;
}) {
  if (propositionId !== "I.6") {
    return null;
  }

  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  if (!A || !B || !C) {
    return null;
  }

  return (
    <g className="given-equal-angle-marks" aria-hidden="true">
      <path className="given-equal-angle-mark" d={angleArcPath(B, A, C, 42)} />
      <path className="given-equal-angle-mark" d={angleArcPath(C, B, A, 42)} />
    </g>
  );
}

function TriangleArrangementGuide({
  objects,
  ids,
}: {
  objects: GeometryObject[];
  ids: ReturnType<typeof triangleArrangementIds>;
}) {
  if (!ids) {
    return null;
  }

  const source = trianglePointsByIds(objects, ids.source);
  const target = trianglePointsByIds(objects, ids.target);
  if (!source || !target) {
    return null;
  }

  return (
    <g className="triangle-arrangement-guide" aria-hidden="true">
      <polygon className="target-triangle-wash" points={target.map((point) => `${point.x},${point.y}`).join(" ")} />
      <polygon className="source-triangle-wash" points={source.map((point) => `${point.x},${point.y}`).join(" ")} />
    </g>
  );
}

function ReasoningRelationHighlights({
  objects,
  relations,
}: {
  objects: GeometryObject[];
  relations: ReasoningRelation[];
}) {
  const congruences = relations.filter((relation) => relation.type === "triangle-congruence");
  if (congruences.length === 0) {
    return null;
  }

  return (
    <g className="reasoning-relation-highlights" aria-hidden="true">
      {congruences.map((relation) => {
        const triangle1 = relation.triangle1.map((id) => getPoint(objects, id));
        const triangle2 = relation.triangle2.map((id) => getPoint(objects, id));
        if (!triangle1.every(Boolean) || !triangle2.every(Boolean)) {
          return null;
        }

        return (
          <g key={relation.id}>
            <polygon className="reasoning-triangle-highlight one" points={triangle1.map((point) => `${point!.x},${point!.y}`).join(" ")} />
            <polygon className="reasoning-triangle-highlight two" points={triangle2.map((point) => `${point!.x},${point!.y}`).join(" ")} />
          </g>
        );
      })}
    </g>
  );
}

function triangleIdsFromCongruencePicks(
  selection: ReturnType<typeof useGeometryStore.getState>["congruenceSelection"],
  offset: number,
) {
  if (!selection || selection.picks.length < offset + 3) {
    return null;
  }

  const picks = selection.picks.slice(offset, offset + 3);
  const ids = new Set<string>();
  for (const pick of picks) {
    if (pick.kind === "side") {
      ids.add(pick.p1);
      ids.add(pick.p2);
    } else {
      ids.add(pick.pointId);
    }
  }

  const triangleIds = Array.from(ids);
  return triangleIds.length === 3 ? triangleIds : null;
}

function CongruenceSelectionHighlights({
  objects,
  selection,
}: {
  objects: GeometryObject[];
  selection: ReturnType<typeof useGeometryStore.getState>["congruenceSelection"];
}) {
  const firstTriangleIds = triangleIdsFromCongruencePicks(selection, 0);
  const secondTriangleIds = triangleIdsFromCongruencePicks(selection, 3);
  const triangles = [
    { className: "one", ids: firstTriangleIds },
    { className: "two", ids: secondTriangleIds },
  ];

  if (!triangles.some((triangle) => triangle.ids)) {
    return null;
  }

  return (
    <g className="congruence-selection-highlights" aria-hidden="true">
      {triangles.map((triangle) => {
        if (!triangle.ids) {
          return null;
        }

        const points = triangle.ids.map((id) => getPoint(objects, id));
        if (!points.every(Boolean)) {
          return null;
        }

        return (
          <polygon
            className={`congruence-selection-highlight ${triangle.className}`}
            key={triangle.className}
            points={points.map((point) => `${point!.x},${point!.y}`).join(" ")}
          />
        );
      })}
    </g>
  );
}

function ReasoningRelationLog({ relations }: { relations: ReasoningRelation[] }) {
  const congruences = relations.filter((relation) => relation.type === "triangle-congruence");
  if (congruences.length === 0) {
    return null;
  }

  return (
    <div className="reasoning-relation-log" aria-label="Recorded theorem relations">
      {congruences.map((relation) => (
        <span className="reasoning-relation-badge" key={relation.id}>
          {relation.method}: △{relation.triangle1.join("")} ≅ △{relation.triangle2.join("")}
        </span>
      ))}
    </div>
  );
}

export function GeometryCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [triangleDragPreview, setTriangleDragPreview] = useState<TriangleDragPreview | null>(null);
  const [intersectionPreview, setIntersectionPreview] = useState<CanvasPoint | null>(null);
  const phase = useGeometryStore((state) => state.phase);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const objects = useGeometryStore((state) => state.objects);
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const theoremSelectionIds = useGeometryStore((state) => state.theoremSelectionIds);
  const congruenceSelection = useGeometryStore((state) => state.congruenceSelection);
  const completedActionIds = useGeometryStore((state) => state.completedActionIds);
  const handleCanvasClick = useGeometryStore((state) => state.handleCanvasClick);
  const handleCanvasDrag = useGeometryStore((state) => state.handleCanvasDrag);
  const markChallengeAction = useGeometryStore((state) => state.markChallengeAction);
  const transformPoints = useGeometryStore((state) => state.transformPoints);
  const animatedObjectId = useGeometryStore((state) => state.animatedObjectId);
  const proofContext = useGeometryStore((state) => state.proofContext);
  const currentReplayStep = useGeometryStore((state) => state.currentReplayStep);
  const reasoningRelations = useGeometryStore((state) => state.reasoningRelations);

  const trianglePreviewPositions = triangleDragPreview ? transformedTrianglePositions(triangleDragPreview) : null;
  const displayObjects = objectsWithTransformedPoints(objects, trianglePreviewPositions);
  const selectedIds = useMemo(() => new Set(selectedPointIds), [selectedPointIds]);
  const selectedSegmentIds = useMemo(() => new Set(theoremSelectionIds), [theoremSelectionIds]);
  const proposition = getProposition(currentPropositionId);
  const currentReplay =
    phase === "readingReplay" || phase === "logicReplay" || phase === "completionAnimation" || phase === "completed"
      ? proposition.replaySteps[currentReplayStep]
      : null;
  const highlightedIds = useMemo(
    () => highlightIdsFromContext(currentReplay?.highlight ?? [], proofContext),
    [currentReplay?.highlight, proofContext],
  );
  const highlightStyleMap = useMemo(
    () => highlightStyleMapFromContext(currentReplay?.highlightStyles ?? [], proofContext),
    [currentReplay?.highlightStyles, proofContext],
  );
  const pointLabels = useMemo(
    () => placePointLabels(displayObjects, proofContext, currentReplay?.angleHighlights ?? [], currentPropositionId),
    [displayObjects, proofContext, currentReplay?.angleHighlights, currentPropositionId],
  );
  const shouldHighlightTriangle = currentReplay?.highlight.includes("triangleABC") ?? false;
  const replayAnimationKey = currentReplay?.id ?? "static";
  const triangleArrangement = triangleArrangementIds(currentPropositionId);
  const showProp6Assumption = currentPropositionId === "I.6" && completedActionIds.includes("prop6-assume-ab-greater");
  const showProp7ImpossibleClaim =
    currentPropositionId === "I.7" &&
    phase === "construction" &&
    !completedActionIds.includes("prop7-no-such-d") &&
    Boolean(resolveBook1Prop7Context(displayObjects));
  const showProp15VerticalPairSelection =
    currentPropositionId === "I.15" &&
    phase === "construction" &&
    !completedActionIds.includes("prop15-select-vertical-pair");
  const showProp28AngleConditionSelection =
    currentPropositionId === "I.28" &&
    phase === "construction" &&
    !completedActionIds.includes("prop28-select-angle-condition");
  const showProp34AsaAasSelection =
    currentPropositionId === "I.34" &&
    phase === "construction" &&
    !completedActionIds.includes("prop34-use-asa-aas") &&
    Boolean(resolveBook1Prop34Context(displayObjects));
  const showProp36Prop33Selection =
    currentPropositionId === "I.36" &&
    phase === "construction" &&
    !completedActionIds.includes("prop36-use-prop33") &&
    Boolean(resolveBook1Prop36Context(displayObjects));
  const showProp43ComplementSelection =
    currentPropositionId === "I.43" &&
    phase === "construction" &&
    !completedActionIds.includes("prop43-select-complements");

  const eventToCanvasPoint = (event: React.PointerEvent<SVGSVGElement>): CanvasPoint | null => {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }

    const matrix = svg.getScreenCTM();
    if (!matrix) {
      return null;
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const canvasPoint = point.matrixTransform(matrix.inverse());

    return {
      x: canvasPoint.x,
      y: canvasPoint.y,
    };
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = eventToCanvasPoint(event);
    if (!point || phase !== "construction") {
      return;
    }

    setIntersectionPreview(null);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (selectedTool === "arrange-triangle" && triangleArrangement) {
      const preview = createTriangleDragPreview(displayObjects, point, triangleArrangement.source);
      if (preview) {
        setTriangleDragPreview(preview);
      }
      return;
    }

    if (selectedTool === "theorem-equilateral") {
      const startPoint =
        findNearbyPoint(objects, point.x, point.y) ??
        ({
          id: "__preview-start",
          type: "point",
          x: point.x,
          y: point.y,
        } as Point);

      setDragPreview({
        tool: "equilateral",
        start: point,
        current: point,
        startPoint,
        startPointId: startPoint.id === "__preview-start" ? null : startPoint.id,
        baseEndPointId: null,
        hasMoved: false,
      });
      return;
    }

    if (selectedTool === "theorem-sas" || selectedTool === "theorem-sss") {
      const startPoint =
        findNearbyPoint(objects, point.x, point.y) ??
        ({
          id: "__preview-start",
          type: "point",
          x: point.x,
          y: point.y,
        } as Point);

      setDragPreview({
        tool: "congruence",
        start: point,
        current: point,
        startPoint,
        startPointId: startPoint.id === "__preview-start" ? null : startPoint.id,
        hasMoved: false,
      });
      return;
    }

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

    if (triangleDragPreview) {
      setTriangleDragPreview({
        ...triangleDragPreview,
        current: point,
        hasMoved:
          triangleDragPreview.hasMoved ||
          Math.hypot(point.x - triangleDragPreview.start.x, point.y - triangleDragPreview.start.y) > DRAG_THRESHOLD,
      });
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

    if (dragPreview.tool === "equilateral") {
      let snappedBaseEnd: Point | null | undefined = null;
      if (!dragPreview.baseEndPointId && dragPreview.startPointId) {
        snappedBaseEnd = findNearbyPoint(objects, point.x, point.y, 30);
      }
      const baseEndPointId =
        snappedBaseEnd && snappedBaseEnd.id !== dragPreview.startPointId
          ? snappedBaseEnd.id
          : dragPreview.baseEndPointId;

      setDragPreview({
        ...dragPreview,
        current: point,
        baseEndPointId,
        hasMoved: dragPreview.hasMoved || Math.hypot(point.x - dragPreview.start.x, point.y - dragPreview.start.y) > DRAG_THRESHOLD,
      });
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

    if (triangleDragPreview) {
      const moved =
        triangleDragPreview.hasMoved ||
        Math.hypot(point.x - triangleDragPreview.start.x, point.y - triangleDragPreview.start.y) > DRAG_THRESHOLD;
      const nextPositions = transformedTrianglePositions(triangleDragPreview, point);
      setTriangleDragPreview(null);
      setIntersectionPreview(null);

      if (moved) {
        transformPoints(nextPositions);
      }
      return;
    }

    if (dragPreview) {
      const moved =
        dragPreview.hasMoved ||
        Math.hypot(point.x - dragPreview.start.x, point.y - dragPreview.start.y) > DRAG_THRESHOLD;
      const startPointId = dragPreview.startPointId;
      setDragPreview(null);
      setIntersectionPreview(null);

      if (moved) {
        const guidePointId =
          dragPreview.tool === "equilateral"
            ? dragPreview.baseEndPointId ??
              (() => {
                const finalSnap = findNearbyPoint(objects, point.x, point.y, 30);
                return finalSnap && finalSnap.id !== dragPreview.startPointId ? finalSnap.id : null;
              })()
            : undefined;
        handleCanvasDrag(startPointId, dragPreview.start.x, dragPreview.start.y, point.x, point.y, guidePointId);
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
    setTriangleDragPreview(null);
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
        <rect
          x={VIEW_BOX.minX}
          y={VIEW_BOX.minY}
          width={VIEW_BOX.width}
          height={VIEW_BOX.height}
          fill="transparent"
          pointerEvents="none"
        />

        <TriangleArrangementGuide
          ids={phase === "construction" && selectedTool === "arrange-triangle" ? triangleArrangement : null}
          objects={displayObjects}
        />

        <ReasoningRelationHighlights objects={displayObjects} relations={reasoningRelations} />
        <CongruenceSelectionHighlights objects={displayObjects} selection={congruenceSelection} />

        {shouldHighlightTriangle && <TriangleHighlight context={proofContext} objects={displayObjects} />}

        {showProp6Assumption && (
          <text className="contradiction-mode-label" x="24" y="58">
            Suppose AB &gt; AC
          </text>
        )}

        {currentPropositionId === "I.7" && currentReplay?.id === "greater-angle" && proofContext && (
          <g className="whole-part-labels" aria-hidden="true">
            {getPoint(displayObjects, proofContext.pointD ?? "") && (
              <text
                x={(getPoint(displayObjects, proofContext.pointD ?? "")?.x ?? 0) + 22}
                y={(getPoint(displayObjects, proofContext.pointD ?? "")?.y ?? 0) - 20}
              >
                whole
              </text>
            )}
            {getPoint(displayObjects, proofContext.pointC ?? "") && (
              <text
                x={(getPoint(displayObjects, proofContext.pointC ?? "")?.x ?? 0) + 22}
                y={(getPoint(displayObjects, proofContext.pointC ?? "")?.y ?? 0) + 26}
              >
                part
              </text>
            )}
          </g>
        )}

        {displayObjects.filter(isCircle).map((circle) => (
          <CircleElement
            circle={circle}
            animated={animatedObjectId === circle.id}
            highlighted={highlightedIds.has(circle.id)}
            highlightColor={highlightStyleMap.get(circle.id)}
            key={highlightedIds.has(circle.id) ? `${circle.id}-${replayAnimationKey}` : circle.id}
            objects={displayObjects}
            replaying={(phase === "readingReplay" || phase === "logicReplay") && highlightedIds.has(circle.id)}
          />
        ))}

        {displayObjects.filter(isExtendedLine).map((line) => (
          <ExtendedLineElement
            animated={animatedObjectId === line.id}
            highlighted={highlightedIds.has(line.id)}
            highlightColor={highlightStyleMap.get(line.id)}
            key={highlightedIds.has(line.id) ? `${line.id}-${replayAnimationKey}` : line.id}
            line={line}
            objects={displayObjects}
            replaying={(phase === "readingReplay" || phase === "logicReplay") && highlightedIds.has(line.id)}
          />
        ))}

        {displayObjects.filter(isSegment).map((segment) => (
          <SegmentElement
            animated={animatedObjectId === segment.id}
            highlighted={highlightedIds.has(segment.id)}
            highlightColor={highlightStyleMap.get(segment.id)}
            key={highlightedIds.has(segment.id) ? `${segment.id}-${replayAnimationKey}` : segment.id}
            objects={displayObjects}
            segment={segment}
            selected={selectedSegmentIds.has(segment.id) || (selectedIds.has(segment.p1) && selectedIds.has(segment.p2))}
            replaying={(phase === "readingReplay" || phase === "logicReplay") && highlightedIds.has(segment.id)}
          />
        ))}

        <Prop6GivenAngleMarks objects={displayObjects} propositionId={currentPropositionId} />
        <ReplayAngleHighlights angles={currentReplay?.angleHighlights ?? []} context={proofContext} objects={displayObjects} />

        {displayObjects.filter(isPoint).map((point) => (
          <PointElement
            animated={animatedObjectId === point.id}
            highlighted={highlightedIds.has(point.id)}
            highlightColor={highlightStyleMap.get(point.id)}
            key={point.id}
            point={point}
            selected={selectedIds.has(point.id)}
          />
        ))}

        {pointLabels.map((label) => (
          <PointLabelElement key={`label-${label.id}`} label={label} />
        ))}

        {selectedTool === "intersection" && intersectionPreview && <IntersectionPreviewElement point={intersectionPreview} />}
        {dragPreview && <DragPreviewElement preview={dragPreview} objects={objects} />}
      </svg>
      {showProp7ImpossibleClaim && (
        <button className="workspace-action-button prop7-impossible-button" type="button" onClick={() => markChallengeAction("prop7-no-such-d")}>
          No such D exists with AC = AD and BC = BD.
        </button>
      )}
      {showProp15VerticalPairSelection && (
        <button className="workspace-action-button" type="button" onClick={() => markChallengeAction("prop15-select-vertical-pair")}>
          Select vertical angles CEA and BED.
        </button>
      )}
      {showProp28AngleConditionSelection && (
        <button className="workspace-action-button" type="button" onClick={() => markChallengeAction("prop28-select-angle-condition")}>
          Select AB, CD, EF, and the given angle condition.
        </button>
      )}
      {showProp34AsaAasSelection && (
        <button className="workspace-action-button" type="button" onClick={() => markChallengeAction("prop34-use-asa-aas")}>
          Use ASA/AAS on triangles ABC and DCB.
        </button>
      )}
      {showProp36Prop33Selection && (
        <button className="workspace-action-button" type="button" onClick={() => markChallengeAction("prop36-use-prop33")}>
          Use Prop. 33 to recognize EBCH.
        </button>
      )}
      {showProp43ComplementSelection && (
        <button className="workspace-action-button" type="button" onClick={() => markChallengeAction("prop43-select-complements")}>
          Select complements BK and KD.
        </button>
      )}
      <ReasoningRelationLog relations={reasoningRelations} />
      <WorkspaceToolGuide />
    </section>
  );
}
