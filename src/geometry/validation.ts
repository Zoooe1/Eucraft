import type { GeometryObject, ValidationResult } from "./types";
import {
  allPoints,
  arePointsCollinear,
  getPoint,
  segmentExistsBetween,
} from "./operations";
import { circleUsingBase, resolveBook1Prop1Context } from "./objectResolution";

const A_ID = "A";
const B_ID = "B";

export function validateBook1Prop1(objects: GeometryObject[]): ValidationResult {
  const A = getPoint(objects, A_ID);
  const B = getPoint(objects, B_ID);
  const segmentAB = segmentExistsBetween(objects, A_ID, B_ID);

  if (!A || !B || !segmentAB) {
    return {
      success: false,
      message: "The given finite straight line AB is missing. Reset the proposition to restore the initial line.",
    };
  }

  const candidatePoints = allPoints(objects).filter((point) => point.id !== A_ID && point.id !== B_ID);
  const circleA = circleUsingBase(objects, A_ID, B_ID);
  const circleB = circleUsingBase(objects, B_ID, A_ID);
  const context = resolveBook1Prop1Context(objects);

  if (context) {
    return {
      success: true,
      message: "Construction complete. The triangle on AB is equilateral.",
      context,
    };
  }

  if (candidatePoints.length === 0) {
    return {
      success: false,
      message: circleA && circleB
        ? "You have not created the third vertex yet. Use the intersection tool where the two circles meet."
        : "Try using two circles with AB as the radius, then choose one of their intersections.",
    };
  }

  if (!circleA || !circleB) {
    return {
      success: false,
      message: "You need a third point that is the same distance from both A and B. The two AB-radius circles will show you where it can live.",
    };
  }

  const hasNonCollinearPoint = candidatePoints.some((point) => !arePointsCollinear(A, B, point));
  if (!hasNonCollinearPoint) {
    return {
      success: false,
      message: "Your third point lies on the given line. Select one of the circle intersections above or below AB.",
    };
  }

  const hasAnyConnectedCandidate = candidatePoints.some(
    (point) => segmentExistsBetween(objects, A_ID, point.id) || segmentExistsBetween(objects, B_ID, point.id),
  );

  if (!hasAnyConnectedCandidate) {
    return {
      success: false,
      message: "The triangle is not complete yet. Draw both sides from the new point back to A and B.",
    };
  }

  const hasMissingSide = candidatePoints.some(
    (point) =>
      !arePointsCollinear(A, B, point) &&
      (!segmentExistsBetween(objects, A_ID, point.id) || !segmentExistsBetween(objects, B_ID, point.id)),
  );

  if (hasMissingSide) {
    return {
      success: false,
      message: "The triangle is almost there. Draw both AC and BC with the straightedge.",
    };
  }

  return {
    success: false,
    message: "The three sides are not equal yet. Check that your circles use AB as their radius.",
  };
}
