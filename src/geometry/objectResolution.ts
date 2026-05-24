import type { GeometryObject, ProofContext } from "./types";
import {
  allCircles,
  allNamedPoints,
  allPoints,
  allSegments,
  areDistancesEqual,
  arePointsCollinear,
  circleRadius,
  circleExists,
  distance,
  getPoint,
  segmentExistsBetween,
} from "./operations";

const A_ID = "A";
const B_ID = "B";

export function circleUsingBase(objects: GeometryObject[], center: string, through: string) {
  const exact = circleExists(objects, center, through);
  if (exact) {
    return exact;
  }

  const centerPoint = getPoint(objects, center);
  const throughPoint = getPoint(objects, through);
  if (!centerPoint || !throughPoint) {
    return undefined;
  }

  const baseRadius = distance(centerPoint, throughPoint);
  return allCircles(objects).find((circle) => {
    if (circle.center !== center) {
      return false;
    }

    return areDistancesEqual(circleRadius(circle, objects), baseRadius);
  });
}

export function resolveBook1Prop1Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, A_ID);
  const B = getPoint(objects, B_ID);
  const segmentAB = segmentExistsBetween(objects, A_ID, B_ID);

  if (!A || !B || !segmentAB) {
    return undefined;
  }

  const circleA = circleUsingBase(objects, A_ID, B_ID);
  const circleB = circleUsingBase(objects, B_ID, A_ID);
  const AB = distance(A, B);
  const candidatePoints = allNamedPoints(objects).filter((point) => point.id !== A_ID && point.id !== B_ID);

  for (const C of candidatePoints) {
    const segmentAC = segmentExistsBetween(objects, A_ID, C.id);
    const segmentBC = segmentExistsBetween(objects, B_ID, C.id);
    const AC = distance(A, C);
    const BC = distance(B, C);

    if (arePointsCollinear(A, B, C) || !segmentAC || !segmentBC) {
      continue;
    }

    if (areDistancesEqual(AB, AC) && areDistancesEqual(AB, BC)) {
      return {
        A: A_ID,
        B: B_ID,
        C: C.id,
        pointA: A_ID,
        pointB: B_ID,
        pointC: C.id,
        segmentAB: segmentAB.id,
        segmentAC: segmentAC.id,
        segmentBC: segmentBC.id,
        circleA: circleA?.id,
        circleB: circleB?.id,
      };
    }
  }

  return undefined;
}

function segmentWithLengthFrom(
  objects: GeometryObject[],
  pointId: string,
  targetLength: number,
  excludeIds: string[] = [],
  allowAuxiliary = false,
) {
  const origin = getPoint(objects, pointId);
  if (!origin) {
    return undefined;
  }

  return allSegments(objects)
    .map((segment) => {
      const otherId = segment.p1 === pointId ? segment.p2 : segment.p2 === pointId ? segment.p1 : undefined;
      const other = otherId ? getPoint(objects, otherId) : undefined;
      return other && (allowAuxiliary || !other.auxiliary) && !excludeIds.includes(other.id) ? { segment, other } : undefined;
    })
    .filter(Boolean)
    .find((entry) => entry && areDistancesEqual(distance(origin, entry.other), targetLength));
}

function pointOnSegmentLineBetween(objects: GeometryObject[], pointId: string, lineStartId: string, lineEndId: string) {
  const point = getPoint(objects, pointId);
  const start = getPoint(objects, lineStartId);
  const end = getPoint(objects, lineEndId);
  if (!point || !start || !end) {
    return false;
  }

  const withinX = point.x >= Math.min(start.x, end.x) - 2 && point.x <= Math.max(start.x, end.x) + 2;
  const withinY = point.y >= Math.min(start.y, end.y) - 2 && point.y <= Math.max(start.y, end.y) + 2;
  return !arePointsCollinear(start, end, point, 0.01) ? false : withinX && withinY;
}

export function resolveBook1Prop2Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");

  if (!A || !B || !C || !segmentBC) {
    return undefined;
  }

  const bcLength = distance(B, C);
  const final = segmentWithLengthFrom(objects, "A", bcLength, ["B", "C"], true);
  if (!final) {
    return undefined;
  }

  const D = allNamedPoints(objects).find((point) => {
    if (["A", "B", "C", final.other.id].includes(point.id)) {
      return false;
    }
    return areDistancesEqual(distance(A, point), distance(A, B)) && areDistancesEqual(distance(B, point), distance(A, B));
  });
  const G = allNamedPoints(objects).find(
    (point) =>
      !["A", "B", "C", final.other.id, D?.id].includes(point.id) &&
      areDistancesEqual(distance(B, point), bcLength),
  );

  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentAD = D ? segmentExistsBetween(objects, "A", D.id) : undefined;
  const segmentBD = D ? segmentExistsBetween(objects, "B", D.id) : undefined;
  const segmentBG = G ? segmentExistsBetween(objects, "B", G.id) : undefined;
  const segmentDG = D && G ? segmentExistsBetween(objects, D.id, G.id) : undefined;
  const segmentDL = D ? segmentExistsBetween(objects, D.id, final.other.id) : undefined;
  const circleB = allCircles(objects).find((circle) => {
    return circle.center === "B" && areDistancesEqual(circleRadius(circle, objects), bcLength);
  });
  const circleD =
    D &&
    G &&
    allCircles(objects).find((circle) => {
      return circle.center === D.id && areDistancesEqual(circleRadius(circle, objects), distance(D, G));
    });

  return {
    pointA: "A",
    pointB: "B",
    pointC: "C",
    pointD: D?.id,
    pointG: G?.id,
    pointL: final.other.id,
    segmentAB: segmentAB?.id,
    segmentBC: segmentBC.id,
    segmentAD: segmentAD?.id,
    segmentBD: segmentBD?.id,
    segmentBG: segmentBG?.id,
    segmentDG: segmentDG?.id,
    segmentDL: segmentDL?.id,
    segmentAL: final.segment.id,
    circleB: circleB?.id,
    circleD: circleD?.id,
  };
}

export function resolveBook1Prop3Context(objects: GeometryObject[]): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");

  if (!A || !B || !C || !D || !segmentAB || !segmentCD) {
    return undefined;
  }

  const lesserLength = distance(C, D);
  if (distance(A, B) <= lesserLength) {
    return undefined;
  }

  const candidates = allPoints(objects).filter(
    (point) => !["A", "B", "C", "D"].includes(point.id) && pointOnSegmentLineBetween(objects, point.id, "A", "B"),
  );

  for (const E of candidates) {
    const segmentAE = segmentExistsBetween(objects, "A", E.id);
    if (!areDistancesEqual(distance(A, E), lesserLength)) {
      continue;
    }

    const P = allNamedPoints(objects).find(
      (point) =>
        !["A", "B", "C", "D", E.id].includes(point.id) &&
        areDistancesEqual(distance(A, point), lesserLength),
    );
    const segmentAP = P ? segmentExistsBetween(objects, "A", P.id) : undefined;
    const circleA = allCircles(objects).find((circle) => {
      return circle.center === "A" && areDistancesEqual(circleRadius(circle, objects), lesserLength);
    });

    return {
      pointA: "A",
      pointB: "B",
      pointC: "C",
      pointD: "D",
      pointE: E.id,
      pointP: P?.id ?? E.id,
      segmentAB: segmentAB.id,
      segmentCD: segmentCD.id,
      segmentAE: segmentAE?.id,
      segmentAP: segmentAP?.id ?? segmentAE?.id,
      circleA: circleA?.id,
    };
  }

  return undefined;
}
