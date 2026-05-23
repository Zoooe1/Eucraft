import type { Circle, GeometryObject, Point, Segment } from "./types";

export const POINT_TOLERANCE = 14;
export const INTERSECTION_TOLERANCE = 40;
export const EQUALITY_TOLERANCE = 5;
export const COLLINEAR_TOLERANCE = 0.015;

export function isPoint(object: GeometryObject): object is Point {
  return object.type === "point";
}

export function isSegment(object: GeometryObject): object is Segment {
  return object.type === "segment";
}

export function isCircle(object: GeometryObject): object is Circle {
  return object.type === "circle";
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

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function circleRadius(circle: Circle, objects: GeometryObject[]): number {
  const center = getPoint(objects, circle.center);
  const through = getPoint(objects, circle.through);
  if (!center || !through) {
    return 0;
  }
  return distance(center, through);
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

export function segmentExistsBetween(objects: GeometryObject[], p1: string, p2: string): Segment | undefined {
  return allSegments(objects).find(
    (segment) => (segment.p1 === p1 && segment.p2 === p2) || (segment.p1 === p2 && segment.p2 === p1),
  );
}

export function circleExists(objects: GeometryObject[], center: string, through: string): Circle | undefined {
  return allCircles(objects).find((circle) => circle.center === center && circle.through === through);
}

export function createSegment(p1: string, p2: string, color?: string): Segment {
  const id = `segment-${p1}-${p2}-${crypto.randomUUID().slice(0, 6)}`;
  const label = /^[A-Z]$/.test(p1) && /^[A-Z]$/.test(p2) ? `${p1}${p2}` : undefined;
  return { id, type: "segment", p1, p2, label, color };
}

export function createCircle(center: string, through: string, color?: string): Circle {
  const id = `circle-${center}-${through}-${crypto.randomUUID().slice(0, 6)}`;
  const label = /^[A-Z]$/.test(center) && /^[A-Z]$/.test(through) ? `${center}${through}` : undefined;
  return { id, type: "circle", center, through, label, color };
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

export function nextPointLabel(objects: GeometryObject[], sequence: Iterable<string> = "CDEFGHIJKLMNOPQRSTUVWXYZ"): string {
  const usedLabels = new Set(allPoints(objects).map((point) => point.label).filter(Boolean));
  for (const label of sequence) {
    if (!usedLabels.has(label)) {
      return label;
    }
  }
  return `P${allPoints(objects).length + 1}`;
}
