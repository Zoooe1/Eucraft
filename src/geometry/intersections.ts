import type { Circle, ExtendedLine, GeometryObject, Point, Segment } from "./types";
import { allCircles, allExtendedLines, allSegments, circleRadius, distance, getPoint } from "./operations";

type LineObject = Segment | ExtendedLine;

export type CircleIntersection = {
  x: number;
  y: number;
  objects: [Circle, Circle] | [Circle, LineObject] | [LineObject, LineObject];
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

function parameterWithinLineObject(line: LineObject, t: number) {
  if (line.type === "segment") {
    return line.given ? t >= -0.001 && t <= 1.001 : true;
  }

  return true;
}

export function circleLineIntersections(
  circle: Circle,
  line: LineObject,
  objects: GeometryObject[],
): CircleIntersection[] {
  const center = getPoint(objects, circle.center);
  const p1 = getPoint(objects, line.type === "segment" ? line.p1 : line.from);
  const p2 = getPoint(objects, line.type === "segment" ? line.p2 : line.through);
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
    return parameterWithinLineObject(line, t)
      ? [{ x: p1.x + t * dx, y: p1.y + t * dy, objects: [circle, line] }]
      : [];
  }

  const root = Math.sqrt(Math.max(discriminant, 0));
  const t1 = (-b + root) / (2 * a);
  const t2 = (-b - root) / (2 * a);
  return [t1, t2]
    .filter((t) => parameterWithinLineObject(line, t))
    .map((t) => ({ x: p1.x + t * dx, y: p1.y + t * dy, objects: [circle, line] }));
}

export function lineLineIntersection(
  line1: LineObject,
  line2: LineObject,
  objects: GeometryObject[],
): CircleIntersection[] {
  const a1 = getPoint(objects, line1.type === "segment" ? line1.p1 : line1.from);
  const a2 = getPoint(objects, line1.type === "segment" ? line1.p2 : line1.through);
  const b1 = getPoint(objects, line2.type === "segment" ? line2.p1 : line2.from);
  const b2 = getPoint(objects, line2.type === "segment" ? line2.p2 : line2.through);

  if (!a1 || !a2 || !b1 || !b2) {
    return [];
  }

  const aDx = a2.x - a1.x;
  const aDy = a2.y - a1.y;
  const bDx = b2.x - b1.x;
  const bDy = b2.y - b1.y;
  const determinant = aDx * bDy - aDy * bDx;

  if (Math.abs(determinant) < 0.001) {
    return [];
  }

  const t = ((b1.x - a1.x) * bDy - (b1.y - a1.y) * bDx) / determinant;
  const u = ((b1.x - a1.x) * aDy - (b1.y - a1.y) * aDx) / determinant;
  if (!parameterWithinLineObject(line1, t) || !parameterWithinLineObject(line2, u)) {
    return [];
  }

  return [{ x: a1.x + t * aDx, y: a1.y + t * aDy, objects: [line1, line2] }];
}

export function allIntersections(objects: GeometryObject[]): CircleIntersection[] {
  const circles = allCircles(objects);
  const lines: LineObject[] = [...allSegments(objects), ...allExtendedLines(objects)];
  const intersections: CircleIntersection[] = [];

  for (let i = 0; i < circles.length; i += 1) {
    for (let j = i + 1; j < circles.length; j += 1) {
      intersections.push(...circleCircleIntersections(circles[i], circles[j], objects));
    }
  }

  for (const circle of circles) {
    for (const line of lines) {
      intersections.push(...circleLineIntersections(circle, line, objects));
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      intersections.push(...lineLineIntersection(lines[i], lines[j], objects));
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
  return allIntersections(objects)
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
