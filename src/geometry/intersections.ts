import type { Circle, GeometryObject, Point } from "./types";
import { allCircles, circleRadius, distance, getPoint } from "./operations";

export type CircleIntersection = {
  x: number;
  y: number;
  circles: [Circle, Circle];
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
    return [{ x: px, y: py, circles: [circle1, circle2] }];
  }

  return [
    { x: px + rx, y: py + ry, circles: [circle1, circle2] },
    { x: px - rx, y: py - ry, circles: [circle1, circle2] },
  ];
}

export function allCircleIntersections(objects: GeometryObject[]): CircleIntersection[] {
  const circles = allCircles(objects);
  const intersections: CircleIntersection[] = [];

  for (let i = 0; i < circles.length; i += 1) {
    for (let j = i + 1; j < circles.length; j += 1) {
      intersections.push(...circleCircleIntersections(circles[i], circles[j], objects));
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
