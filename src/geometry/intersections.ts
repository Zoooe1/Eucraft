import type { Circle, GeometryObject, Point, Segment } from "./types";
import { allCircles, allSegments, circleRadius, distance, getPoint } from "./operations";

export type CircleIntersection = {
  x: number;
  y: number;
  objects: [Circle, Circle] | [Circle, Segment];
};

export function circleCircleIntersections(
  circle1: Circle,
  circle2: Circle,
  objects: GeometryObject[],
): CircleIntersection[] {
  const c1 = getPoint(objects, circle1.center);
  const c2 = getPoint(objects, circle2.center);
  if (!c1 || !c2) {
    return [];
  }

  const r1 = circleRadius(circle1, objects);
  const r2 = circleRadius(circle2, objects);
  const d = distance(c1, c2);

  if (d === 0 || d > r1 + r2 || d < Math.abs(r1 - r2)) {
    return [];
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const hSquared = r1 * r1 - a * a;
  if (hSquared < -0.001) {
    return [];
  }

  const h = Math.sqrt(Math.max(hSquared, 0));
  const px = c1.x + (a * (c2.x - c1.x)) / d;
  const py = c1.y + (a * (c2.y - c1.y)) / d;
  const rx = -((c2.y - c1.y) * h) / d;
  const ry = ((c2.x - c1.x) * h) / d;

  if (h === 0) {
    return [{ x: px, y: py, objects: [circle1, circle2] }];
  }

  return [
    { x: px + rx, y: py + ry, objects: [circle1, circle2] },
    { x: px - rx, y: py - ry, objects: [circle1, circle2] },
  ];
}

export function circleLineIntersections(
  circle: Circle,
  segment: Segment,
  objects: GeometryObject[],
): CircleIntersection[] {
  const center = getPoint(objects, circle.center);
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!center || !p1 || !p2) {
    return [];
  }

  const radius = circleRadius(circle, objects);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lineLengthSquared = dx * dx + dy * dy;
  if (lineLengthSquared === 0 || radius === 0) {
    return [];
  }

  const fx = p1.x - center.x;
  const fy = p1.y - center.y;
  const a = lineLengthSquared;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < -0.001) {
    return [];
  }

  if (Math.abs(discriminant) <= 0.001) {
    const t = -b / (2 * a);
    return [{ x: p1.x + t * dx, y: p1.y + t * dy, objects: [circle, segment] }];
  }

  const root = Math.sqrt(Math.max(discriminant, 0));
  const t1 = (-b + root) / (2 * a);
  const t2 = (-b - root) / (2 * a);
  return [
    { x: p1.x + t1 * dx, y: p1.y + t1 * dy, objects: [circle, segment] },
    { x: p1.x + t2 * dx, y: p1.y + t2 * dy, objects: [circle, segment] },
  ];
}

export function allCircleIntersections(objects: GeometryObject[]): CircleIntersection[] {
  const circles = allCircles(objects);
  const segments = allSegments(objects);
  const intersections: CircleIntersection[] = [];

  for (let i = 0; i < circles.length; i += 1) {
    for (let j = i + 1; j < circles.length; j += 1) {
      intersections.push(...circleCircleIntersections(circles[i], circles[j], objects));
    }
  }

  for (const circle of circles) {
    for (const segment of segments) {
      intersections.push(...circleLineIntersections(circle, segment, objects));
    }
  }

  return intersections;
}

export function findNearbyIntersection(
  objects: GeometryObject[],
  x: number,
  y: number,
  tolerance: number,
): CircleIntersection | undefined {
  return allCircleIntersections(objects)
    .map((intersection) => ({ intersection, d: Math.hypot(intersection.x - x, intersection.y - y) }))
    .filter(({ d }) => d <= tolerance)
    .sort((a, b) => a.d - b.d)[0]?.intersection;
}

export function pointNearCoordinates(
  points: Point[],
  x: number,
  y: number,
  tolerance = 1,
): Point | undefined {
  return points.find((point) => Math.hypot(point.x - x, point.y - y) <= tolerance);
}
