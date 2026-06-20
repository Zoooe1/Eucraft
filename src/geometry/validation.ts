import { getEuclidProposition } from "../euclid/propositions";
import type { Circle, GeometryObject, Point, ReasoningRelation, Segment, ValidationResult } from "./types";
import {
  allCircles,
  allNamedPoints,
  allSegments,
  areDistancesEqual,
  arePointsCollinear,
  circleRadius,
  distance,
  getPoint,
  isPointBetween,
  segmentExistsBetween,
} from "./operations";
import {
  circleUsesRadiusSegment,
  dependsOnObject,
  objectWasCreatedByTheoremAction,
  pointHasIntersectionProvenance,
  pointIsIntersectionOf,
  segmentEndpointIsConstructed,
} from "./provenance";
import {
  circleUsingBase,
  resolveBook1Prop1Context,
  resolveBook1Prop10Context,
  resolveBook1Prop10Contexts,
  resolveBook1Prop11Context,
  resolveBook1Prop12Context,
  resolveBook1Prop15Context,
  resolveBook1Prop16Context,
  resolveBook1Prop17Context,
  resolveBook1Prop18Context,
  resolveBook1Prop20Context,
  resolveBook1Prop21Context,
  resolveBook1Prop24Context,
  resolveBook1Prop28Context,
  resolveBook1Prop30Context,
  resolveBook1Prop31Context,
  resolveBook1Prop32Context,
  resolveBook1Prop33Context,
  resolveBook1Prop34Context,
  resolveBook1Prop35Context,
  resolveBook1Prop36Context,
  resolveBook1Prop37Context,
  resolveBook1Prop38Context,
  resolveBook1Prop41Context,
  resolveBook1Prop42Context,
  resolveBook1Prop43Context,
  resolveBook1Prop3Context,
  resolveBook1Prop4Context,
  resolveBook1Prop5Context,
  resolveBook1Prop6Context,
  resolveBook1Prop7Context,
  resolveBook1Prop8Context,
  resolveBook1Prop9Context,
  resolveBook1Prop9Contexts,
} from "./objectResolution";
import type { ProofContext } from "./types";

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

function validateExtendedBook1Proposition(
  propositionId: string,
  objects: GeometryObject[],
  completedActionIds: string[] = [],
  reasoningRelations: ReasoningRelation[] = [],
): ValidationResult {
  const proposition = getEuclidProposition(propositionId);
  const type = proposition?.type ?? "theorem";
  const isConstruction = type === "construction";
  const isCapstone = type === "pythagorean-theorem" || type === "converse-theorem";
  const minimumUserActions =
    proposition?.validationGoal.minimumUserActions ??
    proposition?.requiredUserActions?.filter((action) => !action.optional).map((action) => action.id) ??
    [];
  const missingActions = minimumUserActions.filter((actionId) => !completedActionIds.includes(actionId));
  if (missingActions.length > 0) {
    const nextAction = proposition?.requiredUserActions?.find((action) => action.id === missingActions[0]);
    return {
      success: false,
      message: nextAction
        ? `Finish the challenge move first: ${nextAction.description}`
        : "Finish the challenge moves before revealing the Logic Replay.",
      context: genericProofContext(objects),
    };
  }

  const minimumConstructedObjects = proposition?.validationGoal.minimumConstructedObjects ?? 0;
  const constructedObjectCount = objects.filter((object) => {
    if (object.type === "point") {
      return object.createdBy !== "given";
    }

    if (object.type === "segment") {
      return !object.given && object.source !== "given";
    }

    return true;
  }).length;
  if (constructedObjectCount < minimumConstructedObjects) {
    return {
      success: false,
      message: isConstruction || isCapstone
        ? "The starting diagram is only the givens. Add the missing construction objects on the canvas before checking."
        : "Add or trace the missing helper object before checking this theorem challenge.",
      context: genericProofContext(objects),
    };
  }

  if (propositionId === "I.15") {
    return validateBook1Prop15Selection(objects, completedActionIds);
  }

  if (propositionId === "I.17") {
    return validateBook1Prop17Construction(objects);
  }

  if (propositionId === "I.18") {
    return validateBook1Prop18Construction(objects);
  }

  if (propositionId === "I.20") {
    return validateBook1Prop20Construction(objects);
  }

  if (propositionId === "I.21") {
    return validateBook1Prop21Construction(objects);
  }

  if (propositionId === "I.28") {
    return validateBook1Prop28Selection(objects, completedActionIds);
  }

  if (propositionId === "I.30") {
    return validateBook1Prop30Construction(objects);
  }

  if (propositionId === "I.31") {
    return validateBook1Prop31Construction(objects);
  }

  if (propositionId === "I.32") {
    return validateBook1Prop32Construction(objects);
  }

  if (propositionId === "I.34") {
    return validateBook1Prop34Selection(objects, completedActionIds);
  }

  if (propositionId === "I.36") {
    return validateBook1Prop36Construction(objects, completedActionIds);
  }

  if (propositionId === "I.37") {
    return validateBook1Prop37Construction(objects);
  }

  if (propositionId === "I.38") {
    return validateBook1Prop38Construction(objects);
  }

  if (propositionId === "I.41") {
    return validateBook1Prop41Construction(objects);
  }

  if (propositionId === "I.42") {
    return validateBook1Prop42Construction(objects);
  }

  if (propositionId === "I.43") {
    return validateBook1Prop43Selection(objects, completedActionIds);
  }

  const congruenceValidation = validateExtendedCongruenceProposition(propositionId, objects, reasoningRelations);
  if (congruenceValidation) {
    return congruenceValidation;
  }

  return {
    success: true,
    message: isConstruction
      ? "Challenge complete. Now Logic Replay will explain why your construction works."
      : isCapstone
        ? "Capstone challenge complete. Logic Replay will unfold the area argument."
        : "The theorem challenge is solved. Logic Replay is unlocked.",
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

  const context = resolveBook1Prop2RoleContext(objects, segmentBC);
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

const I2_LENGTH_TOLERANCE = 8;
const I2_COLLINEAR_TOLERANCE = 0.025;
const I2_EXTENSION_TOLERANCE = 0.04;

function otherEndpointId(segment: Segment, pointId: string): string | undefined {
  return segment.p1 === pointId ? segment.p2 : segment.p2 === pointId ? segment.p1 : undefined;
}

function constructedRolePoint(objects: GeometryObject[], point: Point | undefined): point is Point {
  void objects;
  return Boolean(
    point &&
      point.createdBy &&
      point.createdBy !== "given" &&
      point.createdBy !== "free" &&
      point.createdBy !== "free-point" &&
      point.source !== "given",
  );
}

function pointOnCircle(objects: GeometryObject[], point: Point, circle: Circle): boolean {
  const center = getPoint(objects, circle.center);
  return Boolean(center && areDistancesEqual(distance(center, point), circleRadius(circle, objects), I2_LENGTH_TOLERANCE));
}

function producedRayParameter(from: Point, through: Point, point: Point): number | undefined {
  if (!arePointsCollinear(from, through, point, I2_COLLINEAR_TOLERANCE)) {
    return undefined;
  }

  const rayX = through.x - from.x;
  const rayY = through.y - from.y;
  const lengthSquared = rayX * rayX + rayY * rayY;
  if (lengthSquared === 0) {
    return undefined;
  }

  return ((point.x - from.x) * rayX + (point.y - from.y) * rayY) / lengthSquared;
}

function pointOnProducedRay(from: Point, through: Point, point: Point): boolean {
  const parameter = producedRayParameter(from, through, point);
  return parameter !== undefined && parameter >= 1 - I2_EXTENSION_TOLERANCE && distance(through, point) > I2_LENGTH_TOLERANCE;
}

function pointParents(point: Point): string[] {
  return [...new Set([...(point.parentObjectIds ?? []), ...(point.dependencies ?? [])])];
}

function rolePointRecognizesCircleAndLine(
  objects: GeometryObject[],
  point: Point,
  circleId: string,
  lineId: string | undefined,
): boolean {
  if (!constructedRolePoint(objects, point)) {
    return false;
  }

  if (lineId && pointIsIntersectionOf(objects, point.id, circleId, lineId)) {
    return true;
  }

  if (pointHasIntersectionProvenance(point)) {
    return true;
  }

  const parents = pointParents(point);
  if (parents.includes(circleId) || (lineId && parents.includes(lineId))) {
    return true;
  }

  return point.createdBy === "snap" || point.createdBy === "theorem-action" || point.createdBy === "intersection";
}

function circleUsesPointAsRadius(objects: GeometryObject[], circle: Circle, pointId: string): boolean {
  return (
    circle.through === pointId ||
    circle.radiusSegment?.p1 === pointId ||
    circle.radiusSegment?.p2 === pointId ||
    dependsOnObject(objects, circle.id, pointId)
  );
}

function circlesCenteredAtWithRadius(objects: GeometryObject[], centerId: string, radius: number) {
  return allCircles(objects).filter(
    (circle) =>
      circle.center === centerId &&
      areDistancesEqual(circleRadius(circle, objects), radius, I2_LENGTH_TOLERANCE),
  );
}

function i2EquilateralApexCandidates(objects: GeometryObject[], A: Point, B: Point, C: Point): Point[] {
  const abLength = distance(A, B);
  return allNamedPoints(objects).filter((point) => {
    if ([A.id, B.id, C.id].includes(point.id) || !constructedRolePoint(objects, point)) {
      return false;
    }

    const segmentAD = segmentExistsBetween(objects, A.id, point.id);
    const segmentBD = segmentExistsBetween(objects, B.id, point.id);
    if (!segmentAD || !segmentBD || arePointsCollinear(A, B, point, I2_COLLINEAR_TOLERANCE)) {
      return false;
    }

    const hasConstructionProvenance = pointHasIntersectionProvenance(point) || objectWasCreatedByTheoremAction(point);
    const hasEquilateralGeometry =
      areDistancesEqual(distance(A, point), abLength, I2_LENGTH_TOLERANCE) &&
      areDistancesEqual(distance(B, point), abLength, I2_LENGTH_TOLERANCE);

    return hasConstructionProvenance && hasEquilateralGeometry;
  });
}

function i2FinalSegmentFromA(objects: GeometryObject[], endpointId: string, bcLength: number): Segment | undefined {
  return allSegments(objects).find((segment) => {
    const otherId = otherEndpointId(segment, "A");
    if (otherId !== endpointId) {
      return false;
    }

    const endpoint = getPoint(objects, endpointId);
    const A = getPoint(objects, "A");
    return Boolean(A && endpoint && areDistancesEqual(distance(A, endpoint), bcLength, I2_LENGTH_TOLERANCE));
  });
}

function resolveBook1Prop2TheoremActionContext(objects: GeometryObject[], segmentBC: Segment): ProofContext | undefined {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  if (!A || !B || !C) {
    return undefined;
  }

  const bcLength = distance(B, C);
  for (const segment of allSegments(objects)) {
    if (!objectWasCreatedByTheoremAction(segment, "I.2")) {
      continue;
    }

    const endpointId = otherEndpointId(segment, "A");
    const endpoint = endpointId ? getPoint(objects, endpointId) : undefined;
    if (
      endpoint &&
      areDistancesEqual(distance(A, endpoint), bcLength, I2_LENGTH_TOLERANCE) &&
      segmentEndpointIsConstructed(objects, segment.id, endpoint.id)
    ) {
      return {
        pointA: "A",
        pointB: "B",
        pointC: "C",
        pointL: endpoint.id,
        segmentBC: segmentBC.id,
        segmentAL: segment.id,
      };
    }
  }

  return undefined;
}

function resolveBook1Prop2RoleContext(objects: GeometryObject[], segmentBC: Segment): ProofContext | undefined {
  const directTheoremAction = resolveBook1Prop2TheoremActionContext(objects, segmentBC);
  if (directTheoremAction) {
    return directTheoremAction;
  }

  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !C) {
    return undefined;
  }

  const bcLength = distance(B, C);
  const circleBCandidates = allCircles(objects).filter(
    (circle) =>
      circle.center === "B" &&
      circleUsesRadiusSegment(objects, circle.id, segmentBC.id) &&
      areDistancesEqual(circleRadius(circle, objects), bcLength, I2_LENGTH_TOLERANCE),
  );
  if (circleBCandidates.length === 0) {
    return undefined;
  }

  for (const D of i2EquilateralApexCandidates(objects, A, B, C)) {
    const segmentAD = segmentExistsBetween(objects, "A", D.id);
    const segmentBD = segmentExistsBetween(objects, "B", D.id);
    if (!segmentAD || !segmentBD) {
      continue;
    }

    for (const circleB of circleBCandidates) {
      const GCandidates = allNamedPoints(objects).filter((point) => {
        if ([A.id, B.id, C.id, D.id].includes(point.id)) {
          return false;
        }

        return (
          pointOnProducedRay(D, B, point) &&
          pointOnCircle(objects, point, circleB) &&
          rolePointRecognizesCircleAndLine(objects, point, circleB.id, segmentBD.id)
        );
      });

      for (const G of GCandidates) {
        const circleDCandidates = circlesCenteredAtWithRadius(objects, D.id, distance(D, G)).filter(
          (circle) => circleUsesPointAsRadius(objects, circle, G.id),
        );

        for (const circleD of circleDCandidates) {
          const LCandidates = allNamedPoints(objects).filter((point) => {
            if ([A.id, B.id, C.id, D.id, G.id].includes(point.id)) {
              return false;
            }

            const finalSegment = i2FinalSegmentFromA(objects, point.id, bcLength);
            return (
              Boolean(finalSegment) &&
              pointOnProducedRay(D, A, point) &&
              pointOnCircle(objects, point, circleD) &&
              rolePointRecognizesCircleAndLine(objects, point, circleD.id, segmentAD.id) &&
              finalSegment !== undefined &&
              constructedRolePoint(objects, point)
            );
          });

          for (const L of LCandidates) {
            const segmentAL = i2FinalSegmentFromA(objects, L.id, bcLength);
            if (!segmentAL) {
              continue;
            }

            const segmentBG = segmentExistsBetween(objects, B.id, G.id);
            const segmentDG = segmentExistsBetween(objects, D.id, G.id);
            const segmentDL = segmentExistsBetween(objects, D.id, L.id);

            return {
              pointA: A.id,
              pointB: B.id,
              pointC: C.id,
              pointD: D.id,
              pointG: G.id,
              pointL: L.id,
              segmentAB: segmentAB?.id,
              segmentBC: segmentBC.id,
              segmentAD: segmentAD.id,
              segmentBD: segmentBD.id,
              segmentBG: segmentBG?.id,
              segmentDG: segmentDG?.id,
              segmentDL: segmentDL?.id,
              segmentAL: segmentAL.id,
              circleB: circleB.id,
              circleD: circleD.id,
            };
          }
        }
      }
    }
  }

  return undefined;
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
    message: "Use Copy Length with source CD, start at A, and target AB to place E on AB.",
  };
}

export function validateBook1Prop4(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop4Context(objects);
  if (context) {
    return {
      success: true,
      message: "The triangles coincide. The SAS proof is ready for Logic Replay.",
      context,
    };
  }

  return {
    success: false,
    message: "Move and rotate triangle ABC until A, B, and C land on D, E, and F.",
  };
}

function missingAction(completedActionIds: string[], actionIds: string[]) {
  return actionIds.find((actionId) => !completedActionIds.includes(actionId));
}

type CongruencePointPair = [string, string];

function contextPointIds(context: ProofContext, keys: string[]) {
  const ids = keys.map((key) => context[key]);
  return ids.every((id): id is string => typeof id === "string" && id.length > 0) ? ids : undefined;
}

function relationMatchesCorrespondence(
  relation: ReasoningRelation,
  method: ReasoningRelation["method"],
  pairs: CongruencePointPair[],
) {
  if (relation.method !== method) {
    return false;
  }

  const forward = pairs.every(([left, right]) => relation.correspondence[left] === right);
  const reverse = pairs.every(([left, right]) => relation.correspondence[right] === left);
  return forward || reverse;
}

function hasTriangleCongruence(
  relations: ReasoningRelation[],
  method: ReasoningRelation["method"],
  pairs: CongruencePointPair[],
) {
  return relations.some((relation) => relationMatchesCorrespondence(relation, method, pairs));
}

function hasProp5RoleSASClaims(context: ProofContext, relations: ReasoningRelation[]) {
  const first = contextPointIds(context, ["pointA", "pointF", "pointC", "pointG", "pointB"]);
  const second = contextPointIds(context, ["pointB", "pointF", "pointC", "pointG"]);
  if (!first || !second) {
    return false;
  }

  const [A, F, C, G, B] = first;
  const [leftBase, leftExtension, rightBase, rightExtension] = second;
  const hasFirstClaim = hasTriangleCongruence(relations, "SAS", [
    [A, A],
    [F, G],
    [C, B],
  ]);
  const hasSecondClaim = hasTriangleCongruence(relations, "SAS", [
    [leftBase, rightBase],
    [leftExtension, rightExtension],
    [rightBase, leftBase],
  ]);

  return hasFirstClaim && hasSecondClaim;
}

function hasProp9RoleSSSClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointD", "pointA", "pointF", "pointE"]);
  if (!ids) {
    return false;
  }

  const [D, A, F, E] = ids;
  return hasTriangleCongruence(relations, "SSS", [
    [D, E],
    [A, A],
    [F, F],
  ]);
}

function hasProp10RoleSASClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointA", "pointC", "pointD", "pointB"]);
  if (!ids) {
    return false;
  }

  const [A, C, D, B] = ids;
  return hasTriangleCongruence(relations, "SAS", [
    [A, B],
    [C, C],
    [D, D],
  ]);
}

function prop10ContextFromSASRelation(objects: GeometryObject[], relation: ReasoningRelation): ProofContext | undefined {
  if (relation.method !== "SAS") {
    return undefined;
  }

  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const segmentAB = segmentExistsBetween(objects, "A", "B");
  if (!A || !B || !segmentAB) {
    return undefined;
  }

  const endpointsCorrespond =
    relation.correspondence[A.id] === B.id ||
    relation.correspondence[B.id] === A.id;
  if (!endpointsCorrespond) {
    return undefined;
  }

  const fixedPointIds = Object.entries(relation.correspondence)
    .filter(([sourceId, targetId]) => sourceId === targetId)
    .map(([sourceId]) => sourceId);
  const basePointId = fixedPointIds.find((pointId) => {
    if (pointId === A.id || pointId === B.id) {
      return false;
    }

    const point = getPoint(objects, pointId);
    return Boolean(point && isPointBetween(A, point, B));
  });
  if (!basePointId) {
    return undefined;
  }

  const apexId = fixedPointIds.find((pointId) => {
    if (pointId === basePointId || pointId === A.id || pointId === B.id) {
      return false;
    }

    const point = getPoint(objects, pointId);
    return Boolean(point && !isPointBetween(A, point, B));
  });
  if (!apexId) {
    return undefined;
  }

  return {
    pointA: A.id,
    pointB: B.id,
    pointC: apexId,
    pointD: basePointId,
    segmentAB: segmentAB.id,
    segmentAC: segmentExistsBetween(objects, A.id, apexId)?.id,
    segmentBC: segmentExistsBetween(objects, B.id, apexId)?.id,
    segmentCD: segmentExistsBetween(objects, apexId, basePointId)?.id,
    segmentAD: segmentExistsBetween(objects, A.id, basePointId)?.id,
    segmentBD: segmentExistsBetween(objects, B.id, basePointId)?.id,
  };
}

function hasProp11RoleSSSClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointD", "pointC", "pointF", "pointE"]);
  if (!ids) {
    return false;
  }

  const [D, C, F, E] = ids;
  return hasTriangleCongruence(relations, "SSS", [
    [D, E],
    [C, C],
    [F, F],
  ]);
}

function hasProp12RoleSSSClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointE", "pointC", "pointG", "pointF"]);
  if (!ids) {
    return false;
  }

  const [E, C, G, F] = ids;
  return hasTriangleCongruence(relations, "SSS", [
    [E, F],
    [C, C],
    [G, G],
  ]);
}

function hasProp16RoleSASClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointA", "pointB", "pointE", "pointC", "pointF"]);
  if (!ids) {
    return false;
  }

  const [A, B, E, C, F] = ids;
  return hasTriangleCongruence(relations, "SAS", [
    [A, C],
    [B, F],
    [E, E],
  ]);
}

function hasProp24RoleSASClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointA", "pointB", "pointC", "pointD", "pointE", "pointG"]);
  if (!ids) {
    return false;
  }

  const [A, B, C, D, E, G] = ids;
  return hasTriangleCongruence(relations, "SAS", [
    [A, D],
    [B, E],
    [C, G],
  ]);
}

function hasProp33RoleSASClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointA", "pointB", "pointC", "pointD"]);
  if (!ids) {
    return false;
  }

  const [A, B, C, D] = ids;
  return hasTriangleCongruence(relations, "SAS", [
    [A, D],
    [B, C],
    [C, B],
  ]);
}

function hasProp35RoleSASClaim(context: ProofContext, relations: ReasoningRelation[]) {
  const ids = contextPointIds(context, ["pointE", "pointA", "pointB", "pointF", "pointD", "pointC"]);
  if (!ids) {
    return false;
  }

  const [E, A, B, F, D, C] = ids;
  return hasTriangleCongruence(relations, "SAS", [
    [E, F],
    [A, D],
    [B, C],
  ]);
}

function validateExtendedCongruenceProposition(
  propositionId: string,
  objects: GeometryObject[],
  reasoningRelations: ReasoningRelation[],
): ValidationResult | undefined {
  if (propositionId === "I.11") {
    const context = resolveBook1Prop11Context(objects);
    if (context && hasProp11RoleSSSClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SSS proves the adjacent angles are equal, so the constructed line is at right angles to the given line.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SSS on the two triangles around the constructed perpendicular."
        : "Cut equal points on the given line, build the comparison triangle, and join its apex to the given point.",
      context: context ?? genericProofContext(objects),
    };
  }

  if (propositionId === "I.12") {
    const context = resolveBook1Prop12Context(objects);
    if (context && hasProp12RoleSSSClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SSS proves the dropped line is perpendicular.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SSS on the two triangles formed by the bisected chord and the external point."
        : "Cut the line with a circle from the external point, bisect the chord, and join the external point to the midpoint.",
      context: context ?? genericProofContext(objects),
    };
  }

  if (propositionId === "I.16") {
    const context = resolveBook1Prop16Context(objects);
    if (context && hasProp16RoleSASClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SAS proves the copied interior angle inside the exterior angle.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SAS on triangles ABE and CFE with E matched to itself."
        : "Bisect AC, join BE, extend BE past E, copy BE onto that extension, then join F to C.",
      context: context ?? genericProofContext(objects),
    };
  }

  if (propositionId === "I.24") {
    const context = resolveBook1Prop24Context(objects);
    if (context && hasProp24RoleSASClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SAS has matched the comparison triangle for the greater-angle proof.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SAS on the original triangle and the copied-angle triangle with the matching sides in order."
        : "Copy angle BAC at D, copy DF onto that ray, join the copied point to E and F, then use SAS.",
      context: context ?? genericProofContext(objects),
    };
  }

  if (propositionId === "I.33") {
    const context = resolveBook1Prop33Context(objects);
    if (context && hasProp33RoleSASClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SAS proves the joining lines are equal, ready for the parallel conclusion.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SAS on triangles ABC and DCB with BC as the common side."
        : "Join B to C, then use the equal parallel givens to set up the SAS comparison.",
      context: context ?? genericProofContext(objects),
    };
  }

  if (propositionId === "I.35") {
    const context = resolveBook1Prop35Context(objects);
    if (context && hasProp35RoleSASClaim(context, reasoningRelations)) {
      return {
        success: true,
        message: "Construction complete. SAS has matched the equal triangles for the area subtraction proof.",
        context,
      };
    }

    return {
      success: false,
      message: context
        ? "Use SAS on triangles EAB and FDC with E matched to F, A to D, and B to C."
        : "Mark G at the intersection of EB and DC, then use SAS on triangles EAB and FDC.",
      context: context ?? genericProofContext(objects),
    };
  }

  return undefined;
}

function validateBook1Prop15Selection(objects: GeometryObject[], completedActionIds: string[]): ValidationResult {
  const context = resolveBook1Prop15Context(objects);
  const selectedPair = completedActionIds.includes("prop15-select-vertical-pair");
  if (context && selectedPair) {
    return {
      success: true,
      message: "Vertical opposite angles selected. The proof can subtract the common adjacent angle.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Select the vertical angle pair CEA and BED."
      : "The crossing lines must meet at E, with A-E-B and C-E-D collinear.",
    context: context ?? genericProofContext(objects),
  };
}

function validateBook1Prop17Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop17Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The exterior angle at C is ready for the I.16 comparison.",
        context,
      }
    : {
        success: false,
        message: "Extend BC past C and place D on the extension so exterior angle ACD is formed.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop18Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop18Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. AD has been copied from AB on the greater side AC, and BD is joined.",
        context,
      }
    : {
        success: false,
        message: "Copy AB from A onto AC to place D, then join B to D.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop20Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop20Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. BA is extended, AD equals AC, and DC is joined.",
        context,
      }
    : {
        success: false,
        message: "Extend BA beyond A, copy AC from A onto that extension as D, then join D to C.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop21Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop21Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. BD has been extended to meet AC at E.",
        context,
      }
    : {
        success: false,
        message: "Extend BD through the interior point D until it meets AC, then mark the intersection E.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop28Selection(objects: GeometryObject[], completedActionIds: string[]): ValidationResult {
  const context = resolveBook1Prop28Context(objects);
  const selectedCondition = completedActionIds.includes("prop28-select-angle-condition");
  if (context && selectedCondition) {
    return {
      success: true,
      message: "Angle condition selected. The proof can reduce it to alternate interior angles.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Select the target parallel lines, transversal EF, and one valid Prop. 28 angle condition."
      : "The diagram needs AB and CD cut by EF at G and H, with A-G-B, C-H-D, and E-G-H-F collinear.",
    context: context ?? genericProofContext(objects),
  };
}

function validateBook1Prop30Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop30Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. One transversal now cuts all three parallel givens.",
        context,
      }
    : {
        success: false,
        message: "Draw one transversal through AB, EF, and CD, then mark its three intersections G, H, and K.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop31Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop31Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The copied alternate angle determines the parallel through A.",
        context,
      }
    : {
        success: false,
        message: "Choose D on BC, join AD, copy angle ADC at A, and extend the copied ray through A.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop32Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop32Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The exterior angle and the parallel through C are ready for the angle-sum proof.",
        context,
      }
    : {
        success: false,
        message: "Extend BC past C to D, then draw CE through C parallel to AB.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop34Selection(objects: GeometryObject[], completedActionIds: string[]): ValidationResult {
  const context = resolveBook1Prop34Context(objects);
  const selectedMatch = completedActionIds.includes("prop34-use-asa-aas");
  if (context && selectedMatch) {
    return {
      success: true,
      message: "ASA/AAS match identified. The proof can derive the opposite sides, angles, and diagonal halves.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Use the workspace action to identify the ASA/AAS match between triangles ABC and DCB."
      : "Draw diagonal BC in parallelogram ACDB before identifying the triangle match.",
    context: context ?? genericProofContext(objects),
  };
}

function validateBook1Prop36Construction(objects: GeometryObject[], completedActionIds: string[]): ValidationResult {
  const context = resolveBook1Prop36Context(objects);
  const usedProp33 = completedActionIds.includes("prop36-use-prop33");
  if (context && usedProp33) {
    return {
      success: true,
      message: "Construction complete. EBCH has been recognized as the comparison parallelogram.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Use the Prop. 33 workspace action to recognize EBCH as a parallelogram."
      : "Draw BE and CH between the equal-base parallelograms.",
    context: context ?? genericProofContext(objects),
  };
}

function validateBook1Prop37Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop37Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The two same-base triangles have been completed into parallelograms.",
        context,
      }
    : {
        success: false,
        message: "Draw BE through B parallel to CA and CF through C parallel to BD.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop38Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop38Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The equal-base triangles have been completed into parallelograms.",
        context,
      }
    : {
        success: false,
        message: "Draw BG through B parallel to CA and FH through F parallel to DE.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop41Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop41Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The diagonal AC is ready for the double-area proof.",
        context,
      }
    : {
        success: false,
        message: "Draw diagonal AC in the parallelogram.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop42Construction(objects: GeometryObject[]): ValidationResult {
  const context = resolveBook1Prop42Context(objects);
  return context
    ? {
        success: true,
        message: "Construction complete. The parallelogram FECG has the copied angle and the required area setup.",
        context,
      }
    : {
        success: false,
        message: "Bisect BC at E, join AE, copy the given angle at E, then draw the two parallels to form FECG.",
        context: genericProofContext(objects),
      };
}

function validateBook1Prop43Selection(objects: GeometryObject[], completedActionIds: string[]): ValidationResult {
  const context = resolveBook1Prop43Context(objects);
  const selectedComplements = completedActionIds.includes("prop43-select-complements");
  if (context && selectedComplements) {
    return {
      success: true,
      message: "Complements BK and KD selected. The proof can subtract equal small triangles from equal large halves.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Select complements BK and KD as the target equal regions."
      : "Inspect the parallelogram, its diagonal AC, the two inner parallelograms about K, and the two complements.",
    context: context ?? genericProofContext(objects),
  };
}

export function validateBook1Prop5(
  objects: GeometryObject[],
  completedActionIds: string[] = [],
  reasoningRelations: ReasoningRelation[] = [],
): ValidationResult {
  const context = resolveBook1Prop5Context(objects);
  void completedActionIds;
  if (context && hasProp5RoleSASClaims(context, reasoningRelations)) {
    return {
      success: true,
      message: "Construction complete. The two SAS claims are ready for the isosceles proof.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Use SAS to record the two role-matched triangle congruence claims."
      : "Extend AB and AC, place F and G with AG = AF, then join FC and GB.",
  };
}

export function validateBook1Prop6(objects: GeometryObject[], completedActionIds: string[] = []): ValidationResult {
  const context = resolveBook1Prop6Context(objects);
  const missing = missingAction(completedActionIds, ["prop6-assume-ab-greater", "prop6-use-cut-equal", "prop6-cut-db-ac"]);
  if (context && !missing) {
    return {
      success: true,
      message: "Contradiction construction complete. Order the proof to collapse the assumption.",
      context,
    };
  }

  return {
    success: false,
    message: missing
      ? "Enter the assumption mode, use Copy Length, and copy AC onto AB from B."
      : "Join D to C after cutting DB equal to AC.",
  };
}

export function validateBook1Prop7(objects: GeometryObject[], completedActionIds: string[] = []): ValidationResult {
  const context = resolveBook1Prop7Context(objects);
  const missing = missingAction(completedActionIds, ["prop7-no-such-d"]);
  if (context && !missing) {
    return {
      success: true,
      message: "No such same-side point D can exist. The contradiction is ready for proof.",
      context,
    };
  }

  return {
    success: false,
    message: context
      ? "Use the canvas claim to state that no such D exists."
      : "C and D must be distinct points on the same side of AB with AC, BC, AD, BD, and CD drawn.",
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

export function validateBook1Prop9(
  objects: GeometryObject[],
  completedActionIds: string[] = [],
  reasoningRelations: ReasoningRelation[] = [],
): ValidationResult {
  const contexts = resolveBook1Prop9Contexts(objects);
  const completedContext = contexts.find((candidateContext) => hasProp9RoleSSSClaim(candidateContext, reasoningRelations));
  const context = completedContext ?? contexts[0] ?? resolveBook1Prop9Context(objects);
  void completedActionIds;
  if (completedContext) {
    return {
      success: true,
      message: "Construction complete. SSS proves the angle has been bisected.",
      context: completedContext,
    };
  }

  return {
    success: false,
    message: context
      ? "Use SSS on the two triangles sharing the proposed bisecting ray."
      : "Choose D on AB, cut E on AC so AE = AD, join DE, build equilateral DEF, then join A to F.",
  };
}

export function validateBook1Prop10(
  objects: GeometryObject[],
  completedActionIds: string[] = [],
  reasoningRelations: ReasoningRelation[] = [],
): ValidationResult {
  const contexts = resolveBook1Prop10Contexts(objects);
  const completedContext =
    reasoningRelations.map((relation) => prop10ContextFromSASRelation(objects, relation)).find(Boolean) ??
    contexts.find((candidateContext) => hasProp10RoleSASClaim(candidateContext, reasoningRelations));
  const context = completedContext ?? contexts[0] ?? resolveBook1Prop10Context(objects);
  void completedActionIds;
  if (completedContext) {
    return {
      success: true,
      message: "Construction complete. SAS proves the finite straight-line has been bisected.",
      context: completedContext,
    };
  }

  return {
    success: false,
    message: context
      ? "Use SAS on the two triangles formed by the bisecting line."
      : "Build an equilateral triangle on AB, bisect its top angle, and mark where that line meets AB.",
  };
}

export function validateProposition(
  propositionId: string,
  objects: GeometryObject[],
  completedActionIds: string[] = [],
  reasoningRelations: ReasoningRelation[] = [],
): ValidationResult {
  const propositionNumber = Number(propositionId.split(".")[1]);
  if (propositionNumber >= 11) {
    return validateExtendedBook1Proposition(propositionId, objects, completedActionIds, reasoningRelations);
  }

  switch (propositionId) {
    case "I.2":
      return validateBook1Prop2(objects);
    case "I.3":
      return validateBook1Prop3(objects);
    case "I.4":
      return validateBook1Prop4(objects);
    case "I.5":
      return validateBook1Prop5(objects, completedActionIds, reasoningRelations);
    case "I.6":
      return validateBook1Prop6(objects, completedActionIds);
    case "I.7":
      return validateBook1Prop7(objects, completedActionIds);
    case "I.8":
      return validateBook1Prop8(objects);
    case "I.9":
      return validateBook1Prop9(objects, completedActionIds, reasoningRelations);
    case "I.10":
      return validateBook1Prop10(objects, completedActionIds, reasoningRelations);
    default:
      return validateBook1Prop1(objects);
  }
}
