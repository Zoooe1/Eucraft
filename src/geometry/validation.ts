import { getEuclidProposition } from "../euclid/propositions";
import type { GeometryObject, ValidationResult } from "./types";
import {
  allNamedPoints,
  arePointsCollinear,
  distance,
  getPoint,
  segmentExistsBetween,
} from "./operations";
import {
  circleUsingBase,
  resolveBook1Prop1Context,
  resolveBook1Prop10Context,
  resolveBook1Prop2Context,
  resolveBook1Prop3Context,
  resolveBook1Prop4Context,
  resolveBook1Prop5Context,
  resolveBook1Prop6Context,
  resolveBook1Prop7Context,
  resolveBook1Prop8Context,
  resolveBook1Prop9Context,
} from "./objectResolution";

const A_ID = "A";
const B_ID = "B";

function genericProofContext(objects: GeometryObject[]) {
  const context: Record<string, string> = {};

  for (const object of objects) {
    if (object.type === "point" && object.label) {
      context[`point${object.label}`] = object.id;
    }

    if (object.type === "segment") {
      const label = object.label ?? object.id;
      if (/^[A-Z]{2}$/.test(label)) {
        context[`segment${label}`] = object.id;
        context[`segment${label[1]}${label[0]}`] = object.id;
      }
    }

    if (object.type === "circle") {
      context[`circle${object.center}`] = object.id;
    }
  }

  return context;
}

function validateExtendedBook1Proposition(propositionId: string, objects: GeometryObject[]): ValidationResult {
  const proposition = getEuclidProposition(propositionId);
  const type = proposition?.type ?? "theorem";
  const isConstruction = type === "construction";
  const isCapstone = type === "pythagorean-theorem" || type === "converse-theorem";

  return {
    success: true,
    message: isConstruction
      ? "Guided construction accepted. Logic Replay will show the Euclidean construction and validation target."
      : isCapstone
        ? "Capstone theorem ready. Logic Replay will unfold the area argument."
        : "The theorem diagram is ready for Logic Replay.",
    context: genericProofContext(objects),
  };
}

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

  const candidatePoints = allNamedPoints(objects).filter((point) => point.id !== A_ID && point.id !== B_ID);
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

export function validateBook1Prop2(objects: GeometryObject[]): ValidationResult {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentBC = segmentExistsBetween(objects, "B", "C");

  if (!A || !B || !C || !segmentBC) {
    return {
      success: false,
      message: "The given point A and given straight-line BC are missing. Reset this proposition.",
    };
  }

  const context = resolveBook1Prop2Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. A straight-line equal to BC has been placed at A.",
      context,
    };
  }

  const hasSegmentFromA = objects.some((object) => object.type === "segment" && (object.p1 === "A" || object.p2 === "A"));
  if (!hasSegmentFromA) {
    return {
      success: false,
      message: "Begin at A. Place the straight-line from A whose length will match BC.",
    };
  }

  return {
    success: false,
    message: "The line placed at A is not equal to BC yet. Use the Prop. I.2 circle construction, then check again.",
  };
}

export function validateBook1Prop3(objects: GeometryObject[]): ValidationResult {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCD = segmentExistsBetween(objects, "C", "D");

  if (!A || !B || !C || !D || !segmentAB || !segmentCD) {
    return {
      success: false,
      message: "The given unequal straight-lines AB and CD are missing. Reset this proposition.",
    };
  }

  if (distance(A, B) <= distance(C, D)) {
    return {
      success: false,
      message: "AB must be the greater straight-line. Reset this proposition to restore the given lines.",
    };
  }

  const context = resolveBook1Prop3Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. A part equal to CD has been cut off from AB.",
      context,
    };
  }

  return {
    success: false,
    message: "Set the compass width to CD, draw from center A, then mark where the circle cuts AB.",
  };
}

export function validateBook1Prop4(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop4Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The SAS diagram is ready for Logic Replay.",
      context,
    };
  }

  return {
    success: false,
    message: "Complete both triangle bases, BC and EF, so the two SAS triangles can be compared.",
  };
}

export function validateBook1Prop5(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop5Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The equal sides have been produced for the isosceles proof.",
      context,
    };
  }

  return {
    success: false,
    message: "Extend the equal sides AB and AC beyond B and C, then check the theorem diagram.",
  };
}

export function validateBook1Prop6(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop6Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The equal-angle triangle is ready for the converse proof.",
      context,
    };
  }

  return {
    success: false,
    message: "Join A to B, A to C, and B to C to complete the triangle.",
  };
}

export function validateBook1Prop7(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop7Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The impossible second apex is ready to be tested.",
      context,
    };
  }

  return {
    success: false,
    message: "Join the two supposed meeting points C and D. The replay will show why they cannot both exist.",
  };
}

export function validateBook1Prop8(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop8Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The SSS diagram is ready for Logic Replay.",
      context,
    };
  }

  return {
    success: false,
    message: "Complete the two triangle bases BC and EF so all three matching sides are present.",
  };
}

export function validateBook1Prop9(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop9Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The angle has been bisected.",
      context,
    };
  }

  return {
    success: false,
    message: "Choose equal points D and E on the angle sides, build equilateral DEF, then join A to F.",
  };
}

export function validateBook1Prop10(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop10Context(objects);
  if (context) {
    return {
      success: true,
      message: "Construction complete. The finite straight-line has been bisected.",
      context,
    };
  }

  return {
    success: false,
    message: "Build an equilateral triangle on AB, bisect its top angle, and mark where that line meets AB.",
  };
}

export function validateProposition(propositionId: string, objects: GeometryObject[]): ValidationResult {
  const propositionNumber = Number(propositionId.split(".")[1]);
  if (propositionNumber >= 11) {
    return validateExtendedBook1Proposition(propositionId, objects);
  }

  switch (propositionId) {
    case "I.2":
      return validateBook1Prop2(objects);
    case "I.3":
      return validateBook1Prop3(objects);
    case "I.4":
      return validateBook1Prop4(objects);
    case "I.5":
      return validateBook1Prop5(objects);
    case "I.6":
      return validateBook1Prop6(objects);
    case "I.7":
      return validateBook1Prop7(objects);
    case "I.8":
      return validateBook1Prop8(objects);
    case "I.9":
      return validateBook1Prop9(objects);
    case "I.10":
      return validateBook1Prop10(objects);
    default:
      return validateBook1Prop1(objects);
  }
}
