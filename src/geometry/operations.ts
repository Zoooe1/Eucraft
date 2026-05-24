import type { Circle, ExtendedLine, GeometryObject, Point, Segment } from "./types";

export const POINT_TOLERANCE = 20;
export const INTERSECTION_TOLERANCE = 76;
export const EQUALITY_TOLERANCE = 5;
export const COLLINEAR_TOLERANCE = 0.015;
export const ANGLE_TOLERANCE = 0.04;
export const STRAIGHTEDGE_GUIDE_TOLERANCE = 22;
export const OBJECT_SNAP_TOLERANCE = 14;

export function isPoint(object: GeometryObject): object is Point {
  return object.type === "point";
}

export function isSegment(object: GeometryObject): object is Segment {
  return object.type === "segment";
}

export function isCircle(object: GeometryObject): object is Circle {
  return object.type === "circle";
}

export function isExtendedLine(object: GeometryObject): object is ExtendedLine {
  return object.type === "extended-line";
}

export function getPoint(objects: GeometryObject[], id: string): Point | undefined {
  return objects.find((object): object is Point => isPoint(object) && object.id === id);
}

export function getSegment(objects: GeometryObject[], id: string): Segment | undefined {
  return objects.find((object): object is Segment => isSegment(object) && object.id === id);
}

export function getCircle(objects: GeometryObject[], id: string): Circle | undefined {
  return objects.find((object): object is Circle => isCircle(object) && object.id === id);
}

export function allPoints(objects: GeometryObject[]): Point[] {
  return objects.filter(isPoint);
}

export function allNamedPoints(objects: GeometryObject[]): Point[] {
  return allPoints(objects).filter((point) => !point.auxiliary);
}

export function allSegments(objects: GeometryObject[]): Segment[] {
  return objects.filter(isSegment);
}

export function allCircles(objects: GeometryObject[]): Circle[] {
  return objects.filter(isCircle);
}

export function allExtendedLines(objects: GeometryObject[]): ExtendedLine[] {
  return objects.filter(isExtendedLine);
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function circleRadius(circle: Circle, objects: GeometryObject[]): number {
  const center = getPoint(objects, circle.center);
  if (!center) {
    return 0;
  }

  if (circle.through) {
    const through = getPoint(objects, circle.through);
    return through ? distance(center, through) : 0;
  }

  if (circle.radiusSegment) {
    const p1 = getPoint(objects, circle.radiusSegment.p1);
    const p2 = getPoint(objects, circle.radiusSegment.p2);
    return p1 && p2 ? distance(p1, p2) : 0;
  }

  return circle.radiusValue ?? 0;
}

export function areDistancesEqual(d1: number, d2: number, tolerance = EQUALITY_TOLERANCE): boolean {
  return Math.abs(d1 - d2) <= tolerance;
}

export function arePointsCollinear(
  a: Point,
  b: Point,
  c: Point,
  tolerance = COLLINEAR_TOLERANCE,
): boolean {
  const ab = distance(a, b);
  const ac = distance(a, c);
  const bc = distance(b, c);
  const scale = Math.max(ab * Math.max(ac, bc), 1);
  const doubledArea = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  return doubledArea / scale <= tolerance;
}

export function angleAt(vertex: Point, side1: Point, side2: Point): number {
  const v1x = side1.x - vertex.x;
  const v1y = side1.y - vertex.y;
  const v2x = side2.x - vertex.x;
  const v2y = side2.y - vertex.y;
  const length1 = Math.hypot(v1x, v1y);
  const length2 = Math.hypot(v2x, v2y);
  if (length1 === 0 || length2 === 0) {
    return 0;
  }

  const cosine = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (length1 * length2)));
  return Math.acos(cosine);
}

export function areAnglesEqual(angle1: number, angle2: number, tolerance = ANGLE_TOLERANCE): boolean {
  return Math.abs(angle1 - angle2) <= tolerance;
}

export function isPointBetween(a: Point, point: Point, b: Point, tolerance = COLLINEAR_TOLERANCE): boolean {
  if (!arePointsCollinear(a, b, point, tolerance)) {
    return false;
  }

  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const lengthSquared = abx * abx + aby * aby;
  if (lengthSquared === 0) {
    return false;
  }

  const t = (apx * abx + apy * aby) / lengthSquared;
  return t >= -0.01 && t <= 1.01;
}

export function isPointOnRay(from: Point, through: Point, point: Point, tolerance = COLLINEAR_TOLERANCE): boolean {
  if (!arePointsCollinear(from, through, point, tolerance)) {
    return false;
  }

  const rayX = through.x - from.x;
  const rayY = through.y - from.y;
  const pointX = point.x - from.x;
  const pointY = point.y - from.y;
  return rayX * pointX + rayY * pointY >= -2;
}

export function findNearbyPoint(
  objects: GeometryObject[],
  x: number,
  y: number,
  tolerance = POINT_TOLERANCE,
): Point | undefined {
  return allPoints(objects)
    .map((point) => ({ point, d: Math.hypot(point.x - x, point.y - y) }))
    .filter(({ d }) => d <= tolerance)
    .sort((a, b) => a.d - b.d)[0]?.point;
}

export function snapToPointRay(
  objects: GeometryObject[],
  start: Point,
  x: number,
  y: number,
  tolerance = STRAIGHTEDGE_GUIDE_TOLERANCE,
): { x: number; y: number; guide: Point } | undefined {
  const dragX = x - start.x;
  const dragY = y - start.y;
  const dragLength = Math.hypot(dragX, dragY);
  if (dragLength < tolerance) {
    return undefined;
  }

  const candidates: Array<{ x: number; y: number; guide: Point; distance: number }> = allPoints(objects)
    .filter((point) => point.id !== start.id && !point.auxiliary)
    .map((point) => {
      const guideX = point.x - start.x;
      const guideY = point.y - start.y;
      const guideLength = Math.hypot(guideX, guideY);
      if (guideLength < 1) {
        return undefined;
      }

      const unitX = guideX / guideLength;
      const unitY = guideY / guideLength;
      const projection = dragX * unitX + dragY * unitY;
      if (projection <= guideLength + tolerance * 0.4) {
        return undefined;
      }

      const projectedX = start.x + projection * unitX;
      const projectedY = start.y + projection * unitY;
      const perpendicularDistance = Math.hypot(x - projectedX, y - projectedY);

      return perpendicularDistance <= tolerance
        ? {
            guide: point,
            x: projectedX,
            y: projectedY,
            distance: perpendicularDistance,
          }
        : undefined;
    })
    .filter((candidate): candidate is { x: number; y: number; guide: Point; distance: number } => Boolean(candidate));

  return candidates.sort((a, b) => a.distance - b.distance)[0];
}

export function segmentExistsBetween(objects: GeometryObject[], p1: string, p2: string): Segment | undefined {
  return allSegments(objects).find(
    (segment) => (segment.p1 === p1 && segment.p2 === p2) || (segment.p1 === p2 && segment.p2 === p1),
  );
}

export function circleExists(objects: GeometryObject[], center: string, through: string): Circle | undefined {
  return allCircles(objects).find((circle) => circle.center === center && circle.through === through);
}

export function transferredCircleExists(
  objects: GeometryObject[],
  center: string,
  sourceP1: string,
  sourceP2: string,
): Circle | undefined {
  return allCircles(objects).find(
    (circle) =>
      circle.center === center &&
      ((circle.radiusSegment?.p1 === sourceP1 && circle.radiusSegment?.p2 === sourceP2) ||
        (circle.radiusSegment?.p1 === sourceP2 && circle.radiusSegment?.p2 === sourceP1)),
  );
}

export function createPoint(
  label: string,
  x: number,
  y: number,
  createdBy: Point["createdBy"] = "free",
  options: {
    color?: string;
    fixed?: boolean;
    parentObjectIds?: string[];
    source?: string;
  } = {},
): Point {
  return {
    id: label,
    type: "point",
    x,
    y,
    label,
    color: options.color ?? (createdBy === "intersection" ? "gold" : "ink"),
    fixed: options.fixed,
    source: options.source ?? createdBy,
    createdBy,
    parentObjectIds: options.parentObjectIds,
  };
}

export function createSegment(p1: string, p2: string, color?: string, source = "Post.1"): Segment {
  const id = `segment-${p1}-${p2}-${crypto.randomUUID().slice(0, 6)}`;
  const label = /^[A-Z]$/.test(p1) && /^[A-Z]$/.test(p2) ? `${p1}${p2}` : undefined;
  return { id, type: "segment", p1, p2, label, color, source };
}

export function createCircle(center: string, through: string, color?: string, source = "Post.3"): Circle {
  const id = `circle-${center}-${through}-${crypto.randomUUID().slice(0, 6)}`;
  const label = /^[A-Z]$/.test(center) && /^[A-Z]$/.test(through) ? `${center}${through}` : undefined;
  return { id, type: "circle", center, through, label, color, source, createdBy: "Post.3" };
}

export function createCircleFromLength(
  center: string,
  sourceP1: string,
  sourceP2: string,
  color?: string,
  createdBy: "I.2" | "free-compass-transfer" = "I.2",
): Circle {
  const id = `circle-${center}-${sourceP1}${sourceP2}-${crypto.randomUUID().slice(0, 6)}`;
  const sourceLabel = /^[A-Z]$/.test(sourceP1) && /^[A-Z]$/.test(sourceP2) ? `${sourceP1}${sourceP2}` : "source segment";
  return {
    id,
    type: "circle",
    center,
    radiusSegment: {
      p1: sourceP1,
      p2: sourceP2,
    },
    label: /^[A-Z]$/.test(center) ? `${center}:${sourceLabel}` : undefined,
    color,
    source: "I.2",
    createdBy,
    sourceDescription: `radius equals ${sourceLabel}`,
  };
}

export function extendedLineExists(objects: GeometryObject[], from: string, through: string): ExtendedLine | undefined {
  return allExtendedLines(objects).find((line) => line.from === from && line.through === through);
}

export function createExtendedLine(from: string, through: string, baseSegment: string, color?: string): ExtendedLine {
  const id = `extend-${from}-${through}-${crypto.randomUUID().slice(0, 6)}`;
  const label = /^[A-Z]$/.test(from) && /^[A-Z]$/.test(through) ? `${from}${through}` : undefined;
  return {
    id,
    type: "extended-line",
    from,
    through,
    baseSegment,
    label,
    color,
    source: "Post.2",
  };
}

export function createAuxiliaryPoint(x: number, y: number): Point {
  return {
    id: `point-${crypto.randomUUID().slice(0, 8)}`,
    type: "point",
    x,
    y,
    auxiliary: true,
    color: "ink",
  };
}

function projectToLine(a: Point, b: Point, x: number, y: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return undefined;
  }

  const t = ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared;
  return {
    x: a.x + t * dx,
    y: a.y + t * dy,
    t,
  };
}

export function findNearbySegment(
  objects: GeometryObject[],
  x: number,
  y: number,
  tolerance = OBJECT_SNAP_TOLERANCE,
): Segment | undefined {
  return allSegments(objects)
    .map((segment) => {
      const p1 = getPoint(objects, segment.p1);
      const p2 = getPoint(objects, segment.p2);
      const projection = p1 && p2 ? projectToLine(p1, p2, x, y) : undefined;
      if (!projection || projection.t < -0.03 || projection.t > 1.03) {
        return undefined;
      }

      return { segment, distance: Math.hypot(x - projection.x, y - projection.y) };
    })
    .filter((candidate): candidate is { segment: Segment; distance: number } => Boolean(candidate))
    .filter(({ distance: candidateDistance }) => candidateDistance <= tolerance)
    .sort((a, b) => a.distance - b.distance)[0]?.segment;
}

export function findNearbyObjectSnap(
  objects: GeometryObject[],
  x: number,
  y: number,
  tolerance = OBJECT_SNAP_TOLERANCE,
): { x: number; y: number; parentObjectIds: string[] } | undefined {
  const lineSnaps = [...allSegments(objects), ...allExtendedLines(objects)]
    .map((object) => {
      const p1 = getPoint(objects, object.type === "segment" ? object.p1 : object.from);
      const p2 = getPoint(objects, object.type === "segment" ? object.p2 : object.through);
      const projection = p1 && p2 ? projectToLine(p1, p2, x, y) : undefined;
      if (!projection) {
        return undefined;
      }

      if (object.type === "segment" && (projection.t < -0.03 || projection.t > 1.03)) {
        return undefined;
      }

      if (object.type === "extended-line" && projection.t < -0.03) {
        return undefined;
      }

      const snapDistance = Math.hypot(x - projection.x, y - projection.y);
      return snapDistance <= tolerance
        ? {
            x: projection.x,
            y: projection.y,
            parentObjectIds: [object.id],
            distance: snapDistance,
          }
        : undefined;
    })
    .filter(
      (candidate): candidate is { x: number; y: number; parentObjectIds: string[]; distance: number } =>
        Boolean(candidate),
    );

  const circleSnaps = allCircles(objects)
    .map((circle) => {
      const center = getPoint(objects, circle.center);
      const radius = circleRadius(circle, objects);
      if (!center || radius === 0) {
        return undefined;
      }

      const dx = x - center.x;
      const dy = y - center.y;
      const distanceFromCenter = Math.hypot(dx, dy);
      if (distanceFromCenter === 0) {
        return undefined;
      }

      const snapDistance = Math.abs(distanceFromCenter - radius);
      return snapDistance <= tolerance
        ? {
            x: center.x + (dx / distanceFromCenter) * radius,
            y: center.y + (dy / distanceFromCenter) * radius,
            parentObjectIds: [circle.id],
            distance: snapDistance,
          }
        : undefined;
    })
    .filter(
      (candidate): candidate is { x: number; y: number; parentObjectIds: string[]; distance: number } =>
        Boolean(candidate),
    );

  return [...lineSnaps, ...circleSnaps].sort((a, b) => a.distance - b.distance)[0];
}

export function nextPointLabel(objects: GeometryObject[], sequence: Iterable<string> = "CDEFGHIJKLMNOPQRSTUVWXYZ"): string {
  const usedLabels = new Set(allPoints(objects).map((point) => point.label).filter(Boolean));
  for (const label of sequence) {
    if (!usedLabels.has(label)) {
      return label;
    }
  }
  return `P${allPoints(objects).length + 1}`;
}
