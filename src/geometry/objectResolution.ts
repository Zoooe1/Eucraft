import type { GeometryObject, ProofContext } from "./types";
import {
  allCircles,
  allPoints,
  areDistancesEqual,
  arePointsCollinear,
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

    const radiusPoint = getPoint(objects, circle.through);
    return radiusPoint ? areDistancesEqual(distance(centerPoint, radiusPoint), baseRadius) : false;
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
  const candidatePoints = allPoints(objects).filter((point) => point.id !== A_ID && point.id !== B_ID);

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
