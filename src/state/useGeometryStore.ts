import { create } from "zustand";
import type {
  AppPhase,
  GeometryObject,
  GeometryTool,
  GeometricRelation,
  ExtendedLine,
  Point,
  ProofContext,
  ReasoningRelation,
  Segment,
  ValidationResult,
} from "../geometry/types";
import {
  angleAt,
  arePointsCollinear,
  areAnglesEqual,
  areDistancesEqual,
  circleRadius,
  circleExists,
  createCircle,
  createCircleFromLength,
  createExtendedLine,
  createPoint,
  createSegment,
  distance,
  extendedLineExists,
  findNearbyObjectSnap,
  findNearbyPoint,
  findNearbySegment,
  getPoint,
  getSegment,
  INTERSECTION_TOLERANCE,
  isPointOnRay,
  nextPointLabel,
  segmentExistsBetween,
  snapToPointRay,
  transferredCircleExists,
} from "../geometry/operations";
import { findNearbyIntersection, pointNearCoordinates } from "../geometry/intersections";
import { validateProposition } from "../geometry/validation";
import { getProposition } from "../propositions";
import { useUnlockStore } from "./useUnlockStore";

type CongruenceMethod = "SAS" | "SSS";

type CongruenceSidePick = {
  kind: "side";
  p1: string;
  p2: string;
  segmentId?: string;
};

type CongruenceVertexPick = {
  kind: "vertex";
  pointId: string;
  ray1?: string;
  ray2?: string;
};

type CongruencePick = CongruenceSidePick | CongruenceVertexPick;

type CongruenceSelection = {
  method: CongruenceMethod;
  picks: CongruencePick[];
  message?: string;
  status?: "idle" | "error" | "success";
};

type GeometryStore = {
  phase: AppPhase;
  backgroundColor: string;
  currentPropositionId: string;
  unlockedPropositionIds: string[];
  completedPropositionIds: string[];
  selectedTool: GeometryTool;
  selectedPointIds: string[];
  theoremSelectionIds: string[];
  compassTransferSource: { p1: string; p2: string; segmentId?: string } | null;
  animatedObjectId: string | null;
  objects: GeometryObject[];
  history: GeometryObject[][];
  validation: ValidationResult | null;
  proofContext: ProofContext | null;
  currentReplayStep: number;
  completedActionIds: string[];
  reasoningRelations: ReasoningRelation[];
  congruenceSelection: CongruenceSelection | null;
  startApp: () => void;
  startTutorial: () => void;
  returnToTitle: () => void;
  enterProposition: () => void;
  openProposition: (id: string) => void;
  startConstruction: () => void;
  setBackgroundColor: (color: string) => void;
  setTool: (tool: GeometryTool) => void;
  applySASByTriangles: (triangle1: string, triangle2: string) => ValidationResult;
  applySSSByTriangles: (triangle1: string, triangle2: string) => ValidationResult;
  resetCongruenceSelection: () => void;
  markChallengeAction: (actionId: string) => void;
  transformPoints: (positions: Record<string, { x: number; y: number }>) => void;
  handleCanvasClick: (x: number, y: number) => void;
  handleCanvasDrag: (
    startPointId: string | null,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    guidePointId?: string | null,
  ) => void;
  checkConstruction: () => void;
  autoCompleteConstruction: (result: ValidationResult) => void;
  startProofPlay: () => void;
  completeProofChallenge: () => void;
  startLogicReplay: () => void;
  nextReplayStep: () => void;
  previousReplayStep: () => void;
  finishReplay: () => void;
  resetProposition: () => void;
  undo: () => void;
};

const FIRST_PROPOSITION_ID = "I.1";

function readProgress() {
  const unlockState = useUnlockStore.getState();
  return {
    unlockedPropositionIds: unlockState.getUnlockedPropositionIds(),
    completedPropositionIds: unlockState.completedPropositionIds,
  };
}

const initialProgress = readProgress();

const cloneInitialObjects = (propositionId: string) => {
  const proposition = getProposition(propositionId);
  const forbidden = new Set(proposition.forbiddenInitialObjects ?? []);

  return proposition.initialObjects
    .filter((object) => !forbidden.has(object.id) && !forbidden.has(object.label ?? ""))
    .map((object) => ({ ...object }));
};

function defaultToolFor(propositionId: string): GeometryTool {
  return getProposition(propositionId).allowedTools[0] ?? "point";
}

function addObjectsWithHistory(state: GeometryStore, newObjects: GeometryObject[], animatedObjectId?: string) {
  return {
    phase: "construction" as AppPhase,
    objects: [...state.objects, ...newObjects],
    history: [...state.history, state.objects],
    validation: null,
    proofContext: null,
    currentReplayStep: 0,
    animatedObjectId: animatedObjectId ?? newObjects[newObjects.length - 1]?.id ?? null,
  };
}

function addObjectWithHistory(state: GeometryStore, object: GeometryObject) {
  return addObjectsWithHistory(state, [object]);
}

function addObjectsAndSelect(
  state: GeometryStore,
  newObjects: GeometryObject[],
  selectedPointIds: string[] = [],
  animatedObjectId?: string,
) {
  return {
    ...addObjectsWithHistory(state, newObjects, animatedObjectId),
    selectedPointIds,
    compassTransferSource: null,
  };
}

function pointLabel(state: GeometryStore, objects: GeometryObject[]) {
  return nextPointLabel(objects, getProposition(state.currentPropositionId).pointLabelSequence);
}

function snapSASArrangementTargets(state: GeometryStore, positions: Record<string, { x: number; y: number }>) {
  if (state.currentPropositionId !== "I.4" && state.currentPropositionId !== "I.8") {
    return positions;
  }

  const pairs: Array<[string, string]> =
    state.currentPropositionId === "I.4"
      ? [
          ["A", "D"],
          ["B", "E"],
          ["C", "F"],
        ]
      : [
          ["D", "A"],
          ["E", "B"],
          ["F", "C"],
        ];
  const snapTolerance = 28;
  const shouldSnap = pairs.every(([sourceId, targetId]) => {
    const source = positions[sourceId];
    const target = getPoint(state.objects, targetId);
    return Boolean(source && target && Math.hypot(source.x - target.x, source.y - target.y) <= snapTolerance);
  });

  if (!shouldSnap) {
    return positions;
  }

  return pairs.reduce<Record<string, { x: number; y: number }>>((nextPositions, [sourceId, targetId]) => {
    const target = getPoint(state.objects, targetId);
    return target
      ? {
          ...nextPositions,
          [sourceId]: { x: target.x, y: target.y },
        }
      : nextPositions;
  }, positions);
}

function positionsChanged(objects: GeometryObject[], positions: Record<string, { x: number; y: number }>) {
  return Object.entries(positions).some(([pointId, position]) => {
    const point = getPoint(objects, pointId);
    return Boolean(point && Math.hypot(point.x - position.x, point.y - position.y) > 0.5);
  });
}

function resolvePointAt(
  state: GeometryStore,
  x: number,
  y: number,
  objects: GeometryObject[] = state.objects,
): { point: Point; newPoint?: Point } {
  const existing = findNearbyPoint(objects, x, y);
  if (existing) {
    return { point: existing };
  }

  const intersection = findNearbyIntersection(objects, x, y, 30);
  if (intersection) {
    const label = pointLabel(state, objects);
    const point = createPoint(label, intersection.x, intersection.y, "intersection", {
      color: "gold",
      parentObjectIds: intersection.objects.map((object) => object.id),
    });
    return { point, newPoint: point };
  }

  const objectSnap = findNearbyObjectSnap(objects, x, y);
  if (objectSnap) {
    const label = pointLabel(state, objects);
    const point = createPoint(label, objectSnap.x, objectSnap.y, "snap", {
      parentObjectIds: objectSnap.parentObjectIds,
    });
    return { point, newPoint: point };
  }

  const label = pointLabel(state, objects);
  const point = createPoint(label, x, y, "free");
  return { point, newPoint: point };
}

function equilateralApexCoordinates(p1: Point, p2: Point, sideSign = -1) {
  const heightScale = Math.sqrt(3) / 2;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const direction = sideSign < 0 ? -1 : 1;

  return {
    x: midX - (p2.y - p1.y) * heightScale * direction,
    y: midY + (p2.x - p1.x) * heightScale * direction,
  };
}

function buildEquilateralTriangleOnBase(
  state: GeometryStore,
  p1: Point,
  p2: Point,
  parentObjectId: string | undefined,
  sideSign = -1,
) {
  if (!p1 || !p2) {
    return undefined;
  }

  const { x: apexX, y: apexY } = equilateralApexCoordinates(p1, p2, sideSign);
  const label = pointLabel(state, state.objects);
  const apex = createPoint(label, apexX, apexY, "theorem-action", {
    color: "gold",
    parentObjectIds: parentObjectId ? [parentObjectId] : undefined,
    source: "I.1",
  });

  const newObjects: GeometryObject[] = [];
  if (!circleExists(state.objects, p1.id, p2.id)) {
    newObjects.push(createCircle(p1.id, p2.id, "red"));
  }
  if (!circleExists(state.objects, p2.id, p1.id)) {
    newObjects.push(createCircle(p2.id, p1.id, "blue"));
  }

  newObjects.push(apex);
  if (!segmentExistsBetween(state.objects, p1.id, apex.id)) {
    newObjects.push(createSegment(p1.id, apex.id, "red", "I.1"));
  }
  if (!segmentExistsBetween(state.objects, p2.id, apex.id)) {
    newObjects.push(createSegment(p2.id, apex.id, "blue", "I.1"));
  }

  return { objects: newObjects, animatedObjectId: apex.id };
}

function buildEquilateralTriangleOnSegment(state: GeometryStore, segment: Segment, sideSign = -1) {
  const p1 = getPoint(state.objects, segment.p1);
  const p2 = getPoint(state.objects, segment.p2);
  if (!p1 || !p2) {
    return undefined;
  }

  return buildEquilateralTriangleOnBase(state, p1, p2, segment.id, sideSign);
}

function lineIntersectionFromDirection(
  start: Point,
  direction: { x: number; y: number },
  lineA: Point,
  lineB: Point,
) {
  const lineX = lineB.x - lineA.x;
  const lineY = lineB.y - lineA.y;
  const determinant = direction.x * -lineY - direction.y * -lineX;
  if (Math.abs(determinant) < 0.0001) {
    return undefined;
  }

  const ax = lineA.x - start.x;
  const ay = lineA.y - start.y;
  const t = (ax * -lineY - ay * -lineX) / determinant;
  const u = (direction.x * ay - direction.y * ax) / determinant;
  if (t < 0 || u < -0.02 || u > 1.02) {
    return undefined;
  }

  return {
    x: start.x + direction.x * t,
    y: start.y + direction.y * t,
  };
}

function bisectAngleFromPoints(state: GeometryStore, vertexId: string, side1Id: string, side2Id: string) {
  const vertex = getPoint(state.objects, vertexId);
  const side1 = getPoint(state.objects, side1Id);
  const side2 = getPoint(state.objects, side2Id);
  if (!vertex || !side1 || !side2) {
    return undefined;
  }

  const v1Length = distance(vertex, side1);
  const v2Length = distance(vertex, side2);
  if (v1Length === 0 || v2Length === 0) {
    return undefined;
  }

  const unit1 = { x: (side1.x - vertex.x) / v1Length, y: (side1.y - vertex.y) / v1Length };
  const unit2 = { x: (side2.x - vertex.x) / v2Length, y: (side2.y - vertex.y) / v2Length };
  let direction = { x: unit1.x + unit2.x, y: unit1.y + unit2.y };
  const directionLength = Math.hypot(direction.x, direction.y);
  if (directionLength < 0.001) {
    return undefined;
  }

  direction = { x: direction.x / directionLength, y: direction.y / directionLength };
  const intersection = lineIntersectionFromDirection(vertex, direction, side1, side2);
  const endpoint = intersection ?? {
    x: vertex.x + direction.x * Math.min(v1Length, v2Length, 220),
    y: vertex.y + direction.y * Math.min(v1Length, v2Length, 220),
  };
  const existing = pointNearCoordinates(
    state.objects.filter((object): object is Point => object.type === "point"),
    endpoint.x,
    endpoint.y,
    3,
  );
  const point =
    existing ??
    createPoint(pointLabel(state, state.objects), endpoint.x, endpoint.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [vertexId, side1Id, side2Id],
      source: "I.9",
    });
  const segment = segmentExistsBetween(state.objects, vertex.id, point.id)
    ? undefined
    : createSegment(vertex.id, point.id, "gold", "I.9");
  if (segment) {
    segment.ray = true;
  }
  const newObjects: GeometryObject[] = [...(existing ? [] : [point]), ...(segment ? [segment] : [])];
  return { objects: newObjects, animatedObjectId: segment?.id ?? point.id };
}

function bisectSegmentWithMidpoint(state: GeometryStore, segment: Segment) {
  const p1 = getPoint(state.objects, segment.p1);
  const p2 = getPoint(state.objects, segment.p2);
  if (!p1 || !p2) {
    return undefined;
  }

  const x = (p1.x + p2.x) / 2;
  const y = (p1.y + p2.y) / 2;
  const existing = pointNearCoordinates(
    state.objects.filter((object): object is Point => object.type === "point"),
    x,
    y,
    3,
  );
  const midpoint =
    existing ??
    createPoint(pointLabel(state, state.objects), x, y, "theorem-action", {
      color: "gold",
      parentObjectIds: [segment.id],
      source: "I.10",
    });

  return {
    objects: existing ? [] : [midpoint],
    animatedObjectId: midpoint.id,
  };
}

function bisectProp12ChordWithMidpoint(state: GeometryStore, segment: Segment) {
  if (state.currentPropositionId !== "I.12") {
    return undefined;
  }

  const A = getPoint(state.objects, segment.p1);
  const B = getPoint(state.objects, segment.p2);
  const C = getPoint(state.objects, "C");
  if (!A || !B || !C) {
    return undefined;
  }

  const circle = state.objects.find(
    (object) => object.type === "circle" && object.center === C.id && circleRadius(object, state.objects) > 8,
  );
  if (!circle || circle.type !== "circle") {
    return {
      validation: {
        success: false,
        message: "Draw the circle centered at C before bisecting the chord it cuts on AB.",
      },
    };
  }

  const lineParameter = (point: Point) => {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const lengthSquared = dx * dx + dy * dy;
    return lengthSquared < 1 ? 0 : ((point.x - A.x) * dx + (point.y - A.y) * dy) / lengthSquared;
  };

  const chordPoints = state.objects
    .filter((object): object is Point => object.type === "point" && !["A", "B", "C"].includes(object.id))
    .filter(
      (point) =>
        arePointsCollinear(A, B, point, 0.035) &&
        areDistancesEqual(distance(C, point), circleRadius(circle, state.objects), 9),
    )
    .sort((first, second) => lineParameter(first) - lineParameter(second));

  if (chordPoints.length < 2) {
    return {
      validation: {
        success: false,
        message: "Mark both intersections where the circle cuts AB before bisecting EF.",
      },
    };
  }

  const E = chordPoints[0];
  const F = chordPoints[chordPoints.length - 1];
  const existingSegmentEF = segmentExistsBetween(state.objects, E.id, F.id);
  const segmentEF = existingSegmentEF ?? createSegment(E.id, F.id, "gold", "I.10");
  const objectsWithSegment = existingSegmentEF ? state.objects : [...state.objects, segmentEF];
  const midpointX = (E.x + F.x) / 2;
  const midpointY = (E.y + F.y) / 2;
  const existingMidpoint = pointNearCoordinates(
    objectsWithSegment.filter((object): object is Point => object.type === "point"),
    midpointX,
    midpointY,
    4,
  );
  const midpoint =
    existingMidpoint ??
    createPoint(pointLabel(state, objectsWithSegment), midpointX, midpointY, "theorem-action", {
      color: "gold",
      parentObjectIds: [segmentEF.id],
      source: "I.10",
    });

  return {
    objects: [...(existingSegmentEF ? [] : [segmentEF]), ...(existingMidpoint ? [] : [midpoint])],
    animatedObjectId: midpoint.id,
  };
}

function pointAtForAction(
  state: GeometryStore,
  objects: GeometryObject[],
  x: number,
  y: number,
  source: string,
  color = "gold",
) {
  const existing = pointNearCoordinates(
    objects.filter((object): object is Point => object.type === "point"),
    x,
    y,
    4,
  );
  if (existing) {
    return { point: existing, objects: [] as GeometryObject[] };
  }

  const point = createPoint(pointLabel(state, objects), x, y, "theorem-action", { color, source });
  return { point, objects: [point] as GeometryObject[] };
}

function createAuxiliaryRayPoint(x: number, y: number, source: string): Point {
  return {
    id: `aux-${source.toLowerCase().replace(/[^a-z0-9]/g, "")}-${crypto.randomUUID().slice(0, 6)}`,
    type: "point",
    x,
    y,
    color: "gold",
    auxiliary: true,
    source,
    createdBy: "theorem-action",
  };
}

function signedAngleBetween(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.atan2(from.x * to.y - from.y * to.x, from.x * to.x + from.y * to.y);
}

function rotateVector(vector: { x: number; y: number }, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function unitVector(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  return length < 1 ? undefined : { x: dx / length, y: dy / length };
}

function segmentPoints(objects: GeometryObject[], segment: Segment) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  return p1 && p2 ? { p1, p2 } : undefined;
}

function addSegmentIfMissing(objects: GeometryObject[], p1: string, p2: string, color: string, source: string) {
  return segmentExistsBetween(objects, p1, p2) ? [] : [createSegment(p1, p2, color, source)];
}

function addFiniteSegmentIfMissing(objects: GeometryObject[], p1: string, p2: string, color: string, source: string) {
  if (segmentExistsBetween(objects, p1, p2)) {
    return [];
  }

  const segment = createSegment(p1, p2, color, source);
  segment.given = true;
  return [segment];
}

function pointOnRayAtDistance(
  from: Point,
  through: Point,
  targetDistance: number,
) {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const baseLength = Math.hypot(dx, dy);
  if (baseLength < 1) {
    return undefined;
  }

  return {
    x: from.x + (dx / baseLength) * targetDistance,
    y: from.y + (dy / baseLength) * targetDistance,
  };
}

function clickNearRay(from: Point, through: Point, x?: number, y?: number, tolerance = 34) {
  if (x === undefined || y === undefined) {
    return true;
  }

  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return false;
  }

  const t = ((x - from.x) * dx + (y - from.y) * dy) / lengthSquared;
  if (t < -0.03) {
    return false;
  }

  const projectedX = from.x + t * dx;
  const projectedY = from.y + t * dy;
  return Math.hypot(x - projectedX, y - projectedY) <= tolerance;
}

function pointBeyond(from: Point, through: Point, point: Point) {
  const baseX = through.x - from.x;
  const baseY = through.y - from.y;
  const pointX = point.x - from.x;
  const pointY = point.y - from.y;
  const baseLengthSquared = baseX * baseX + baseY * baseY;
  if (baseLengthSquared < 1) {
    return false;
  }

  return (pointX * baseX + pointY * baseY) / baseLengthSquared > 1.02;
}

function pointByLabel(objects: GeometryObject[], label: string) {
  return objects.find((object): object is Point => object.type === "point" && object.label === label);
}

function cutProp5EqualSegment(state: GeometryStore, selectedPointId: string) {
  const A = getPoint(state.objects, "A");
  const B = getPoint(state.objects, "B");
  const C = getPoint(state.objects, "C");
  const F = getPoint(state.objects, selectedPointId);
  if (!A || !B || !C || !F || !pointBeyond(A, B, F)) {
    return {
      validation: {
        success: false,
        message: "Choose F on the extension of AB beyond B before cutting the equal segment on AC.",
      },
    };
  }

  const target = pointOnRayAtDistance(A, C, distance(A, F));
  if (!target) {
    return undefined;
  }

  const existingG =
    pointByLabel(state.objects, "G") ??
    pointNearCoordinates(
      state.objects.filter((object): object is Point => object.type === "point"),
      target.x,
      target.y,
      5,
    );
  const G =
    existingG ??
    createPoint("G", target.x, target.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [selectedPointId, "A", "C"],
      source: "I.3",
    });

  const objectsWithG = existingG ? state.objects : [...state.objects, G];
  const newObjects: GeometryObject[] = [
    ...(existingG ? [] : [G]),
    ...addFiniteSegmentIfMissing(objectsWithG, "A", F.id, "gold", "I.3"),
    ...addFiniteSegmentIfMissing(objectsWithG, "A", G.id, "gold", "I.3"),
    ...addFiniteSegmentIfMissing(objectsWithG, "B", F.id, "ink", "C.N.3"),
    ...addFiniteSegmentIfMissing(objectsWithG, "C", G.id, "ink", "C.N.3"),
  ];

  return {
    objects: newObjects,
    animatedObjectId: G.id,
    completedActionId: "prop5-copy-ag-af",
  };
}

function cutProp9EqualSegment(state: GeometryStore, selectedPointId: string, targetX?: number, targetY?: number) {
  const A = getPoint(state.objects, "A");
  const B = getPoint(state.objects, "B");
  const C = getPoint(state.objects, "C");
  const D = getPoint(state.objects, selectedPointId);
  if (!A || !B || !C || !D) {
    return undefined;
  }

  if (!isPointOnRay(A, B, D, 0.035)) {
    return {
      validation: {
        success: false,
        message: "Choose D on ray AB, then cut AE from ray AC equal to AD.",
      },
    };
  }

  if (!clickNearRay(A, C, targetX, targetY)) {
    return {
      validation: {
        success: false,
        message: "Click the target ray AC to cut AE equal to AD.",
      },
    };
  }

  const target = pointOnRayAtDistance(A, C, distance(A, D));
  if (!target) {
    return undefined;
  }

  const existingE =
    pointByLabel(state.objects, "E") ??
    pointNearCoordinates(
      state.objects.filter((object): object is Point => object.type === "point"),
      target.x,
      target.y,
      5,
    );
  const E =
    existingE ??
    createPoint("E", target.x, target.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [selectedPointId, "A", "C"],
      source: "I.3",
    });

  const objectsWithE = existingE ? state.objects : [...state.objects, E];
  const newObjects: GeometryObject[] = [
    ...(existingE ? [] : [E]),
    ...addFiniteSegmentIfMissing(objectsWithE, "A", D.id, "gold", "I.3"),
    ...addFiniteSegmentIfMissing(objectsWithE, "A", E.id, "gold", "I.3"),
  ];

  return {
    objects: newObjects,
    animatedObjectId: E.id,
    completedActionId: "prop9-cut-ae-ad",
  };
}

function cutProp6EqualSegment(state: GeometryStore, ids: string[]) {
  const source = getSegment(state.objects, ids[0]);
  const target = getSegment(state.objects, ids[1]);
  const endpoint = getPoint(state.objects, ids[2]);
  if (!source || !target || !endpoint) {
    return undefined;
  }

  const sourceA = getPoint(state.objects, source.p1);
  const sourceB = getPoint(state.objects, source.p2);
  const targetA = getPoint(state.objects, target.p1);
  const targetB = getPoint(state.objects, target.p2);
  if (!sourceA || !sourceB || !targetA || !targetB || ![target.p1, target.p2].includes(endpoint.id)) {
    return undefined;
  }

  const otherEndpoint = endpoint.id === target.p1 ? targetB : targetA;
  const sourceSide = canonicalSideRef(source.p1, source.p2);
  const targetSide = canonicalSideRef(target.p1, target.p2);
  const isProp6ContradictionCut =
    state.currentPropositionId === "I.6" && sourceSide === "AC" && targetSide === "AB" && endpoint.id === "B";
  const sourceLength = distance(sourceA, sourceB);
  const targetLength = distance(targetA, targetB);
  if (!isProp6ContradictionCut && sourceLength >= targetLength - 2) {
    return {
      validation: {
        success: false,
        message: "The contradiction cut needs the assumed greater side as the segment to cut from.",
      },
    };
  }

  const cutLength = isProp6ContradictionCut ? Math.min(sourceLength, targetLength * 0.58) : sourceLength;
  const pointCoordinates = pointOnRayAtDistance(endpoint, otherEndpoint, cutLength);
  if (!pointCoordinates) {
    return undefined;
  }

  const existingD =
    pointByLabel(state.objects, "D") ??
    pointNearCoordinates(
      state.objects.filter((object): object is Point => object.type === "point"),
      pointCoordinates.x,
      pointCoordinates.y,
      5,
    );
  const D =
    existingD ??
    createPoint("D", pointCoordinates.x, pointCoordinates.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [source.id, target.id, endpoint.id],
      source: "I.3",
    });

  const objectsWithD = existingD ? state.objects : [...state.objects, D];
  const newObjects: GeometryObject[] = [
    ...(existingD ? [] : [D]),
    ...addFiniteSegmentIfMissing(objectsWithD, endpoint.id, D.id, "gold", "I.3"),
  ];

  return {
    objects: newObjects,
    animatedObjectId: D.id,
    completedActionId: "prop6-cut-db-ac",
  };
}

function triangleFromIncludedSides(side1: Segment, vertexId: string, side2: Segment) {
  if (!([side1.p1, side1.p2].includes(vertexId) && [side2.p1, side2.p2].includes(vertexId))) {
    return undefined;
  }

  const other1 = side1.p1 === vertexId ? side1.p2 : side1.p1;
  const other2 = side2.p1 === vertexId ? side2.p2 : side2.p1;
  if (other1 === other2) {
    return undefined;
  }

  return [vertexId, other1, other2];
}

function triangleKey(pointIds: string[]) {
  return [...pointIds].sort().join("");
}

type TriangleIds = [string, string, string];

type SASValidationSuccess = {
  success: true;
  message: string;
  actionIds: string[];
  relation: ReasoningRelation;
};

type SASValidationFailure = {
  success: false;
  message: string;
};

function pointByName(objects: GeometryObject[], name: string) {
  const normalized = name.trim().toUpperCase();
  return objects.find(
    (object): object is Point =>
      object.type === "point" &&
      ((object.label ?? "").toUpperCase() === normalized || object.id.toUpperCase() === normalized),
  );
}

function parseTriangleInput(objects: GeometryObject[], input: string): { triangle?: TriangleIds; message?: string } {
  const names = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .split("");

  if (names.length !== 3 || new Set(names).size !== 3) {
    return { message: "Enter each triangle as three different point names, like AFC." };
  }

  const points = names.map((name) => pointByName(objects, name));
  if (points.some((point) => !point)) {
    return { message: "These triangle names do not match existing points." };
  }

  return { triangle: points.map((point) => point!.id) as TriangleIds };
}

function parseProp11SSSAlias(state: GeometryStore, input: string): { triangle?: TriangleIds; message?: string } | undefined {
  if (state.currentPropositionId !== "I.11") {
    return undefined;
  }

  const normalized = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalized !== "ADF" && normalized !== "AEF") {
    return undefined;
  }

  const center = pointByName(state.objects, "C") ?? pointByName(state.objects, "A");
  const left = pointByName(state.objects, "D") ?? pointByName(state.objects, "G");
  const right = pointByName(state.objects, "E") ?? pointByName(state.objects, "H");
  const apex = pointByName(state.objects, "F") ?? pointByName(state.objects, "K");
  const sidePoint = normalized === "ADF" ? left : right;
  if (!center || !sidePoint || !apex) {
    return undefined;
  }

  return { triangle: [center.id, sidePoint.id, apex.id] };
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) {
    return [items];
  }

  return items.flatMap((item, index) =>
    permutations(items.filter((_, candidateIndex) => candidateIndex !== index)).map((rest) => [item, ...rest]),
  );
}

function canonicalSideRef(a: string, b: string) {
  return [a, b].sort().join("");
}

function sideRelationMatches(relation: GeometricRelation, side1: [string, string], side2: [string, string]) {
  if (relation.type !== "equal-length") {
    return false;
  }

  const targetA = canonicalSideRef(side1[0], side1[1]);
  const targetB = canonicalSideRef(side2[0], side2[1]);
  return (
    (canonicalSideRef(relation.a[0], relation.a[1]) === targetA &&
      canonicalSideRef(relation.b[0], relation.b[1]) === targetB) ||
    (canonicalSideRef(relation.a[0], relation.a[1]) === targetB &&
      canonicalSideRef(relation.b[0], relation.b[1]) === targetA)
  );
}

function sideMatches(side1: [string, string], side2: [string, string]) {
  return canonicalSideRef(side1[0], side1[1]) === canonicalSideRef(side2[0], side2[1]);
}

function sidesAreEqualByReasoning(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  if (sideMatches(side1, side2)) {
    return true;
  }

  return state.reasoningRelations.some((relation) =>
    relation.derivedRelations.some((derived) => sideRelationMatches(derived, side1, side2)),
  );
}

function supportForSide(state: GeometryStore, side: [string, string]) {
  const p1 = getPoint(state.objects, side[0]);
  const p2 = getPoint(state.objects, side[1]);
  return p1 && p2 ? sideSupportSegment(state.objects, p1, p2) : undefined;
}

function sideLength(state: GeometryStore, side: [string, string]) {
  const p1 = getPoint(state.objects, side[0]);
  const p2 = getPoint(state.objects, side[1]);
  return p1 && p2 ? distance(p1, p2) : undefined;
}

function lengthsMatchForKnownFact(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  const length1 = sideLength(state, side1);
  const length2 = sideLength(state, side2);
  return length1 !== undefined && length2 !== undefined && areDistancesEqual(length1, length2, 8);
}

function sidesAreGivenEqual(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  const segment1 = supportForSide(state, side1);
  const segment2 = supportForSide(state, side2);
  const color1 = segment1?.color;
  const color2 = segment2?.color;
  const hasMarkedColor = color1 && color1 === color2 && color1 !== "black" && color1 !== "ink";

  return Boolean(
    segment1 &&
      segment2 &&
      segment1.id !== segment2.id &&
      segment1.given &&
      segment2.given &&
      hasMarkedColor &&
      lengthsMatchForKnownFact(state, side1, side2),
  );
}

function sideInTriangle(side: [string, string], vertices: string[]) {
  return vertices.includes(side[0]) && vertices.includes(side[1]) && side[0] !== side[1];
}

function triangleSidePairs(vertices: string[]): Array<[string, string]> {
  return [
    [vertices[0], vertices[1]],
    [vertices[1], vertices[2]],
    [vertices[2], vertices[0]],
  ];
}

function sidesAreEqualByEquilateralGeometry(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  const vertices = Array.from(new Set([...side1, ...side2]));
  if (vertices.length !== 3 || !sideInTriangle(side1, vertices) || !sideInTriangle(side2, vertices)) {
    return false;
  }

  const points = vertices.map((id) => getPoint(state.objects, id));
  if (!points.every(Boolean)) {
    return false;
  }

  const [first, second, third] = points as [Point, Point, Point];
  if (arePointsCollinear(first, second, third, 0.025)) {
    return false;
  }

  const sidePairs = triangleSidePairs(vertices);
  if (!sidePairs.every((side) => supportForSide(state, side))) {
    return false;
  }

  const lengths = sidePairs.map((side) => sideLength(state, side));
  if (lengths.some((length) => length === undefined || length < 4)) {
    return false;
  }

  const [lengthA, lengthB, lengthC] = lengths as [number, number, number];
  return (
    areDistancesEqual(lengthA, lengthB, 8) &&
    areDistancesEqual(lengthB, lengthC, 8) &&
    lengthsMatchForKnownFact(state, side1, side2)
  );
}

function sidesAreEqualBySegmentBisector(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  return state.objects.some((object) => {
    if (object.type !== "point" || object.source !== "I.10") {
      return false;
    }

    const parentSegment = object.parentObjectIds?.map((id) => getSegment(state.objects, id)).find(Boolean);
    if (!parentSegment) {
      return false;
    }

    const midpoint = object.id;
    const endpointSides: Array<[string, string]> = [
      [parentSegment.p1, midpoint],
      [midpoint, parentSegment.p2],
    ];

    return (
      ((sideMatches(side1, endpointSides[0]) && sideMatches(side2, endpointSides[1])) ||
        (sideMatches(side2, endpointSides[0]) && sideMatches(side1, endpointSides[1]))) &&
      lengthsMatchForKnownFact(state, side1, side2)
    );
  });
}

function copiedLengthPairsForPoint(point: Point): Array<[[string, string], [string, string]]> {
  if (point.source !== "I.2" && point.source !== "I.3") {
    return [];
  }

  const parents = point.parentObjectIds ?? [];
  if (parents.length < 3) {
    return [];
  }

  return [
    [
      [parents[0], parents[1]],
      [parents[2], point.id],
    ],
    [
      [parents[0], parents[1]],
      [parents[1], point.id],
    ],
  ];
}

function sidesAreEqualByCopiedLength(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  return state.objects.some(
    (object): object is Point =>
      object.type === "point" &&
      copiedLengthPairsForPoint(object).some(
        ([sourceSide, targetSide]) =>
          ((sideMatches(side1, sourceSide) && sideMatches(side2, targetSide)) ||
            (sideMatches(side2, sourceSide) && sideMatches(side1, targetSide))) &&
          lengthsMatchForKnownFact(state, side1, side2),
      ),
  );
}

function sidesAreEqualBySameCircleRadii(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  return state.objects.some((object) => {
    if (object.type !== "circle") {
      return false;
    }

    const center = getPoint(state.objects, object.center);
    if (!center) {
      return false;
    }

    const onCircleSide = (side: [string, string]) => {
      if (!side.includes(object.center)) {
        return false;
      }

      const radiusPointId = side[0] === object.center ? side[1] : side[0];
      const radiusPoint = getPoint(state.objects, radiusPointId);
      return Boolean(
        radiusPoint &&
          areDistancesEqual(distance(center, radiusPoint), circleRadius(object, state.objects), 8),
      );
    };

    return onCircleSide(side1) && onCircleSide(side2) && lengthsMatchForKnownFact(state, side1, side2);
  });
}

function sidesAreEqualByCommonNotionRemainders(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  const segment1 = supportForSide(state, side1);
  const segment2 = supportForSide(state, side2);
  return Boolean(
    segment1 &&
      segment2 &&
      segment1.id !== segment2.id &&
      segment1.source === "C.N.3" &&
      segment2.source === "C.N.3" &&
      lengthsMatchForKnownFact(state, side1, side2),
  );
}

function prop24CopiedComparisonEndpoint(state: GeometryStore, side: [string, string]) {
  if (state.currentPropositionId !== "I.24" || !side.includes("D")) {
    return undefined;
  }

  const endpointId = side[0] === "D" ? side[1] : side[0];
  if (["A", "B", "C", "E", "F"].includes(endpointId)) {
    return undefined;
  }

  return sidesAreEqualByCopiedLength(state, ["D", "F"], ["D", endpointId]) && lengthsMatchForKnownFact(state, ["D", "F"], ["D", endpointId])
    ? endpointId
    : undefined;
}

function sidesAreEqualByProp24CopiedComparison(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  if (state.currentPropositionId !== "I.24") {
    return false;
  }

  const firstIsAC = sideMatches(side1, ["A", "C"]);
  const secondIsAC = sideMatches(side2, ["A", "C"]);
  const copiedEndpoint = firstIsAC ? prop24CopiedComparisonEndpoint(state, side2) : secondIsAC ? prop24CopiedComparisonEndpoint(state, side1) : undefined;
  return Boolean(copiedEndpoint && sidesAreGivenEqual(state, ["A", "C"], ["D", "F"]));
}

function sidesAreEqualByProp35ParallelogramSetup(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  if (state.currentPropositionId !== "I.35") {
    return false;
  }

  const matchesTopRemainders =
    (sideMatches(side1, ["A", "E"]) && sideMatches(side2, ["D", "F"])) ||
    (sideMatches(side2, ["A", "E"]) && sideMatches(side1, ["D", "F"]));
  return matchesTopRemainders && lengthsMatchForKnownFact(state, side1, side2);
}

function sidesAreEqualForSAS(state: GeometryStore, side1: [string, string], side2: [string, string]) {
  return (
    sidesAreEqualByReasoning(state, side1, side2) ||
    sidesAreGivenEqual(state, side1, side2) ||
    sidesAreEqualByEquilateralGeometry(state, side1, side2) ||
    sidesAreEqualBySegmentBisector(state, side1, side2) ||
    sidesAreEqualByCopiedLength(state, side1, side2) ||
    sidesAreEqualBySameCircleRadii(state, side1, side2) ||
    sidesAreEqualByCommonNotionRemainders(state, side1, side2) ||
    sidesAreEqualByProp24CopiedComparison(state, side1, side2) ||
    sidesAreEqualByProp35ParallelogramSetup(state, side1, side2)
  );
}

function angleRef(a: string, vertex: string, b: string) {
  return `${a}${vertex}${b}`;
}

function angleRefToIds(ref: string): [string, string, string] | undefined {
  return ref.length === 3 ? [ref[0], ref[1], ref[2]] : undefined;
}

function pointsShareRayFromVertex(objects: GeometryObject[], vertexId: string, firstId: string, secondId: string) {
  if (firstId === secondId) {
    return true;
  }

  const vertex = getPoint(objects, vertexId);
  const first = getPoint(objects, firstId);
  const second = getPoint(objects, secondId);
  return Boolean(vertex && first && second && isPointOnRay(vertex, first, second, 0.04));
}

function anglesEquivalentByRays(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (angle1[1] !== angle2[1]) {
    return false;
  }

  return (
    (pointsShareRayFromVertex(state.objects, angle1[1], angle1[0], angle2[0]) &&
      pointsShareRayFromVertex(state.objects, angle1[1], angle1[2], angle2[2])) ||
    (pointsShareRayFromVertex(state.objects, angle1[1], angle1[0], angle2[2]) &&
      pointsShareRayFromVertex(state.objects, angle1[1], angle1[2], angle2[0]))
  );
}

function angleRefMatches(state: GeometryStore, refA: string, refB: string, angle1: [string, string, string], angle2: [string, string, string]) {
  const angleA = angleRefToIds(refA);
  const angleB = angleRefToIds(refB);
  if (!angleA || !angleB) {
    return false;
  }

  return (
    (anglesEquivalentByRays(state, angleA, angle1) && anglesEquivalentByRays(state, angleB, angle2)) ||
    (anglesEquivalentByRays(state, angleA, angle2) && anglesEquivalentByRays(state, angleB, angle1))
  );
}

function anglesAreEqualByReasoning(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  return state.reasoningRelations.some((relation) =>
    relation.derivedRelations.some(
      (derived) => derived.type === "equal-angle" && angleRefMatches(state, derived.a, derived.b, angle1, angle2),
    ),
  );
}

function anglesAreGivenEqual(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (state.currentPropositionId !== "I.6") {
    return false;
  }

  const givenLeft: [string, string, string] = ["A", "B", "C"];
  const givenRight: [string, string, string] = ["A", "C", "B"];
  return (
    (anglesEquivalentByRays(state, angle1, givenLeft) && anglesEquivalentByRays(state, angle2, givenRight)) ||
    (anglesEquivalentByRays(state, angle1, givenRight) && anglesEquivalentByRays(state, angle2, givenLeft))
  );
}

function angleBisectorProvesEqual(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (angle1[1] !== angle2[1]) {
    return false;
  }

  const vertexId = angle1[1];
  const firstSides = [angle1[0], angle1[2]];
  const secondSides = [angle2[0], angle2[2]];

  for (const firstSide of firstSides) {
    for (const secondSide of secondSides) {
      if (!pointsShareRayFromVertex(state.objects, vertexId, firstSide, secondSide)) {
        continue;
      }

      const bisectorSupport = supportForSide(state, [vertexId, firstSide]);
      if (bisectorSupport?.source !== "I.9") {
        continue;
      }

      const bisectorPoint = getPoint(state.objects, firstSide) ?? getPoint(state.objects, secondSide);
      const parents = bisectorPoint?.parentObjectIds ?? [];
      if (bisectorPoint?.source !== "I.9" || parents.length < 3 || parents[0] !== vertexId) {
        continue;
      }

      const firstOther = firstSides.find((pointId) => pointId !== firstSide);
      const secondOther = secondSides.find((pointId) => pointId !== secondSide);
      const originalSides: [string, string] = [parents[1], parents[2]];
      if (
        firstOther &&
        secondOther &&
        ((pointsShareRayFromVertex(state.objects, vertexId, firstOther, originalSides[0]) &&
          pointsShareRayFromVertex(state.objects, vertexId, secondOther, originalSides[1])) ||
          (pointsShareRayFromVertex(state.objects, vertexId, firstOther, originalSides[1]) &&
            pointsShareRayFromVertex(state.objects, vertexId, secondOther, originalSides[0])))
      ) {
        return true;
      }
    }
  }

  return false;
}

function pointsOnOppositeRaysFromVertex(objects: GeometryObject[], vertexId: string, firstId: string, secondId: string) {
  const vertex = getPoint(objects, vertexId);
  const first = getPoint(objects, firstId);
  const second = getPoint(objects, secondId);
  if (!vertex || !first || !second || !arePointsCollinear(first, vertex, second, 0.04)) {
    return false;
  }

  const firstVector = { x: first.x - vertex.x, y: first.y - vertex.y };
  const secondVector = { x: second.x - vertex.x, y: second.y - vertex.y };
  return firstVector.x * secondVector.x + firstVector.y * secondVector.y < -4;
}

function anglesAreVertical(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (angle1[1] !== angle2[1]) {
    return false;
  }

  const vertex = angle1[1];
  return (
    (pointsOnOppositeRaysFromVertex(state.objects, vertex, angle1[0], angle2[0]) &&
      pointsOnOppositeRaysFromVertex(state.objects, vertex, angle1[2], angle2[2])) ||
    (pointsOnOppositeRaysFromVertex(state.objects, vertex, angle1[0], angle2[2]) &&
      pointsOnOppositeRaysFromVertex(state.objects, vertex, angle1[2], angle2[0]))
  );
}

function prop24CopiedAngleRayEndpoint(state: GeometryStore, endpointId: string) {
  const endpoint = getPoint(state.objects, endpointId);
  const D = getPoint(state.objects, "D");
  const E = getPoint(state.objects, "E");
  const A = getPoint(state.objects, "A");
  const B = getPoint(state.objects, "B");
  const C = getPoint(state.objects, "C");
  if (state.currentPropositionId !== "I.24" || !endpoint || !D || !E || !A || !B || !C) {
    return false;
  }

  const sourceAngle = angleAt(A, B, C);
  const targetAngle = angleAt(D, E, endpoint);
  if (!areAnglesEqual(sourceAngle, targetAngle, 0.08)) {
    return false;
  }

  return state.objects.some((object) => {
    if (object.type !== "segment" || object.source !== "I.23" || (object.p1 !== "D" && object.p2 !== "D")) {
      return false;
    }

    const rayEndpoint = object.p1 === "D" ? object.p2 : object.p1;
    return pointsShareRayFromVertex(state.objects, "D", rayEndpoint, endpointId);
  });
}

function anglesAreEqualByProp24CopiedAngle(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (state.currentPropositionId !== "I.24") {
    return false;
  }

  const copiedMatches = (angle: [string, string, string]) =>
    angle[1] === "D" &&
    ((pointsShareRayFromVertex(state.objects, "D", angle[0], "E") && prop24CopiedAngleRayEndpoint(state, angle[2])) ||
      (pointsShareRayFromVertex(state.objects, "D", angle[2], "E") && prop24CopiedAngleRayEndpoint(state, angle[0])));

  const sourceMatches = (angle: [string, string, string]) => anglesEquivalentByRays(state, angle, ["B", "A", "C"]);
  return (sourceMatches(angle1) && copiedMatches(angle2)) || (sourceMatches(angle2) && copiedMatches(angle1));
}

function anglesAreEqualByProp33ParallelGiven(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (state.currentPropositionId !== "I.33") {
    return false;
  }

  return angleRefMatches(state, "ABC", "DCB", angle1, angle2);
}

function anglesAreEqualByProp35ParallelogramSetup(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (state.currentPropositionId !== "I.35") {
    return false;
  }

  return angleRefMatches(state, "EAB", "FDC", angle1, angle2);
}

function anglesAreEqualForSAS(state: GeometryStore, angle1: [string, string, string], angle2: [string, string, string]) {
  if (
    anglesEquivalentByRays(state, angle1, angle2) ||
    anglesAreEqualByReasoning(state, angle1, angle2) ||
    anglesAreGivenEqual(state, angle1, angle2) ||
    angleBisectorProvesEqual(state, angle1, angle2) ||
    anglesAreVertical(state, angle1, angle2) ||
    anglesAreEqualByProp24CopiedAngle(state, angle1, angle2) ||
    anglesAreEqualByProp33ParallelGiven(state, angle1, angle2) ||
    anglesAreEqualByProp35ParallelogramSetup(state, angle1, angle2)
  ) {
    return true;
  }

  return false;
}

function sharedVertexIndex(side1: [number, number], side2: [number, number]) {
  return side1.find((index) => side2.includes(index));
}

function oppositeIndex(side: [number, number], shared: number) {
  return side[0] === shared ? side[1] : side[0];
}

function sideRefFromIds(side: [string, string]) {
  return `${side[0]}${side[1]}`;
}

function sideLabel(state: GeometryStore, side: [string, string]) {
  const first = getPoint(state.objects, side[0]);
  const second = getPoint(state.objects, side[1]);
  return `${first?.label ?? side[0]}${second?.label ?? side[1]}`;
}

function pointProjection(a: Point, b: Point, x: number, y: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return undefined;
  }

  const t = ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared;
  return {
    x: a.x + t * dx,
    y: a.y + t * dy,
    t,
  };
}

function pointSupportedBySegment(objects: GeometryObject[], point: Point, support: Segment) {
  const start = getPoint(objects, support.p1);
  const end = getPoint(objects, support.p2);
  const projection = start && end ? pointProjection(start, end, point.x, point.y) : undefined;
  if (!start || !end || !projection || !arePointsCollinear(start, end, point, 0.02)) {
    return false;
  }

  if (support.ray) {
    return projection.t >= -0.03;
  }

  if (!support.given) {
    return true;
  }

  return projection.t >= -0.03 && projection.t <= 1.03;
}

function pointParameterOnLine(a: Point, b: Point, point: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return undefined;
  }

  return ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared;
}

function segmentIntervalOnSide(objects: GeometryObject[], sideStart: Point, sideEnd: Point, segment: Segment) {
  const start = getPoint(objects, segment.p1);
  const end = getPoint(objects, segment.p2);
  if (!start || !end || !arePointsCollinear(sideStart, sideEnd, start, 0.025) || !arePointsCollinear(sideStart, sideEnd, end, 0.025)) {
    return undefined;
  }

  const startParameter = pointParameterOnLine(sideStart, sideEnd, start);
  const endParameter = pointParameterOnLine(sideStart, sideEnd, end);
  if (startParameter === undefined || endParameter === undefined || Math.abs(startParameter - endParameter) < 0.002) {
    return undefined;
  }

  if (segment.ray) {
    return endParameter >= startParameter
      ? { start: startParameter, end: Number.POSITIVE_INFINITY, segment }
      : { start: Number.NEGATIVE_INFINITY, end: startParameter, segment };
  }

  if (!segment.given) {
    return { start: Number.NEGATIVE_INFINITY, end: Number.POSITIVE_INFINITY, segment };
  }

  return {
    start: Math.min(startParameter, endParameter),
    end: Math.max(startParameter, endParameter),
    segment,
  };
}

function collinearPathSupportSegment(objects: GeometryObject[], p1: Point, p2: Point) {
  if (distance(p1, p2) < 1) {
    return undefined;
  }

  const intervals = objects
    .filter((object): object is Segment => object.type === "segment")
    .map((segment) => segmentIntervalOnSide(objects, p1, p2, segment))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.end >= -0.035 && entry.start <= 1.035)
    .sort((a, b) => a.start - b.start);

  let coveredUntil = 0;
  let firstSegment: Segment | undefined;
  for (const interval of intervals) {
    if (interval.start > coveredUntil + 0.035) {
      continue;
    }

    if (interval.end <= coveredUntil) {
      continue;
    }

    firstSegment ??= interval.segment;
    coveredUntil = Math.max(coveredUntil, interval.end);
    if (coveredUntil >= 0.965) {
      return firstSegment;
    }
  }

  return undefined;
}

function sideSupportSegment(objects: GeometryObject[], p1: Point, p2: Point) {
  const direct = segmentExistsBetween(objects, p1.id, p2.id);
  if (direct) {
    return direct;
  }

  const containingSegment = objects.find(
    (object): object is Segment =>
      object.type === "segment" &&
      pointSupportedBySegment(objects, p1, object) &&
      pointSupportedBySegment(objects, p2, object),
  );
  return containingSegment ?? collinearPathSupportSegment(objects, p1, p2);
}

function equilateralBaseFromEndpointDrag(
  state: GeometryStore,
  startPointId: string | null,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  guidePointId?: string | null,
) {
  const start = startPointId ? getPoint(state.objects, startPointId) : findNearbyPoint(state.objects, startX, startY, 30);
  const end = guidePointId ? getPoint(state.objects, guidePointId) : findNearbyPoint(state.objects, endX, endY, 30);
  if (!start || !end || start.id === end.id) {
    return undefined;
  }

  const support = sideSupportSegment(state.objects, start, end);
  if (!support) {
    return undefined;
  }

  const baseX = end.x - start.x;
  const baseY = end.y - start.y;
  const pullX = endX - start.x;
  const pullY = endY - start.y;
  const cross = baseX * pullY - baseY * pullX;

  return {
    start,
    end,
    support,
    sideSign: cross < 0 ? -1 : 1,
  };
}

function circleSupportsRadiusSide(objects: GeometryObject[], p1: Point, p2: Point) {
  return objects.some((object) => {
    if (object.type !== "circle" || (object.center !== p1.id && object.center !== p2.id)) {
      return false;
    }

    const center = object.center === p1.id ? p1 : p2;
    const radiusPoint = object.center === p1.id ? p2 : p1;
    return areDistancesEqual(distance(center, radiusPoint), circleRadius(object, objects), 8);
  });
}

function congruenceSideNearPoints(
  state: GeometryStore,
  firstId: string,
  secondId: string,
  x: number,
  y: number,
): CongruenceSidePick | undefined {
  const first = getPoint(state.objects, firstId);
  const second = getPoint(state.objects, secondId);
  if (!first || !second) {
    return undefined;
  }

  const projection = pointProjection(first, second, x, y);
  if (!projection || projection.t < -0.03 || projection.t > 1.03 || Math.hypot(x - projection.x, y - projection.y) > 24) {
    return undefined;
  }

  const support = sideSupportSegment(state.objects, first, second);
  return support ? { kind: "side", p1: firstId, p2: secondId, segmentId: segmentExistsBetween(state.objects, firstId, secondId)?.id ?? support.id } : undefined;
}

function prop35ExpectedSideForPick(selection: CongruenceSelection | null, pickCount: number) {
  if (pickCount === 0 || pickCount === 2) {
    return undefined;
  }

  const matchingFirstPick = pickCount === 3 ? selection?.picks[0] : pickCount === 5 ? selection?.picks[2] : undefined;
  if (matchingFirstPick?.kind !== "side") {
    return undefined;
  }

  if (sideMatches([matchingFirstPick.p1, matchingFirstPick.p2], ["A", "E"])) {
    return ["D", "F"] as [string, string];
  }

  if (sideMatches([matchingFirstPick.p1, matchingFirstPick.p2], ["A", "B"])) {
    return ["D", "C"] as [string, string];
  }

  return undefined;
}

function findProp35CongruenceSideAt(state: GeometryStore, x: number, y: number): CongruenceSidePick | undefined {
  if (state.currentPropositionId !== "I.35" || state.selectedTool !== "theorem-sas") {
    return undefined;
  }

  const selection = state.congruenceSelection;
  const pickCount = selection?.picks.length ?? 0;
  const expectedSide = prop35ExpectedSideForPick(selection, pickCount);
  if (expectedSide) {
    return congruenceSideNearPoints(state, expectedSide[0], expectedSide[1], x, y);
  }

  return (
    congruenceSideNearPoints(state, "A", "E", x, y) ??
    congruenceSideNearPoints(state, "A", "B", x, y)
  );
}

function findCongruenceSideAt(state: GeometryStore, x: number, y: number): CongruenceSidePick | undefined {
  const guidedSide = findProp35CongruenceSideAt(state, x, y);
  if (guidedSide) {
    return guidedSide;
  }

  const points = state.objects.filter((object): object is Point => object.type === "point" && !object.auxiliary);
  const candidates: Array<{
    p1: string;
    p2: string;
    segmentId?: string;
    distance: number;
    length: number;
  }> = [];

  for (let firstIndex = 0; firstIndex < points.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < points.length; secondIndex += 1) {
      const first = points[firstIndex];
      const second = points[secondIndex];
      const projection = pointProjection(first, second, x, y);
      if (!projection || projection.t < -0.03 || projection.t > 1.03) {
        continue;
      }

      const support = sideSupportSegment(state.objects, first, second);
      const radiusSupport = support ? false : circleSupportsRadiusSide(state.objects, first, second);
      if (!support && !radiusSupport) {
        continue;
      }

      const candidateDistance = Math.hypot(x - projection.x, y - projection.y);
      if (candidateDistance > 24) {
        continue;
      }

      candidates.push({
        p1: first.id,
        p2: second.id,
        segmentId: support ? (segmentExistsBetween(state.objects, first.id, second.id)?.id ?? support.id) : undefined,
        distance: candidateDistance,
        length: distance(first, second),
      });
    }
  }

  const best = candidates.sort((a, b) => a.distance - b.distance || a.length - b.length)[0];
  return best ? { kind: "side", p1: best.p1, p2: best.p2, segmentId: best.segmentId } : undefined;
}

function findCongruenceSideByEndpointDrag(
  state: GeometryStore,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): CongruenceSidePick | undefined {
  const start = findNearbyPoint(state.objects, startX, startY, 30);
  const end = findNearbyPoint(state.objects, endX, endY, 30);
  if (!start || !end || start.id === end.id) {
    return undefined;
  }

  const support = sideSupportSegment(state.objects, start, end);
  if (support) {
    return {
      kind: "side",
      p1: start.id,
      p2: end.id,
      segmentId: segmentExistsBetween(state.objects, start.id, end.id)?.id ?? support.id,
    };
  }

  return circleSupportsRadiusSide(state.objects, start, end)
    ? {
        kind: "side",
        p1: start.id,
        p2: end.id,
      }
    : undefined;
}

function pointDistanceToRay(vertex: Point, rayPoint: Point, x: number, y: number) {
  const dx = rayPoint.x - vertex.x;
  const dy = rayPoint.y - vertex.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return Number.POSITIVE_INFINITY;
  }

  const t = Math.max(0, ((x - vertex.x) * dx + (y - vertex.y) * dy) / lengthSquared);
  return Math.hypot(x - (vertex.x + t * dx), y - (vertex.y + t * dy));
}

function angleBetweenRayPoints(vertex: Point, first: Point, second: Point) {
  return angleAt(vertex, first, second);
}

function angleRayCandidates(state: GeometryStore, vertex: Point) {
  return state.objects.filter(
    (object): object is Point =>
      object.type === "point" &&
      !object.auxiliary &&
      object.id !== vertex.id &&
      distance(vertex, object) > 8 &&
      Boolean(sideSupportSegment(state.objects, vertex, object)),
  );
}

function inferCongruenceAngleArc(
  state: GeometryStore,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): CongruenceVertexPick | undefined {
  if (Math.hypot(endX - startX, endY - startY) < 16) {
    return undefined;
  }

  const candidates: Array<{ pick: CongruenceVertexPick; score: number }> = [];
  const vertices = state.objects.filter((object): object is Point => object.type === "point" && !object.auxiliary);
  for (const vertex of vertices) {
    const startRadius = Math.hypot(startX - vertex.x, startY - vertex.y);
    const endRadius = Math.hypot(endX - vertex.x, endY - vertex.y);
    if (startRadius < 14 || endRadius < 14 || Math.abs(startRadius - endRadius) > Math.max(70, (startRadius + endRadius) * 0.45)) {
      continue;
    }

    const rays = angleRayCandidates(state, vertex);
    for (const firstRay of rays) {
      for (const secondRay of rays) {
        if (firstRay.id === secondRay.id || pointsShareRayFromVertex(state.objects, vertex.id, firstRay.id, secondRay.id)) {
          continue;
        }

        const angleSize = angleBetweenRayPoints(vertex, firstRay, secondRay);
        if (angleSize < 0.08 || angleSize > Math.PI - 0.04) {
          continue;
        }

        const startDistance = pointDistanceToRay(vertex, firstRay, startX, startY);
        const endDistance = pointDistanceToRay(vertex, secondRay, endX, endY);
        if (startDistance > 42 || endDistance > 42) {
          continue;
        }

        candidates.push({
          pick: {
            kind: "vertex",
            pointId: vertex.id,
            ray1: firstRay.id,
            ray2: secondRay.id,
          },
          score: startDistance + endDistance + Math.abs(startRadius - endRadius) * 0.12,
        });
      }
    }
  }

  return candidates.sort((a, b) => a.score - b.score)[0]?.pick;
}

function sidePickEndpoints(side: CongruenceSidePick): [string, string] {
  return [side.p1, side.p2];
}

function sidePickIncludes(side: CongruenceSidePick, pointId: string) {
  return side.p1 === pointId || side.p2 === pointId;
}

function sidePickOtherEndpoint(side: CongruenceSidePick, pointId: string) {
  if (side.p1 === pointId) {
    return side.p2;
  }

  if (side.p2 === pointId) {
    return side.p1;
  }

  return undefined;
}

function triangleFromSidePicks(sides: CongruenceSidePick[]): TriangleIds | undefined {
  const vertices = Array.from(new Set(sides.flatMap((side) => [side.p1, side.p2])));
  if (vertices.length !== 3) {
    return undefined;
  }

  const degrees = new Map(vertices.map((vertex) => [vertex, 0]));
  for (const side of sides) {
    degrees.set(side.p1, (degrees.get(side.p1) ?? 0) + 1);
    degrees.set(side.p2, (degrees.get(side.p2) ?? 0) + 1);
  }

  return vertices.every((vertex) => degrees.get(vertex) === 2) ? (vertices as TriangleIds) : undefined;
}

function sidePairMatchesMapping(
  firstSide: CongruenceSidePick,
  secondSide: CongruenceSidePick,
  mapping: Record<string, string>,
) {
  const mapped = canonicalSideRef(mapping[firstSide.p1], mapping[firstSide.p2]);
  return mapped === canonicalSideRef(secondSide.p1, secondSide.p2);
}

function orderedTriangleFromSSSSides(firstSides: CongruenceSidePick[], secondSides: CongruenceSidePick[]) {
  const triangle1 = triangleFromSidePicks(firstSides);
  const triangle2 = triangleFromSidePicks(secondSides);
  if (!triangle1 || !triangle2) {
    return undefined;
  }

  for (const orderedTriangle2 of permutations([...triangle2]) as TriangleIds[]) {
    const mapping = Object.fromEntries(triangle1.map((pointId, index) => [pointId, orderedTriangle2[index]]));
    if (firstSides.every((side, index) => sidePairMatchesMapping(side, secondSides[index], mapping))) {
      return { triangle1, triangle2: orderedTriangle2 };
    }
  }

  return undefined;
}

function congruenceSelectionIds(picks: CongruencePick[]) {
  const pointIds = new Set<string>();
  const segmentIds = new Set<string>();

  for (const pick of picks) {
    if (pick.kind === "side") {
      pointIds.add(pick.p1);
      pointIds.add(pick.p2);
      if (pick.segmentId) {
        segmentIds.add(pick.segmentId);
      }
      continue;
    }

    pointIds.add(pick.pointId);
    if (pick.ray1) {
      pointIds.add(pick.ray1);
    }
    if (pick.ray2) {
      pointIds.add(pick.ray2);
    }
  }

  return {
    pointIds: Array.from(pointIds),
    segmentIds: Array.from(segmentIds),
  };
}

function congruenceStepKind(method: CongruenceMethod, pickCount: number): CongruencePick["kind"] {
  if (method === "SSS") {
    return "side";
  }

  return pickCount === 1 || pickCount === 4 ? "vertex" : "side";
}

function congruenceGuideMessage(method: CongruenceMethod, pickCount: number) {
  if (method === "SSS") {
    return pickCount < 3
      ? "Click sides or drag endpoint to endpoint for the first triangle."
      : "Click or drag the corresponding sides of the second triangle in the same order.";
  }

  const sasMessages = [
    "Click a side, or drag endpoint to endpoint, for the first triangle.",
    "Click the included vertex, or draw a small arc across the angle.",
    "Click or drag the other side of the first triangle.",
    "Click or drag the corresponding side of the second triangle.",
    "Click the included vertex, or draw a small arc across the angle.",
    "Click or drag the other corresponding side of the second triangle.",
  ];
  return sasMessages[Math.min(pickCount, sasMessages.length - 1)];
}

function theoremSourceFor(method: CongruenceMethod) {
  return method === "SAS" ? "I.4" : "I.8";
}

function relationIdFor(method: CongruenceMethod, triangle1: TriangleIds, triangle2: TriangleIds) {
  return `${method.toLowerCase()}-${triangle1.join("").toLowerCase()}-${triangle2.join("").toLowerCase()}`;
}

function congruenceDerivedRelations(method: CongruenceMethod, triangle1: TriangleIds, triangle2: TriangleIds) {
  const sidesByIndex: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 2],
  ];

  return [
    { type: "triangle-congruence", a: triangle1.join(""), b: triangle2.join(""), method },
    ...sidesByIndex.map((side): GeometricRelation => ({
      type: "equal-length",
      a: sideRefFromIds([triangle1[side[0]], triangle1[side[1]]]),
      b: sideRefFromIds([triangle2[side[0]], triangle2[side[1]]]),
    })),
    ...[0, 1, 2].map((index): GeometricRelation => {
      const others = [0, 1, 2].filter((candidate) => candidate !== index);
      return {
        type: "equal-angle",
        a: angleRef(triangle1[others[0]], triangle1[index], triangle1[others[1]]),
        b: angleRef(triangle2[others[0]], triangle2[index], triangle2[others[1]]),
      };
    }),
  ] as GeometricRelation[];
}

function congruenceSuccess(
  method: CongruenceMethod,
  triangle1: TriangleIds,
  triangle2: TriangleIds,
  message: string,
): SASValidationSuccess {
  const pairKey = [triangleKey(triangle1), triangleKey(triangle2)].sort().join("|");
  const correspondence = Object.fromEntries(triangle1.map((pointId, index) => [pointId, triangle2[index]]));

  return {
    success: true,
    message,
    actionIds: [`${method.toLowerCase()}:${pairKey}`],
    relation: {
      id: relationIdFor(method, triangle1, triangle2),
      type: "triangle-congruence",
      method,
      triangle1,
      triangle2,
      correspondence,
      derivedRelations: congruenceDerivedRelations(method, triangle1, triangle2),
      createdBy: "logic-rule",
      propositionSource: theoremSourceFor(method),
    },
  };
}

function validateSSSBySidePicks(state: GeometryStore, picks: CongruencePick[]): SASValidationSuccess | SASValidationFailure {
  const firstSides = picks.slice(0, 3).filter((pick): pick is CongruenceSidePick => pick.kind === "side");
  const secondSides = picks.slice(3, 6).filter((pick): pick is CongruenceSidePick => pick.kind === "side");
  if (firstSides.length !== 3 || secondSides.length !== 3) {
    return { success: false, message: "SSS needs three sides from each triangle." };
  }

  const orderedTriangles = orderedTriangleFromSSSSides(firstSides, secondSides);
  if (!orderedTriangles) {
    return { success: false, message: "Those clicked sides do not form corresponding triangles." };
  }

  for (const [index, firstSide] of firstSides.entries()) {
    const secondSide = secondSides[index];
    if (!sidesAreEqualForSAS(state, sidePickEndpoints(firstSide), sidePickEndpoints(secondSide))) {
      return {
        success: false,
        message: `Side pair ${index + 1} is not known equal: ${sideLabel(state, sidePickEndpoints(firstSide))} and ${sideLabel(
          state,
          sidePickEndpoints(secondSide),
        )}.`,
      };
    }
  }

  return congruenceSuccess(
    "SSS",
    orderedTriangles.triangle1,
    orderedTriangles.triangle2,
    `SSS: triangle ${orderedTriangles.triangle1.join("")} is congruent to triangle ${orderedTriangles.triangle2.join("")}.`,
  );
}

function validateSASByPartPicks(state: GeometryStore, picks: CongruencePick[]): SASValidationSuccess | SASValidationFailure {
  const side1 = picks[0]?.kind === "side" ? picks[0] : undefined;
  const vertexPick1 = picks[1]?.kind === "vertex" ? picks[1] : undefined;
  const vertex1 = vertexPick1?.pointId;
  const side2 = picks[2]?.kind === "side" ? picks[2] : undefined;
  const targetSide1 = picks[3]?.kind === "side" ? picks[3] : undefined;
  const vertexPick2 = picks[4]?.kind === "vertex" ? picks[4] : undefined;
  const vertex2 = vertexPick2?.pointId;
  const targetSide2 = picks[5]?.kind === "side" ? picks[5] : undefined;
  if (!side1 || !vertex1 || !side2 || !targetSide1 || !vertex2 || !targetSide2) {
    return { success: false, message: "SAS needs side, included vertex, side for each triangle." };
  }

  if (!sidePickIncludes(side1, vertex1) || !sidePickIncludes(side2, vertex1)) {
    return { success: false, message: "The first angle vertex is not between the two selected sides." };
  }

  if (!sidePickIncludes(targetSide1, vertex2) || !sidePickIncludes(targetSide2, vertex2)) {
    return { success: false, message: "The second angle vertex is not between the two selected sides." };
  }

  if (!vertexPickRaysMatchSides(state, vertexPick1, side1, side2)) {
    return { success: false, message: "The first drawn angle arc does not match the two selected sides." };
  }

  if (!vertexPickRaysMatchSides(state, vertexPick2, targetSide1, targetSide2)) {
    return { success: false, message: "The second drawn angle arc does not match the two selected sides." };
  }

  const firstOther1 = sidePickOtherEndpoint(side1, vertex1);
  const firstOther2 = sidePickOtherEndpoint(side2, vertex1);
  const secondOther1 = sidePickOtherEndpoint(targetSide1, vertex2);
  const secondOther2 = sidePickOtherEndpoint(targetSide2, vertex2);
  if (!firstOther1 || !firstOther2 || !secondOther1 || !secondOther2 || firstOther1 === firstOther2 || secondOther1 === secondOther2) {
    return { success: false, message: "The selected sides do not make two triangles." };
  }

  if (!sidesAreEqualForSAS(state, sidePickEndpoints(side1), sidePickEndpoints(targetSide1))) {
    return {
      success: false,
      message: `The first side pair is not known equal: ${sideLabel(state, sidePickEndpoints(side1))} and ${sideLabel(
        state,
        sidePickEndpoints(targetSide1),
      )}.`,
    };
  }

  if (!anglesAreEqualForSAS(state, [firstOther1, vertex1, firstOther2], [secondOther1, vertex2, secondOther2])) {
    return { success: false, message: "The included angle pair is not known equal." };
  }

  if (!sidesAreEqualForSAS(state, sidePickEndpoints(side2), sidePickEndpoints(targetSide2))) {
    return {
      success: false,
      message: `The second side pair is not known equal: ${sideLabel(state, sidePickEndpoints(side2))} and ${sideLabel(
        state,
        sidePickEndpoints(targetSide2),
      )}.`,
    };
  }

  const triangle1: TriangleIds = [vertex1, firstOther1, firstOther2];
  const triangle2: TriangleIds = [vertex2, secondOther1, secondOther2];

  return congruenceSuccess("SAS", triangle1, triangle2, `SAS: triangle ${triangle1.join("")} is congruent to triangle ${triangle2.join("")}.`);
}

function validateCongruenceSelection(state: GeometryStore, selection: CongruenceSelection): SASValidationSuccess | SASValidationFailure {
  return selection.method === "SAS" ? validateSASByPartPicks(state, selection.picks) : validateSSSBySidePicks(state, selection.picks);
}

function startingCongruenceSelection(tool: GeometryTool): CongruenceSelection | null {
  if (tool === "theorem-sas") {
    return {
      method: "SAS",
      picks: [],
      message: congruenceGuideMessage("SAS", 0),
      status: "idle",
    };
  }

  if (tool === "theorem-sss") {
    return {
      method: "SSS",
      picks: [],
      message: congruenceGuideMessage("SSS", 0),
      status: "idle",
    };
  }

  return null;
}

function vertexPickRaysMatchSides(
  state: GeometryStore,
  pick: CongruenceVertexPick | undefined,
  firstSide: CongruenceSidePick,
  secondSide: CongruenceSidePick,
) {
  if (!pick?.ray1 || !pick.ray2) {
    return true;
  }

  const firstOther = sidePickOtherEndpoint(firstSide, pick.pointId);
  const secondOther = sidePickOtherEndpoint(secondSide, pick.pointId);
  if (!firstOther || !secondOther) {
    return false;
  }

  const firstRayMatchesFirstSide = pointsShareRayFromVertex(state.objects, pick.pointId, pick.ray1, firstOther);
  const secondRayMatchesSecondSide = pointsShareRayFromVertex(state.objects, pick.pointId, pick.ray2, secondOther);
  const firstRayMatchesSecondSide = pointsShareRayFromVertex(state.objects, pick.pointId, pick.ray1, secondOther);
  const secondRayMatchesFirstSide = pointsShareRayFromVertex(state.objects, pick.pointId, pick.ray2, firstOther);
  return (firstRayMatchesFirstSide && secondRayMatchesSecondSide) || (firstRayMatchesSecondSide && secondRayMatchesFirstSide);
}

function completeCongruenceSelection(state: GeometryStore, result: SASValidationSuccess, nextSelection: CongruenceSelection) {
  const nextCompletedActionIds = addCompletedActions(state, result.actionIds);
  const nextRelations = state.reasoningRelations.some((relation) => relation.id === result.relation.id)
    ? state.reasoningRelations
    : [...state.reasoningRelations, result.relation];
  const completion = validateProposition(state.currentPropositionId, state.objects, nextCompletedActionIds, nextRelations);
  const ids = congruenceSelectionIds(nextSelection.picks);

  if (completion.success) {
    return {
      phase: "constructionComplete" as AppPhase,
      theoremSelectionIds: [],
      selectedPointIds: [],
      compassTransferSource: null,
      completedActionIds: nextCompletedActionIds,
      reasoningRelations: nextRelations,
      congruenceSelection: {
        ...nextSelection,
        status: "success" as const,
        message: result.message,
      },
      validation: completion,
      proofContext: completion.context ?? null,
      currentReplayStep: 0,
      animatedObjectId: null,
    };
  }

  return {
    theoremSelectionIds: ids.segmentIds,
    selectedPointIds: ids.pointIds,
    compassTransferSource: null,
    completedActionIds: nextCompletedActionIds,
    reasoningRelations: nextRelations,
    congruenceSelection: {
      ...nextSelection,
      status: "success" as const,
      message: result.message,
    },
    validation: {
      success: true,
      message: result.message,
    },
  };
}

function preparedCongruenceSelection(state: GeometryStore) {
  const baseSelection = state.congruenceSelection ?? startingCongruenceSelection(state.selectedTool);
  if (!baseSelection) {
    return undefined;
  }

  return baseSelection.status === "error" && baseSelection.picks.length >= 6
    ? {
        ...baseSelection,
        picks: [],
        status: "idle" as const,
        message: congruenceGuideMessage(baseSelection.method, 0),
      }
    : baseSelection;
}

function applyCongruencePick(state: GeometryStore, selection: CongruenceSelection, nextPick: CongruencePick) {
  const nextSelection: CongruenceSelection = {
    method: selection.method,
    picks: [...selection.picks, nextPick],
    status: "idle",
    message: congruenceGuideMessage(selection.method, selection.picks.length + 1),
  };
  const ids = congruenceSelectionIds(nextSelection.picks);
  const requiredPickCount = 6;
  if (nextSelection.picks.length < requiredPickCount) {
    return {
      selectedPointIds: ids.pointIds,
      theoremSelectionIds: ids.segmentIds,
      compassTransferSource: null,
      congruenceSelection: nextSelection,
      validation: null,
    };
  }

  const result = validateCongruenceSelection(state, nextSelection);
  if (!result.success) {
    return {
      selectedPointIds: [],
      theoremSelectionIds: [],
      compassTransferSource: null,
      congruenceSelection: {
        method: selection.method,
        picks: [],
        status: "error" as const,
        message: result.message,
      },
      validation: {
        success: false,
        message: result.message,
      },
    };
  }

  return completeCongruenceSelection(state, result, nextSelection);
}

function handleCongruenceToolClick(state: GeometryStore, x: number, y: number) {
  const selection = preparedCongruenceSelection(state);
  if (!selection) {
    return undefined;
  }

  const expectedKind = congruenceStepKind(selection.method, selection.picks.length);
  const nextPick =
    expectedKind === "side"
      ? findCongruenceSideAt(state, x, y)
      : (() => {
          const point = findNearbyPoint(state.objects, x, y, 24);
          return point ? ({ kind: "vertex", pointId: point.id } as CongruenceVertexPick) : undefined;
        })();

  if (!nextPick) {
    return {
      congruenceSelection: {
        ...selection,
        status: "error" as const,
        message: expectedKind === "side" ? "Click a side, or drag from endpoint to endpoint." : "Click the included angle vertex, or draw a small arc.",
      },
      validation: {
        success: false,
        message: expectedKind === "side" ? "Click a side, or drag from endpoint to endpoint." : "Click the included angle vertex, or draw a small arc.",
      },
    };
  }

  return applyCongruencePick(state, selection, nextPick);
}

function handleCongruenceToolDrag(state: GeometryStore, startX: number, startY: number, endX: number, endY: number) {
  const selection = preparedCongruenceSelection(state);
  if (!selection) {
    return undefined;
  }

  const expectedKind = congruenceStepKind(selection.method, selection.picks.length);
  const nextPick =
    expectedKind === "side"
      ? findCongruenceSideByEndpointDrag(state, startX, startY, endX, endY)
      : inferCongruenceAngleArc(state, startX, startY, endX, endY);

  if (!nextPick) {
    const message =
      expectedKind === "side"
        ? "Drag from one endpoint to another endpoint of the intended side."
        : "Draw a small arc from one side of the included angle to the other.";
    return {
      selectedPointIds: [],
      theoremSelectionIds: [],
      compassTransferSource: null,
      congruenceSelection: {
        ...selection,
        status: "error" as const,
        message,
      },
      validation: {
        success: false,
        message,
      },
    };
  }

  return applyCongruencePick(state, selection, nextPick);
}

function validateSASByTriangleNames(state: GeometryStore, triangleInput1: string, triangleInput2: string): SASValidationSuccess | SASValidationFailure {
  const parsed1 = parseTriangleInput(state.objects, triangleInput1);
  const parsed2 = parseTriangleInput(state.objects, triangleInput2);
  if (!parsed1.triangle || !parsed2.triangle) {
    return { success: false, message: parsed1.message ?? parsed2.message ?? "These triangle names do not match existing points." };
  }

  const triangle1 = parsed1.triangle;
  const triangle2 = parsed2.triangle;
  const triangle1Key = triangleKey(triangle1);
  const triangle2Key = triangleKey(triangle2);
  if (triangle1Key === triangle2Key) {
    return { success: false, message: "Choose two different triangles." };
  }

  const sidesByIndex: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 2],
  ];
  const sidePairs: Array<[[number, number], [number, number]]> = [
    [sidesByIndex[0], sidesByIndex[1]],
    [sidesByIndex[0], sidesByIndex[2]],
    [sidesByIndex[1], sidesByIndex[2]],
  ];
  let hasTwoCorrespondingSides = false;
  let hasNonIncludedAngleEquality = false;

  for (const orderedTriangle2 of permutations([...triangle2]) as TriangleIds[]) {
    const correspondence = Object.fromEntries(triangle1.map((pointId, index) => [pointId, orderedTriangle2[index]]));

    for (const [sideA, sideB] of sidePairs) {
      const side1A: [string, string] = [triangle1[sideA[0]], triangle1[sideA[1]]];
      const side2A: [string, string] = [orderedTriangle2[sideA[0]], orderedTriangle2[sideA[1]]];
      const side1B: [string, string] = [triangle1[sideB[0]], triangle1[sideB[1]]];
      const side2B: [string, string] = [orderedTriangle2[sideB[0]], orderedTriangle2[sideB[1]]];

      if (!sidesAreEqualForSAS(state, side1A, side2A) || !sidesAreEqualForSAS(state, side1B, side2B)) {
        continue;
      }

      hasTwoCorrespondingSides = true;
      const shared = sharedVertexIndex(sideA, sideB);
      if (shared === undefined) {
        continue;
      }

      const otherA = oppositeIndex(sideA, shared);
      const otherB = oppositeIndex(sideB, shared);
      const includedAngle1: [string, string, string] = [triangle1[otherA], triangle1[shared], triangle1[otherB]];
      const includedAngle2: [string, string, string] = [
        orderedTriangle2[otherA],
        orderedTriangle2[shared],
        orderedTriangle2[otherB],
      ];
      const otherAngles = [0, 1, 2].filter((index) => index !== shared);
      hasNonIncludedAngleEquality =
        hasNonIncludedAngleEquality ||
        otherAngles.some((index) => {
          const others = [0, 1, 2].filter((candidate) => candidate !== index);
          return anglesAreEqualForSAS(
            state,
            [triangle1[others[0]], triangle1[index], triangle1[others[1]]],
            [orderedTriangle2[others[0]], orderedTriangle2[index], orderedTriangle2[others[1]]],
          );
        });

      if (!anglesAreEqualForSAS(state, includedAngle1, includedAngle2)) {
        continue;
      }

      const pairKey = [triangle1Key, triangle2Key].sort().join("|");
      const actionIds = [`sas:${pairKey}`];

      const derivedRelations: GeometricRelation[] = [
        { type: "triangle-congruence", a: triangle1.join(""), b: orderedTriangle2.join(""), method: "SAS" },
        ...sidesByIndex.map((side): GeometricRelation => ({
          type: "equal-length",
          a: sideRefFromIds([triangle1[side[0]], triangle1[side[1]]]),
          b: sideRefFromIds([orderedTriangle2[side[0]], orderedTriangle2[side[1]]]),
        })),
        ...[0, 1, 2].map((index): GeometricRelation => {
          const others = [0, 1, 2].filter((candidate) => candidate !== index);
          return {
            type: "equal-angle",
            a: angleRef(triangle1[others[0]], triangle1[index], triangle1[others[1]]),
            b: angleRef(orderedTriangle2[others[0]], orderedTriangle2[index], orderedTriangle2[others[1]]),
          };
        }),
      ];

      return {
        success: true,
        message: `SAS: triangle ${triangle1.join("")} is congruent to triangle ${orderedTriangle2.join("")}.`,
        actionIds,
        relation: {
          id: `sas-${triangle1.join("").toLowerCase()}-${orderedTriangle2.join("").toLowerCase()}`,
          type: "triangle-congruence",
          method: "SAS",
          triangle1,
          triangle2: orderedTriangle2,
          correspondence,
          derivedRelations,
          createdBy: "logic-rule",
          propositionSource: "I.4",
        },
      };
    }
  }

  if (!hasTwoCorrespondingSides) {
    return { success: false, message: "Two corresponding sides are not equal." };
  }

  if (hasNonIncludedAngleEquality) {
    return { success: false, message: "The equal angle is not between the two equal sides." };
  }

  return { success: false, message: "The included angle is not equal." };
}

function validateSSSByTriangleNames(state: GeometryStore, triangleInput1: string, triangleInput2: string): SASValidationSuccess | SASValidationFailure {
  const parsed1 = parseProp11SSSAlias(state, triangleInput1) ?? parseTriangleInput(state.objects, triangleInput1);
  const parsed2 = parseProp11SSSAlias(state, triangleInput2) ?? parseTriangleInput(state.objects, triangleInput2);
  if (!parsed1.triangle || !parsed2.triangle) {
    return { success: false, message: parsed1.message ?? parsed2.message ?? "These triangle names do not match existing points." };
  }

  const triangle1 = parsed1.triangle;
  const triangle2 = parsed2.triangle;
  const triangle1Key = triangleKey(triangle1);
  const triangle2Key = triangleKey(triangle2);
  if (triangle1Key === triangle2Key) {
    return { success: false, message: "Choose two different triangles." };
  }

  const sidesByIndex: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 2],
  ];
  const matchingSides = sidesByIndex.every((side) =>
    sidesAreEqualForSAS(state, [triangle1[side[0]], triangle1[side[1]]], [triangle2[side[0]], triangle2[side[1]]]),
  );

  if (!matchingSides) {
    const anyReorderedMatch = permutations([...triangle2]).some((orderedTriangle2) =>
      sidesByIndex.every((side) =>
        sidesAreEqualForSAS(
          state,
          [triangle1[side[0]], triangle1[side[1]]],
          [orderedTriangle2[side[0]], orderedTriangle2[side[1]]],
        ),
      ),
    );

    return {
      success: false,
      message: anyReorderedMatch
        ? "The letters must be ordered so corresponding vertices line up."
        : "Three corresponding sides are not equal.",
    };
  }

  const pairKey = [triangle1Key, triangle2Key].sort().join("|");
  const actionIds = [`sss:${pairKey}`];

  const correspondence = Object.fromEntries(triangle1.map((pointId, index) => [pointId, triangle2[index]]));
  const derivedRelations: GeometricRelation[] = [
    { type: "triangle-congruence", a: triangle1.join(""), b: triangle2.join(""), method: "SSS" },
    ...sidesByIndex.map((side): GeometricRelation => ({
      type: "equal-length",
      a: sideRefFromIds([triangle1[side[0]], triangle1[side[1]]]),
      b: sideRefFromIds([triangle2[side[0]], triangle2[side[1]]]),
    })),
    ...[0, 1, 2].map((index): GeometricRelation => {
      const others = [0, 1, 2].filter((candidate) => candidate !== index);
      return {
        type: "equal-angle",
        a: angleRef(triangle1[others[0]], triangle1[index], triangle1[others[1]]),
        b: angleRef(triangle2[others[0]], triangle2[index], triangle2[others[1]]),
      };
    }),
  ];

  return {
    success: true,
    message: `SSS: triangle ${triangle1.join("")} is congruent to triangle ${triangle2.join("")}.`,
    actionIds,
    relation: {
      id: `sss-${triangle1.join("").toLowerCase()}-${triangle2.join("").toLowerCase()}`,
      type: "triangle-congruence",
      method: "SSS",
      triangle1,
      triangle2,
      correspondence,
      derivedRelations,
      createdBy: "logic-rule",
      propositionSource: "I.8",
    },
  };
}

function segmentLength(objects: GeometryObject[], segment: Segment) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  return p1 && p2 ? distance(p1, p2) : undefined;
}

function distanceToSegmentAt(objects: GeometryObject[], segment: Segment, x: number, y: number) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  if (!p1 || !p2) {
    return Number.POSITIVE_INFINITY;
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return Math.hypot(x - p1.x, y - p1.y);
  }

  const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSquared));
  return Math.hypot(x - (p1.x + t * dx), y - (p1.y + t * dy));
}

function findSegmentForPointOnLine(objects: GeometryObject[], point: Point) {
  return objects
    .filter((object): object is Segment => object.type === "segment")
    .map((segment) => ({ segment, distance: distanceToSegmentAt(objects, segment, point.x, point.y) }))
    .filter(({ distance: pointDistance }) => pointDistance <= 8)
    .sort((a, b) => a.distance - b.distance)[0]?.segment;
}

type CopyLengthTarget = {
  object: Segment | ExtendedLine;
  start: Point;
  through: Point;
  projected: { x: number; y: number; t: number };
  distance: number;
};

function projectToObjectLine(start: Point, through: Point, x: number, y: number) {
  const dx = through.x - start.x;
  const dy = through.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return undefined;
  }

  const t = ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared;
  return {
    x: start.x + t * dx,
    y: start.y + t * dy,
    t,
  };
}

function copyLengthTargetAt(objects: GeometryObject[], x: number, y: number, tolerance = 30): CopyLengthTarget | undefined {
  const candidates = objects
    .filter((object): object is Segment | ExtendedLine => object.type === "segment" || object.type === "extended-line")
    .map((object) => {
      const start = getPoint(objects, object.type === "segment" ? object.p1 : object.from);
      const through = getPoint(objects, object.type === "segment" ? object.p2 : object.through);
      const projected = start && through ? projectToObjectLine(start, through, x, y) : undefined;
      if (!start || !through || !projected) {
        return undefined;
      }

      if (object.type === "segment") {
        if (object.ray && projected.t < -0.03) {
          return undefined;
        }

        if (!object.ray && object.given && (projected.t < -0.03 || projected.t > 1.03)) {
          return undefined;
        }
      }

      const candidateDistance = Math.hypot(x - projected.x, y - projected.y);
      return candidateDistance <= tolerance
        ? {
            object,
            start,
            through,
            projected,
            distance: candidateDistance,
          }
        : undefined;
    })
    .filter((candidate): candidate is CopyLengthTarget => Boolean(candidate));

  return candidates.sort((a, b) => a.distance - b.distance)[0];
}

function directionForCopyTarget(target: CopyLengthTarget, startPoint: Point) {
  let dx = target.projected.x - startPoint.x;
  let dy = target.projected.y - startPoint.y;

  if (Math.hypot(dx, dy) < 5) {
    if (target.object.type === "segment" && target.object.ray && target.object.p1 === startPoint.id) {
      dx = target.through.x - target.start.x;
      dy = target.through.y - target.start.y;
    } else if (target.start.id === startPoint.id) {
      dx = target.through.x - target.start.x;
      dy = target.through.y - target.start.y;
    } else if (target.through.id === startPoint.id) {
      dx = target.start.x - target.through.x;
      dy = target.start.y - target.through.y;
    } else {
      dx = target.through.x - target.start.x;
      dy = target.through.y - target.start.y;
    }
  }

  const length = Math.hypot(dx, dy);
  return length < 1 ? undefined : { x: dx / length, y: dy / length };
}

function constructCopiedLengthOnTarget(
  state: GeometryStore,
  source: { p1: string; p2: string; segmentId?: string },
  startPointId: string,
  targetX: number,
  targetY: number,
) {
  const sourceA = getPoint(state.objects, source.p1);
  const sourceB = getPoint(state.objects, source.p2);
  const startPoint = getPoint(state.objects, startPointId);
  const target = copyLengthTargetAt(state.objects, targetX, targetY);
  if (!sourceA || !sourceB || !startPoint || !target) {
    return {
      validation: {
        success: false,
        message: "Choose a target line or ray for the copied length.",
      },
    };
  }

  const direction = directionForCopyTarget(target, startPoint);
  if (!direction) {
    return undefined;
  }

  const copiedLength = distance(sourceA, sourceB);
  const endpointCoordinates = {
    x: startPoint.x + direction.x * copiedLength,
    y: startPoint.y + direction.y * copiedLength,
  };
  const provenanceSource = state.currentPropositionId === "I.2" ? "I.2" : "I.3";
  const sourceSegmentObjects = source.segmentId
    ? []
    : addFiniteSegmentIfMissing(state.objects, source.p1, source.p2, "gold", provenanceSource);
  const objectsWithSource = [...state.objects, ...sourceSegmentObjects];
  const existingEndpoint = pointNearCoordinates(
    objectsWithSource.filter((object): object is Point => object.type === "point"),
    endpointCoordinates.x,
    endpointCoordinates.y,
    5,
  );
  const endpoint =
    existingEndpoint ??
    createPoint(pointLabel(state, objectsWithSource), endpointCoordinates.x, endpointCoordinates.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [
        source.p1,
        source.p2,
        startPoint.id,
        target.object.id,
        ...(source.segmentId ? [source.segmentId] : []),
      ],
      source: provenanceSource,
    });
  const objectsWithEndpoint = existingEndpoint ? objectsWithSource : [...objectsWithSource, endpoint];
  const copiedSegment = addFiniteSegmentIfMissing(objectsWithEndpoint, startPoint.id, endpoint.id, "gold", provenanceSource);
  const actionIds =
    state.currentPropositionId === "I.6" &&
    canonicalSideRef(source.p1, source.p2) === "AC" &&
    startPoint.id === "B"
      ? ["prop6-assume-ab-greater", "prop6-use-cut-equal", "prop6-cut-db-ac"]
      : [];

  return {
    objects: [...sourceSegmentObjects, ...(existingEndpoint ? [] : [endpoint]), ...copiedSegment],
    animatedObjectId: copiedSegment[0]?.id ?? endpoint.id,
    actionIds,
  };
}

function includedAngle(objects: GeometryObject[], side1: Segment, vertexId: string, side2: Segment) {
  const vertex = getPoint(objects, vertexId);
  const other1 = getPoint(objects, side1.p1 === vertexId ? side1.p2 : side1.p1);
  const other2 = getPoint(objects, side2.p1 === vertexId ? side2.p2 : side2.p1);
  return vertex && other1 && other2 ? angleAt(vertex, other1, other2) : undefined;
}

function addCompletedActions(state: GeometryStore, actionIds: string[]) {
  return Array.from(new Set([...state.completedActionIds, ...actionIds]));
}

function addObjectsAndMaybeCompleteProp14(
  state: GeometryStore,
  newObjects: GeometryObject[],
  selectedPointIds: string[] = [],
  animatedObjectId?: string,
) {
  if (state.currentPropositionId !== "I.14") {
    return addObjectsAndSelect(state, newObjects, selectedPointIds, animatedObjectId);
  }

  const nextObjects = [...state.objects, ...newObjects];
  const actionId = prop14StraightLineAction(nextObjects);
  if (!actionId) {
    return addObjectsAndSelect(state, newObjects, selectedPointIds, animatedObjectId);
  }

  const nextCompletedActionIds = addCompletedActions(state, [actionId]);
  const completion = validateProposition(
    state.currentPropositionId,
    nextObjects,
    nextCompletedActionIds,
    state.reasoningRelations,
  );
  if (!completion.success) {
    return {
      ...addObjectsAndSelect(state, newObjects, selectedPointIds, animatedObjectId),
      completedActionIds: nextCompletedActionIds,
      validation: completion,
    };
  }

  return {
    phase: "constructionComplete" as AppPhase,
    objects: nextObjects,
    history: [...state.history, state.objects],
    validation: completion,
    proofContext: completion.context ?? null,
    currentReplayStep: 0,
    animatedObjectId: animatedObjectId ?? newObjects[newObjects.length - 1]?.id ?? null,
    selectedPointIds: [],
    theoremSelectionIds: [],
    congruenceSelection: null,
    compassTransferSource: null,
    completedActionIds: nextCompletedActionIds,
  };
}

function applySASSelection(state: GeometryStore, ids: string[]) {
  const [refSide1Id, targetSide1Id, refAngleId, targetAngleId, refSide2Id, targetSide2Id] = ids;
  const refSide1 = getSegment(state.objects, refSide1Id);
  const targetSide1 = getSegment(state.objects, targetSide1Id);
  const refSide2 = getSegment(state.objects, refSide2Id);
  const targetSide2 = getSegment(state.objects, targetSide2Id);
  if (!refSide1 || !targetSide1 || !refSide2 || !targetSide2) {
    return { success: false, message: "SAS needs four side selections and two angle vertices." };
  }

  const refTriangle = triangleFromIncludedSides(refSide1, refAngleId, refSide2);
  const targetTriangle = triangleFromIncludedSides(targetSide1, targetAngleId, targetSide2);
  if (!refTriangle || !targetTriangle) {
    return { success: false, message: "The selected angle must be included between the two selected sides." };
  }

  const refLength1 = segmentLength(state.objects, refSide1);
  const targetLength1 = segmentLength(state.objects, targetSide1);
  const refLength2 = segmentLength(state.objects, refSide2);
  const targetLength2 = segmentLength(state.objects, targetSide2);
  const refAngle = includedAngle(state.objects, refSide1, refAngleId, refSide2);
  const targetAngle = includedAngle(state.objects, targetSide1, targetAngleId, targetSide2);
  if (
    refLength1 === undefined ||
    targetLength1 === undefined ||
    refLength2 === undefined ||
    targetLength2 === undefined ||
    refAngle === undefined ||
    targetAngle === undefined ||
    !areDistancesEqual(refLength1, targetLength1, 8) ||
    !areDistancesEqual(refLength2, targetLength2, 8) ||
    !areAnglesEqual(refAngle, targetAngle, 0.08)
  ) {
    return { success: false, message: "Those sides and included angles do not match closely enough for SAS." };
  }

  const pairKey = [triangleKey(refTriangle), triangleKey(targetTriangle)].sort().join("|");
  const actionIds = [`sas:${pairKey}`];

  return {
    success: true,
    message: `SAS recorded for triangles ${triangleKey(refTriangle)} and ${triangleKey(targetTriangle)}.`,
    actionIds,
  };
}

function constructPerpendicularOnSegment(state: GeometryStore, segment: Segment, x: number, y: number) {
  const points = segmentPoints(state.objects, segment);
  if (!points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const lengthSquared = dx * dx + dy * dy;
  const length = Math.sqrt(lengthSquared);
  if (length < 1) {
    return undefined;
  }

  const t = ((x - points.p1.x) * dx + (y - points.p1.y) * dy) / lengthSquared;
  const baseX = points.p1.x + Math.max(0, Math.min(1, t)) * dx;
  const baseY = points.p1.y + Math.max(0, Math.min(1, t)) * dy;
  const base = pointAtForAction(state, state.objects, baseX, baseY, "I.11", "gold");
  const objectsWithBase = [...state.objects, ...base.objects];
  const height = Math.min(220, Math.max(120, length * 0.45));
  const endpoint = pointAtForAction(
    state,
    objectsWithBase,
    base.point.x - (dy / length) * height,
    base.point.y + (dx / length) * height,
    "I.11",
    "gold",
  );
  const objectsWithPoints = [...objectsWithBase, ...endpoint.objects];
  const line = addSegmentIfMissing(objectsWithPoints, base.point.id, endpoint.point.id, "gold", "I.11");

  return {
    objects: [...base.objects, ...endpoint.objects, ...line],
    animatedObjectId: line[0]?.id ?? endpoint.point.id,
  };
}

function signedLineSide(start: { x: number; y: number }, end: { x: number; y: number }, point: { x: number; y: number }) {
  return (end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x);
}

function distanceToInfiniteLine(start: { x: number; y: number }, end: { x: number; y: number }, point: { x: number; y: number }) {
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return length < 1 ? Number.POSITIVE_INFINITY : Math.abs(signedLineSide(start, end, point)) / length;
}

function pointBetweenOnLooseLine(left: Point, point: Point, right: Point) {
  const dot = (left.x - point.x) * (right.x - point.x) + (left.y - point.y) * (right.y - point.y);
  return distanceToInfiniteLine(left, right, point) <= 16 && dot < 0;
}

function prop14StraightLineAction(objects: GeometryObject[]) {
  const A = getPoint(objects, "A");
  const B = getPoint(objects, "B");
  const C = getPoint(objects, "C");
  const D = getPoint(objects, "D");
  if (!A || !B || !C || !D) {
    return undefined;
  }

  const segmentAB = segmentExistsBetween(objects, "A", "B");
  const segmentCB = segmentExistsBetween(objects, "C", "B");
  const segmentBD = segmentExistsBetween(objects, "B", "D");
  const segmentCD = segmentExistsBetween(objects, "C", "D");
  if (!segmentAB || !segmentCB || !segmentBD || !segmentCD) {
    return undefined;
  }

  if (!pointBetweenOnLooseLine(C, B, D)) {
    return undefined;
  }

  const sideC = signedLineSide(A, B, C);
  const sideD = signedLineSide(A, B, D);
  if (distanceToInfiniteLine(A, B, C) <= 8 || distanceToInfiniteLine(A, B, D) <= 8 || Math.sign(sideC) === Math.sign(sideD)) {
    return undefined;
  }

  return "prop14-connect-cd";
}

function standingSegmentThroughBase(objects: GeometryObject[], basePoint: Point, lineStart: Point, lineEnd: Point) {
  const labeledA = pointByLabel(objects, "A");
  const labeledSegment = labeledA ? segmentExistsBetween(objects, labeledA.id, basePoint.id) : undefined;
  if (labeledA && labeledSegment) {
    return { point: labeledA, segment: labeledSegment };
  }

  return objects
    .filter((object): object is Segment => object.type === "segment" && (object.p1 === basePoint.id || object.p2 === basePoint.id))
    .map((segment) => {
      const otherId = segment.p1 === basePoint.id ? segment.p2 : segment.p1;
      const point = getPoint(objects, otherId);
      return point ? { point, segment } : undefined;
    })
    .filter((candidate): candidate is { point: Point; segment: Segment } => Boolean(candidate))
    .find(({ point }) => distanceToInfiniteLine(lineStart, lineEnd, point) > 8);
}

function constructProp13PerpendicularOnLine(state: GeometryStore, basePointId: string, lineSegment: Segment) {
  if (state.currentPropositionId !== "I.13") {
    return undefined;
  }

  const basePoint = getPoint(state.objects, basePointId);
  const linePoints = segmentPoints(state.objects, lineSegment);
  if (!basePoint || !linePoints || distanceToInfiniteLine(linePoints.p1, linePoints.p2, basePoint) > 10) {
    return undefined;
  }

  const standing = standingSegmentThroughBase(state.objects, basePoint, linePoints.p1, linePoints.p2);
  if (!standing) {
    return {
      validation: {
        success: false,
        message: "Draw AB standing on CD first, with B on CD.",
      },
    };
  }

  const side = signedLineSide(linePoints.p1, linePoints.p2, standing.point);
  if (Math.abs(side) < 1) {
    return {
      validation: {
        success: false,
        message: "AB must stand off CD before EB can be raised on the same side.",
      },
    };
  }

  const dx = linePoints.p2.x - linePoints.p1.x;
  const dy = linePoints.p2.y - linePoints.p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) {
    return undefined;
  }

  const height = Math.min(190, Math.max(120, distance(basePoint, standing.point) * 0.75));
  const candidates = [
    { x: basePoint.x - (dy / length) * height, y: basePoint.y + (dx / length) * height },
    { x: basePoint.x + (dy / length) * height, y: basePoint.y - (dx / length) * height },
  ];
  const target =
    candidates.find((candidate) => Math.sign(signedLineSide(linePoints.p1, linePoints.p2, candidate)) === Math.sign(side)) ??
    candidates[0];

  const existingE =
    pointByLabel(state.objects, "E") ??
    pointNearCoordinates(
      state.objects.filter((object): object is Point => object.type === "point"),
      target.x,
      target.y,
      5,
    );
  const E =
    existingE ??
    createPoint("E", target.x, target.y, "theorem-action", {
      color: "gold",
      parentObjectIds: [basePoint.id, lineSegment.id, standing.segment.id],
      source: "I.13",
    });

  const objectsWithE = existingE ? state.objects : [...state.objects, E];
  const segmentEB = addSegmentIfMissing(objectsWithE, E.id, basePoint.id, "gold", "I.13");

  return {
    objects: [...(existingE ? [] : [E]), ...segmentEB],
    animatedObjectId: segmentEB[0]?.id ?? E.id,
    completedActionId: "prop13-perpendicular-eb",
  };
}

function dropPerpendicularToSegment(state: GeometryStore, externalPointId: string, segment: Segment) {
  const externalPoint = getPoint(state.objects, externalPointId);
  const points = segmentPoints(state.objects, segment);
  if (!externalPoint || !points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 1) {
    return undefined;
  }

  const t = ((externalPoint.x - points.p1.x) * dx + (externalPoint.y - points.p1.y) * dy) / lengthSquared;
  const foot = pointAtForAction(
    state,
    state.objects,
    points.p1.x + Math.max(0, Math.min(1, t)) * dx,
    points.p1.y + Math.max(0, Math.min(1, t)) * dy,
    "I.12",
    "gold",
  );
  const objectsWithFoot = [...state.objects, ...foot.objects];
  const segmentToFoot = addSegmentIfMissing(objectsWithFoot, externalPoint.id, foot.point.id, "gold", "I.12");

  return {
    objects: [...foot.objects, ...segmentToFoot],
    animatedObjectId: segmentToFoot[0]?.id ?? foot.point.id,
  };
}

function constructProp42ParallelThroughPoint(state: GeometryStore, pointId: string, segment: Segment) {
  if (state.currentPropositionId !== "I.42") {
    return undefined;
  }

  const A = getPoint(state.objects, "A");
  const C = getPoint(state.objects, "C");
  const E = state.objects.find(
    (object): object is Point =>
      object.type === "point" &&
      !["A", "B", "C", "D", "H", "K"].includes(object.id) &&
      Boolean(C && sideSupportSegment(state.objects, object, C)),
  );
  const F = state.objects.find(
    (object): object is Point =>
      object.type === "point" &&
      E?.id !== object.id &&
      !["A", "B", "C", "D", "H", "K"].includes(object.id) &&
      Boolean(E && segmentExistsBetween(state.objects, E.id, object.id)),
  );
  if (!A || !C || !E || !F) {
    return undefined;
  }

  const ecSupport = sideSupportSegment(state.objects, E, C);
  const efSupport = sideSupportSegment(state.objects, E, F);
  const isEC = sideMatches([segment.p1, segment.p2], [E.id, "C"]) || ecSupport?.id === segment.id;
  const isEF = sideMatches([segment.p1, segment.p2], [E.id, F.id]) || efSupport?.id === segment.id;
  if ((pointId === "A" && !isEC) || (pointId === "C" && !isEF)) {
    return undefined;
  }

  const gCoordinates = {
    x: F.x + (C.x - E.x),
    y: F.y + (C.y - E.y),
  };
  const existingG = pointNearCoordinates(
    state.objects.filter((object): object is Point => object.type === "point"),
    gCoordinates.x,
    gCoordinates.y,
    5,
  );
  const G = existingG ?? createPoint(pointLabel(state, state.objects), gCoordinates.x, gCoordinates.y, "theorem-action", { color: "gold", source: "I.31" });
  const objectsWithG = existingG ? state.objects : [...state.objects, G];
  const newObjects = [
    ...(existingG ? [] : [G]),
    ...addSegmentIfMissing(objectsWithG, "A", G.id, "gold", "I.31"),
    ...addSegmentIfMissing(objectsWithG, "C", G.id, "gold", "I.31"),
    ...addSegmentIfMissing(objectsWithG, F.id, G.id, "gold", "I.31"),
  ];

  return {
    objects: newObjects,
    animatedObjectId: newObjects[newObjects.length - 1]?.id ?? G.id,
  };
}

function infiniteLineIntersection(start: Point, direction: { x: number; y: number }, lineA: Point, lineB: Point) {
  const lineDirection = { x: lineB.x - lineA.x, y: lineB.y - lineA.y };
  const determinant = direction.x * lineDirection.y - direction.y * lineDirection.x;
  if (Math.abs(determinant) < 0.0001) {
    return undefined;
  }

  const offset = { x: lineA.x - start.x, y: lineA.y - start.y };
  const t = (offset.x * lineDirection.y - offset.y * lineDirection.x) / determinant;
  return {
    x: start.x + direction.x * t,
    y: start.y + direction.y * t,
  };
}

function constructParallelEndpointOnTopLine(state: GeometryStore, pointId: string, segment: Segment, topLine: [string, string]) {
  const throughPoint = getPoint(state.objects, pointId);
  const segmentEnds = segmentPoints(state.objects, segment);
  const topStart = getPoint(state.objects, topLine[0]);
  const topEnd = getPoint(state.objects, topLine[1]);
  if (!throughPoint || !segmentEnds || !topStart || !topEnd) {
    return undefined;
  }

  const direction = { x: segmentEnds.p2.x - segmentEnds.p1.x, y: segmentEnds.p2.y - segmentEnds.p1.y };
  const endpointCoordinates = infiniteLineIntersection(throughPoint, direction, topStart, topEnd);
  if (!endpointCoordinates) {
    return undefined;
  }

  const endpoint = pointAtForAction(state, state.objects, endpointCoordinates.x, endpointCoordinates.y, "I.31", "gold");
  const objectsWithEndpoint = [...state.objects, ...endpoint.objects];
  const line = addSegmentIfMissing(objectsWithEndpoint, pointId, endpoint.point.id, "gold", "I.31");
  return {
    objects: [...endpoint.objects, ...line],
    animatedObjectId: line[0]?.id ?? endpoint.point.id,
  };
}

function constructAreaParallelThroughPoint(state: GeometryStore, pointId: string, segment: Segment) {
  const selectedSide: [string, string] = [segment.p1, segment.p2];
  if (state.currentPropositionId === "I.37") {
    if ((pointId === "B" && sideMatches(selectedSide, ["A", "C"])) || (pointId === "C" && sideMatches(selectedSide, ["D", "B"]))) {
      return constructParallelEndpointOnTopLine(state, pointId, segment, ["A", "D"]);
    }
  }

  if (state.currentPropositionId === "I.38") {
    if ((pointId === "B" && sideMatches(selectedSide, ["A", "C"])) || (pointId === "F" && sideMatches(selectedSide, ["D", "E"]))) {
      return constructParallelEndpointOnTopLine(state, pointId, segment, ["A", "D"]);
    }
  }

  return undefined;
}

function constructParallelThroughPoint(state: GeometryStore, pointId: string, segment: Segment) {
  const areaParallel = constructAreaParallelThroughPoint(state, pointId, segment);
  if (areaParallel) {
    return areaParallel;
  }

  const prop42Parallel = constructProp42ParallelThroughPoint(state, pointId, segment);
  if (prop42Parallel) {
    return prop42Parallel;
  }

  const throughPoint = getPoint(state.objects, pointId);
  const points = segmentPoints(state.objects, segment);
  if (!throughPoint || !points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) {
    return undefined;
  }

  const endpoint = pointAtForAction(
    state,
    state.objects,
    throughPoint.x + (dx / length) * Math.min(260, Math.max(150, length * 0.65)),
    throughPoint.y + (dy / length) * Math.min(260, Math.max(150, length * 0.65)),
    "I.31",
    "gold",
  );
  const objectsWithEndpoint = [...state.objects, ...endpoint.objects];
  const line = addSegmentIfMissing(objectsWithEndpoint, throughPoint.id, endpoint.point.id, "gold", "I.31");

  return {
    objects: [...endpoint.objects, ...line],
    animatedObjectId: line[0]?.id ?? endpoint.point.id,
  };
}

function constructPreviewTriangleOnSegment(state: GeometryStore, segment: Segment) {
  const points = segmentPoints(state.objects, segment);
  if (!points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) {
    return undefined;
  }

  const apex = pointAtForAction(
    state,
    state.objects,
    (points.p1.x + points.p2.x) / 2 - (dy / length) * length * 0.72,
    (points.p1.y + points.p2.y) / 2 + (dx / length) * length * 0.72,
    "I.22",
    "gold",
  );
  const objectsWithApex = [...state.objects, ...apex.objects];
  const sides = [
    ...addSegmentIfMissing(objectsWithApex, points.p1.id, apex.point.id, "gold", "I.22"),
    ...addSegmentIfMissing(objectsWithApex, points.p2.id, apex.point.id, "gold", "I.22"),
  ];

  return {
    objects: [...apex.objects, ...sides],
    animatedObjectId: sides[sides.length - 1]?.id ?? apex.point.id,
  };
}

function constructProp24CopiedAnglePreview(state: GeometryStore, vertex: Point) {
  if (state.currentPropositionId !== "I.24" || vertex.id !== "D") {
    return undefined;
  }

  const A = getPoint(state.objects, "A");
  const B = getPoint(state.objects, "B");
  const C = getPoint(state.objects, "C");
  const E = getPoint(state.objects, "E");
  const F = getPoint(state.objects, "F");
  if (!A || !B || !C || !E || !F) {
    return undefined;
  }

  const baseDirection = unitVector(vertex, E);
  if (!baseDirection) {
    return undefined;
  }

  const sourceAngle = angleAt(A, B, C);
  const baseToF = signedAngleBetween({ x: E.x - vertex.x, y: E.y - vertex.y }, { x: F.x - vertex.x, y: F.y - vertex.y });
  const direction = rotateVector(baseDirection, (baseToF >= 0 ? 1 : -1) * sourceAngle);
  const rayPoint = createAuxiliaryRayPoint(vertex.x + direction.x * 190, vertex.y + direction.y * 190, "I.23");
  const ray = createSegment(vertex.id, rayPoint.id, "gold", "I.23");
  ray.ray = true;

  return {
    objects: [rayPoint, ray],
    animatedObjectId: ray.id,
  };
}

function constructProp31CopiedAnglePreview(state: GeometryStore, vertex: Point) {
  if (state.currentPropositionId !== "I.31" || vertex.id !== "A") {
    return undefined;
  }

  const B = getPoint(state.objects, "B");
  const C = getPoint(state.objects, "C");
  if (!B || !C) {
    return undefined;
  }

  const D = state.objects.find(
    (object): object is Point =>
      object.type === "point" &&
      !["A", "B", "C"].includes(object.id) &&
      isPointOnRay(B, C, object, 0.04) &&
      Boolean(segmentExistsBetween(state.objects, vertex.id, object.id)),
  );
  if (!D) {
    return undefined;
  }

  const baseDirection = unitVector(vertex, D);
  if (!baseDirection) {
    return undefined;
  }

  const sourceTurn = signedAngleBetween({ x: vertex.x - D.x, y: vertex.y - D.y }, { x: C.x - D.x, y: C.y - D.y });
  const direction = rotateVector(baseDirection, sourceTurn);
  const endpoint = pointAtForAction(state, state.objects, vertex.x + direction.x * 190, vertex.y + direction.y * 190, "I.23", "gold");
  const objectsWithEndpoint = [...state.objects, ...endpoint.objects];
  const sides = addSegmentIfMissing(objectsWithEndpoint, vertex.id, endpoint.point.id, "gold", "I.23");

  return {
    objects: [...endpoint.objects, ...sides],
    animatedObjectId: sides[0]?.id ?? endpoint.point.id,
  };
}

function constructProp42CopiedAnglePreview(state: GeometryStore, vertex: Point) {
  if (state.currentPropositionId !== "I.42") {
    return undefined;
  }

  const C = getPoint(state.objects, "C");
  const D = getPoint(state.objects, "D");
  const H = getPoint(state.objects, "H");
  const K = getPoint(state.objects, "K");
  const A = getPoint(state.objects, "A");
  if (
    !A ||
    !C ||
    !D ||
    !H ||
    !K ||
    ["A", "B", "C", "D", "H", "K"].includes(vertex.id) ||
    !sideSupportSegment(state.objects, vertex, C)
  ) {
    return undefined;
  }

  const baseDirection = unitVector(vertex, C);
  if (!baseDirection) {
    return undefined;
  }

  const sourceTurn = signedAngleBetween({ x: H.x - D.x, y: H.y - D.y }, { x: K.x - D.x, y: K.y - D.y });
  const direction = rotateVector(baseDirection, sourceTurn);
  const verticalScale = Math.abs(direction.y) > 0.05 ? Math.abs((A.y - vertex.y) / direction.y) : 190;
  const length = Math.max(120, Math.min(260, verticalScale));
  const endpoint = pointAtForAction(state, state.objects, vertex.x + direction.x * length, vertex.y + direction.y * length, "I.23", "gold");
  const objectsWithEndpoint = [...state.objects, ...endpoint.objects];
  const side = addSegmentIfMissing(objectsWithEndpoint, vertex.id, endpoint.point.id, "gold", "I.23");

  return {
    objects: [...endpoint.objects, ...side],
    animatedObjectId: side[0]?.id ?? endpoint.point.id,
  };
}

function constructCopiedAnglePreview(state: GeometryStore, vertex: Point) {
  const guidedCopy =
    constructProp24CopiedAnglePreview(state, vertex) ??
    constructProp31CopiedAnglePreview(state, vertex) ??
    constructProp42CopiedAnglePreview(state, vertex);
  if (guidedCopy) {
    return guidedCopy;
  }

  const side1 = pointAtForAction(state, state.objects, vertex.x + 140, vertex.y, "I.23", "gold");
  const objectsWithSide1 = [...state.objects, ...side1.objects];
  const side2 = pointAtForAction(state, objectsWithSide1, vertex.x + 70, vertex.y - 120, "I.23", "gold");
  const objectsWithPoints = [...objectsWithSide1, ...side2.objects];
  const sides = [
    ...addSegmentIfMissing(objectsWithPoints, vertex.id, side1.point.id, "gold", "I.23"),
    ...addSegmentIfMissing(objectsWithPoints, vertex.id, side2.point.id, "gold", "I.23"),
  ];

  return {
    objects: [...side1.objects, ...side2.objects, ...sides],
    animatedObjectId: sides[sides.length - 1]?.id ?? side2.point.id,
  };
}

function constructParallelogramPreview(state: GeometryStore, segment: Segment, source: string) {
  const points = segmentPoints(state.objects, segment);
  if (!points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) {
    return undefined;
  }

  const offset = { x: -dy / length * 105 + dx / length * 55, y: dx / length * 105 + dy / length * 55 };
  const top1 = pointAtForAction(state, state.objects, points.p1.x + offset.x, points.p1.y + offset.y, source, "gold");
  const objectsWithTop1 = [...state.objects, ...top1.objects];
  const top2 = pointAtForAction(state, objectsWithTop1, points.p2.x + offset.x, points.p2.y + offset.y, source, "gold");
  const objectsWithPoints = [...objectsWithTop1, ...top2.objects];
  const sides = [
    ...addSegmentIfMissing(objectsWithPoints, points.p1.id, top1.point.id, "gold", source),
    ...addSegmentIfMissing(objectsWithPoints, top1.point.id, top2.point.id, "gold", source),
    ...addSegmentIfMissing(objectsWithPoints, top2.point.id, points.p2.id, "gold", source),
  ];

  return {
    objects: [...top1.objects, ...top2.objects, ...sides],
    animatedObjectId: sides[sides.length - 1]?.id ?? top2.point.id,
  };
}

function constructSquareOnSegmentPreview(state: GeometryStore, segment: Segment) {
  const points = segmentPoints(state.objects, segment);
  if (!points) {
    return undefined;
  }

  const dx = points.p2.x - points.p1.x;
  const dy = points.p2.y - points.p1.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) {
    return undefined;
  }

  const offset = { x: -dy, y: dx };
  const p3 = pointAtForAction(state, state.objects, points.p2.x + offset.x, points.p2.y + offset.y, "I.46", "gold");
  const objectsWithP3 = [...state.objects, ...p3.objects];
  const p4 = pointAtForAction(state, objectsWithP3, points.p1.x + offset.x, points.p1.y + offset.y, "I.46", "gold");
  const objectsWithPoints = [...objectsWithP3, ...p4.objects];
  const sides = [
    ...addSegmentIfMissing(objectsWithPoints, points.p2.id, p3.point.id, "gold", "I.46"),
    ...addSegmentIfMissing(objectsWithPoints, p3.point.id, p4.point.id, "gold", "I.46"),
    ...addSegmentIfMissing(objectsWithPoints, p4.point.id, points.p1.id, "gold", "I.46"),
  ];

  return {
    objects: [...p3.objects, ...p4.objects, ...sides],
    animatedObjectId: sides[sides.length - 1]?.id ?? p4.point.id,
  };
}

function constructBetweenPoints(
  state: GeometryStore,
  firstPointId: string,
  secondPointId: string,
  tool: GeometryTool,
  objects: GeometryObject[] = state.objects,
) {
  const clickedPoint = getPoint(objects, secondPointId);
  if (!clickedPoint || firstPointId === clickedPoint.id) {
    return {
      newObjects: [],
      selectedPointIds: [],
      validation: null,
    };
  }

  if (tool === "straightedge") {
    const existingSegment = segmentExistsBetween(objects, firstPointId, clickedPoint.id);
    const existingDrawnLine = objects.find(
      (object): object is Segment =>
        object.type === "segment" &&
        !object.given &&
        ((object.p1 === firstPointId && object.p2 === clickedPoint.id) ||
          (object.p1 === clickedPoint.id && object.p2 === firstPointId)),
    );
    if (existingDrawnLine) {
      return {
        newObjects: [],
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That straight line is already drawn. Choose another pair of points.",
        },
      };
    }

    const segment = createSegment(firstPointId, clickedPoint.id, "ink");
    if (existingSegment?.given) {
      segment.label = undefined;
    }
    return {
      newObjects: [segment],
      selectedPointIds: [],
    };
  }

  if (tool === "extend") {
    const baseSegment = segmentExistsBetween(objects, firstPointId, clickedPoint.id);
    if (!baseSegment) {
      return {
        newObjects: [],
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Extend needs an existing finite segment. Choose an endpoint, then the point it should pass through.",
        },
      };
    }

    if (extendedLineExists(objects, firstPointId, clickedPoint.id)) {
      return {
        newObjects: [],
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That line has already been produced in this direction.",
        },
      };
    }

    const line = createExtendedLine(firstPointId, clickedPoint.id, baseSegment.id, "ink");
    return {
      newObjects: [line],
      selectedPointIds: [],
    };
  }

  if (circleExists(objects, firstPointId, clickedPoint.id)) {
    return {
      newObjects: [],
      selectedPointIds: [],
      validation: {
        success: false,
        message: "That circle is already on the page. Choose a new center or radius point.",
      },
    };
  }

  const isFirstEuclidCircle = state.currentPropositionId === "I.1" && firstPointId === "A" && clickedPoint.id === "B";
  const isSecondEuclidCircle = state.currentPropositionId === "I.1" && firstPointId === "B" && clickedPoint.id === "A";
  const circle = createCircle(firstPointId, clickedPoint.id, isFirstEuclidCircle ? "red" : isSecondEuclidCircle ? "blue" : "gold");
  const radiusSegment = segmentExistsBetween(objects, firstPointId, clickedPoint.id);
  if (radiusSegment) {
    circle.dependencies = [...new Set([...(circle.dependencies ?? []), radiusSegment.id])];
  }
  return {
    newObjects: [circle],
    selectedPointIds: [],
  };
}

function handlePointToolClick(state: GeometryStore, clickedPoint: Point, tool: GeometryTool) {
  if (state.selectedPointIds.length === 0) {
    return {
      selectedPointIds: [clickedPoint.id],
      compassTransferSource: null,
      validation: null,
    };
  }

  const result = constructBetweenPoints(state, state.selectedPointIds[0], clickedPoint.id, tool);
  if (result.newObjects.length === 0) {
    return result;
  }

  return {
    ...addObjectsAndSelect(state, result.newObjects, result.selectedPointIds),
    validation: result.validation ?? null,
    compassTransferSource: null,
  };
}

export const useGeometryStore = create<GeometryStore>((set, get) => ({
  phase: "title",
  backgroundColor: "#efe3cf",
  currentPropositionId: FIRST_PROPOSITION_ID,
  unlockedPropositionIds: initialProgress.unlockedPropositionIds,
  completedPropositionIds: initialProgress.completedPropositionIds,
  selectedTool: defaultToolFor(FIRST_PROPOSITION_ID),
  selectedPointIds: [],
  theoremSelectionIds: [],
  congruenceSelection: null,
  compassTransferSource: null,
  animatedObjectId: null,
  objects: cloneInitialObjects(FIRST_PROPOSITION_ID),
  history: [],
  validation: null,
  proofContext: null,
  currentReplayStep: 0,
  completedActionIds: [],
  reasoningRelations: [],
  startApp: () =>
    set(() => {
      const progress = readProgress();
      return {
        phase: "map",
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
        validation: null,
        animatedObjectId: null,
        unlockedPropositionIds: progress.unlockedPropositionIds,
        completedPropositionIds: progress.completedPropositionIds,
        completedActionIds: [],
        reasoningRelations: [],
      };
    }),
  startTutorial: () =>
    set({
      phase: "laws",
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      validation: null,
      animatedObjectId: null,
      completedActionIds: [],
      reasoningRelations: [],
    }),
  returnToTitle: () =>
    set(() => {
      const progress = readProgress();
      return {
        phase: "title",
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
        validation: null,
        animatedObjectId: null,
        unlockedPropositionIds: progress.unlockedPropositionIds,
        completedPropositionIds: progress.completedPropositionIds,
        completedActionIds: [],
        reasoningRelations: [],
      };
    }),
  enterProposition: () =>
    set((state) => ({
      phase: "intro",
      selectedTool: defaultToolFor(state.currentPropositionId),
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      objects: cloneInitialObjects(state.currentPropositionId),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
      completedActionIds: [],
      reasoningRelations: [],
    })),
  openProposition: (id) => {
    set({
      phase: "intro",
      currentPropositionId: id,
      selectedTool: defaultToolFor(id),
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      objects: cloneInitialObjects(id),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
      completedActionIds: [],
      reasoningRelations: [],
    });
  },
  startConstruction: () =>
    set({
      phase: "construction",
      selectedTool: defaultToolFor(get().currentPropositionId),
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
      completedActionIds: [],
      reasoningRelations: [],
    }),
  setBackgroundColor: (color) =>
    set({
      backgroundColor: color,
    }),
  setTool: (tool) =>
    set({
      selectedTool: tool,
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: startingCongruenceSelection(tool),
      compassTransferSource: null,
      validation: null,
    }),
  applySASByTriangles: (triangle1, triangle2) => {
    const state = get();
    if (state.phase !== "construction") {
      const validation = { success: false, message: "SAS can only be applied during construction." };
      set({ validation });
      return validation;
    }

    const result = validateSASByTriangleNames(state, triangle1, triangle2);
    if (!result.success) {
      const validation = { success: false, message: result.message };
      set({ validation });
      return validation;
    }

    const nextCompletedActionIds = addCompletedActions(state, result.actionIds);
    const nextRelations = state.reasoningRelations.some((relation) => relation.id === result.relation.id)
      ? state.reasoningRelations
      : [...state.reasoningRelations, result.relation];
    const validation = { success: true, message: result.message };
    const completion = validateProposition(state.currentPropositionId, state.objects, nextCompletedActionIds, nextRelations);
    if (completion.success) {
      set({
        phase: "constructionComplete",
        theoremSelectionIds: [],
        congruenceSelection: null,
        selectedPointIds: [],
        compassTransferSource: null,
        completedActionIds: nextCompletedActionIds,
        reasoningRelations: nextRelations,
        validation: completion,
        proofContext: completion.context ?? null,
        currentReplayStep: 0,
        animatedObjectId: null,
      });
      return completion;
    }

    set({
      theoremSelectionIds: [],
      congruenceSelection: null,
      selectedPointIds: [],
      compassTransferSource: null,
      completedActionIds: nextCompletedActionIds,
      reasoningRelations: nextRelations,
      validation,
    });
    return validation;
  },
  applySSSByTriangles: (triangle1, triangle2) => {
    const state = get();
    if (state.phase !== "construction") {
      const validation = { success: false, message: "SSS can only be applied during construction." };
      set({ validation });
      return validation;
    }

    const result = validateSSSByTriangleNames(state, triangle1, triangle2);
    if (!result.success) {
      const validation = { success: false, message: result.message };
      set({ validation });
      return validation;
    }

    const nextCompletedActionIds = addCompletedActions(state, result.actionIds);
    const nextRelations = state.reasoningRelations.some((relation) => relation.id === result.relation.id)
      ? state.reasoningRelations
      : [...state.reasoningRelations, result.relation];
    const validation = { success: true, message: result.message };
    const completion = validateProposition(state.currentPropositionId, state.objects, nextCompletedActionIds, nextRelations);
    if (completion.success) {
      set({
        phase: "constructionComplete",
        theoremSelectionIds: [],
        congruenceSelection: null,
        selectedPointIds: [],
        compassTransferSource: null,
        completedActionIds: nextCompletedActionIds,
        reasoningRelations: nextRelations,
        validation: completion,
        proofContext: completion.context ?? null,
        currentReplayStep: 0,
        animatedObjectId: null,
      });
      return completion;
    }

    set({
      theoremSelectionIds: [],
      congruenceSelection: null,
      selectedPointIds: [],
      compassTransferSource: null,
      completedActionIds: nextCompletedActionIds,
      reasoningRelations: nextRelations,
      validation,
    });
    return validation;
  },
  resetCongruenceSelection: () =>
    set((state) => ({
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: startingCongruenceSelection(state.selectedTool),
      compassTransferSource: null,
      validation: null,
    })),
  markChallengeAction: (actionId) =>
    set((state) => ({
      completedActionIds: state.completedActionIds.includes(actionId)
        ? state.completedActionIds
        : [...state.completedActionIds, actionId],
      validation: null,
    })),
  transformPoints: (positions) =>
    set((state) => {
      if (state.phase !== "construction" || !positionsChanged(state.objects, positions)) {
        return state;
      }

      const snappedPositions = snapSASArrangementTargets(state, positions);
      const animatedObjectId = Object.keys(snappedPositions)[0] ?? null;

      return {
        phase: "construction",
        objects: state.objects.map((object) =>
          object.type === "point" && snappedPositions[object.id]
            ? {
                ...object,
                x: snappedPositions[object.id].x,
                y: snappedPositions[object.id].y,
              }
            : object,
        ),
        history: [...state.history, state.objects],
        validation: null,
        proofContext: null,
        currentReplayStep: 0,
        animatedObjectId,
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
      };
    }),
  handleCanvasClick: (x, y) => {
    const state = get();
    if (state.phase !== "construction") {
      return;
    }

    if (state.selectedTool === "theorem-sas" || state.selectedTool === "theorem-sss") {
      const result = handleCongruenceToolClick(state, x, y);
      if (result) {
        set(result);
      }
      return;
    }

    if (state.selectedTool === "intersection") {
      const intersection = findNearbyIntersection(state.objects, x, y, INTERSECTION_TOLERANCE);
      if (!intersection) {
        set({
          validation: {
            success: false,
            message: "No valid crossing is close enough. Click where a circle meets another circle or straight-line.",
          },
        });
        return;
      }

      const existing = pointNearCoordinates(
        state.objects.filter((object): object is Point => object.type === "point"),
        intersection.x,
        intersection.y,
        2,
      );

      if (existing) {
        if (existing.auxiliary) {
          const label = nextPointLabel(state.objects, getProposition(state.currentPropositionId).pointLabelSequence);
          const point: Point = {
            ...existing,
            x: intersection.x,
            y: intersection.y,
            label,
            color: "gold",
            auxiliary: false,
            source: "intersection",
            createdBy: "intersection",
            parentObjectIds: intersection.objects.map((object) => object.id),
            dependencies: intersection.objects.map((object) => object.id),
          };

          set({
            phase: "construction",
            objects: state.objects.map((object) => (object.id === existing.id ? point : object)),
            history: [...state.history, state.objects],
            validation: null,
            proofContext: null,
            currentReplayStep: 0,
            animatedObjectId: point.id,
            selectedPointIds: [],
          });
          return;
        }

        set({
          validation: {
            success: false,
            message: `${existing.label ?? "That point"} is already marked. Use the straightedge to connect it to A and B.`,
          },
        });
        return;
      }

      const label = nextPointLabel(state.objects, getProposition(state.currentPropositionId).pointLabelSequence);
      const point = createPoint(label, intersection.x, intersection.y, "intersection", {
        color: "gold",
        parentObjectIds: intersection.objects.map((object) => object.id),
      });

      set({
        ...addObjectWithHistory(state, point),
        selectedPointIds: [],
      });
      return;
    }

    if (state.selectedTool === "point") {
      const resolved = resolvePointAt(state, x, y);
      if (resolved.newPoint) {
        set(addObjectsAndSelect(state, [resolved.newPoint], [resolved.point.id], resolved.point.id));
        return;
      }

      set({
        selectedPointIds: [resolved.point.id],
        compassTransferSource: null,
        validation: null,
      });
      return;
    }

    if (state.selectedTool === "theorem-equilateral") {
      const segment = findNearbySegment(state.objects, x, y, 24);
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose an existing segment. Proposition I.1 builds an equilateral triangle on that segment.",
          },
        });
        return;
      }

      const result = buildEquilateralTriangleOnSegment(state, segment);
      if (!result || result.objects.length === 0) {
        set({
          validation: {
            success: false,
            message: "That equilateral action could not be placed here.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "theorem-bisect-segment") {
      const segment = findNearbySegment(state.objects, x, y, 24);
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose an existing segment to bisect.",
          },
        });
        return;
      }

      const chordResult = bisectProp12ChordWithMidpoint(state, segment);
      if (chordResult && "validation" in chordResult) {
        set({
          validation: chordResult.validation,
        });
        return;
      }

      const result = chordResult ?? bisectSegmentWithMidpoint(state, segment);
      if (!result || result.objects.length === 0) {
        set({
          validation: {
            success: false,
            message: "That segment already has a marked midpoint nearby.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "theorem-bisect-angle") {
      const resolved = resolvePointAt(state, x, y);
      if (state.selectedPointIds.length < 2) {
        if (resolved.newPoint) {
          set(addObjectsAndSelect(state, [resolved.newPoint], [...state.selectedPointIds, resolved.point.id], resolved.point.id));
          return;
        }

        set({
          selectedPointIds: [...state.selectedPointIds, resolved.point.id],
          compassTransferSource: null,
          validation: null,
        });
        return;
      }

      const baseObjects = resolved.newPoint ? [...state.objects, resolved.newPoint] : state.objects;
      const actionState = { ...state, objects: baseObjects };
      const result = bisectAngleFromPoints(
        actionState,
        state.selectedPointIds[0],
        state.selectedPointIds[1],
        resolved.point.id,
      );
      if (!result || result.objects.length === 0) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "Choose a vertex, a point on one side, and a point on the other side of the angle.",
          },
        });
        return;
      }

      set(
        addObjectsAndSelect(
          state,
          [...(resolved.newPoint ? [resolved.newPoint] : []), ...result.objects],
          [],
          result.animatedObjectId,
        ),
      );
      return;
    }

    if (state.selectedTool === "theorem-perpendicular-on-line") {
      const segment = findNearbySegment(state.objects, x, y, 28);
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose a point on an existing straight-line to raise the perpendicular.",
          },
        });
        return;
      }

      const result = constructPerpendicularOnSegment(state, segment, x, y);
      if (!result || result.objects.length === 0) {
        set({
          validation: {
            success: false,
            message: "The perpendicular action could not be placed on that line.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "theorem-drop-perpendicular") {
      if (state.selectedPointIds.length === 0) {
        const resolved = resolvePointAt(state, x, y);
        if (resolved.newPoint) {
          set(addObjectsAndSelect(state, [resolved.newPoint], [resolved.point.id], resolved.point.id));
          return;
        }

        set({
          selectedPointIds: [resolved.point.id],
          compassTransferSource: null,
          validation: null,
        });
        return;
      }

      const resolvedLinePoint = resolvePointAt(state, x, y);
      const objectsWithLinePoint = resolvedLinePoint.newPoint ? [...state.objects, resolvedLinePoint.newPoint] : state.objects;
      const segment = findSegmentForPointOnLine(objectsWithLinePoint, resolvedLinePoint.point);
      const externalPointId = state.selectedPointIds[0];
      if (!segment || externalPointId === resolvedLinePoint.point.id) {
        set({
          validation: {
            success: false,
            message: "Choose a point on the line that should receive the dropped perpendicular.",
          },
        });
        return;
      }

      const actionState = { ...state, objects: objectsWithLinePoint };
      const prop13Result = constructProp13PerpendicularOnLine(actionState, externalPointId, segment);
      if (prop13Result) {
        if ("validation" in prop13Result) {
          set({
            selectedPointIds: [],
            validation: prop13Result.validation,
          });
          return;
        }

        const newObjects = [...(resolvedLinePoint.newPoint ? [resolvedLinePoint.newPoint] : []), ...prop13Result.objects];
        const nextObjects = [...state.objects, ...newObjects];
        const nextCompletedActionIds = addCompletedActions(state, [prop13Result.completedActionId]);
        const completion = validateProposition(
          state.currentPropositionId,
          nextObjects,
          nextCompletedActionIds,
          state.reasoningRelations,
        );

        if (completion.success) {
          set({
            phase: "constructionComplete",
            objects: nextObjects,
            history: [...state.history, state.objects],
            theoremSelectionIds: [],
            congruenceSelection: null,
            selectedPointIds: [],
            compassTransferSource: null,
            completedActionIds: nextCompletedActionIds,
            validation: completion,
            proofContext: completion.context ?? null,
            currentReplayStep: 0,
            animatedObjectId: prop13Result.animatedObjectId,
          });
          return;
        }

        set({
          ...addObjectsAndSelect(state, newObjects, [], prop13Result.animatedObjectId),
          completedActionIds: nextCompletedActionIds,
          validation: {
            success: false,
            message: "EB has been raised. The construction still needs AB standing on CD.",
          },
        });
        return;
      }

      const selectedPoint = getPoint(actionState.objects, externalPointId);
      const segmentEndpoints = segmentPoints(actionState.objects, segment);
      if (
        selectedPoint &&
        segmentEndpoints &&
        distanceToInfiniteLine(segmentEndpoints.p1, segmentEndpoints.p2, selectedPoint) <= 10
      ) {
        const result = constructPerpendicularOnSegment(actionState, segment, selectedPoint.x, selectedPoint.y);
        if (!result || result.objects.length === 0) {
          set({
            selectedPointIds: [],
            validation: {
              success: false,
              message: "That perpendicular could not be raised from the selected point.",
            },
          });
          return;
        }

        set(
          addObjectsAndSelect(
            state,
            [...(resolvedLinePoint.newPoint ? [resolvedLinePoint.newPoint] : []), ...result.objects],
            [],
            result.animatedObjectId,
          ),
        );
        return;
      }

      const result = dropPerpendicularToSegment(actionState, externalPointId, segment);
      if (!result || result.objects.length === 0) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "That dropped perpendicular could not be placed.",
          },
        });
        return;
      }

      set(
        addObjectsAndSelect(
          state,
          [...(resolvedLinePoint.newPoint ? [resolvedLinePoint.newPoint] : []), ...result.objects],
          [],
          result.animatedObjectId,
        ),
      );
      return;
    }

    if (state.selectedTool === "theorem-parallel") {
      if (state.selectedPointIds.length === 0) {
        const resolved = resolvePointAt(state, x, y);
        if (resolved.newPoint) {
          set(addObjectsAndSelect(state, [resolved.newPoint], [resolved.point.id], resolved.point.id));
          return;
        }

        set({
          selectedPointIds: [resolved.point.id],
          compassTransferSource: null,
          validation: null,
        });
        return;
      }

      const segment = findNearbySegment(state.objects, x, y, 28);
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose the line to copy in parallel through the selected point.",
          },
        });
        return;
      }

      const result = constructParallelThroughPoint(state, state.selectedPointIds[0], segment);
      if (!result || result.objects.length === 0) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "That parallel could not be placed.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "theorem-copy-angle") {
      const resolved = resolvePointAt(state, x, y);
      const actionState = resolved.newPoint ? { ...state, objects: [...state.objects, resolved.newPoint] } : state;
      const result = constructCopiedAnglePreview(actionState, resolved.point);
      if (!result || result.objects.length === 0) {
        set({
          validation: {
            success: false,
            message: "Choose a target point for the copied angle.",
          },
        });
        return;
      }

      set(
        addObjectsAndSelect(
          state,
          [...(resolved.newPoint ? [resolved.newPoint] : []), ...result.objects],
          [],
          result.animatedObjectId,
        ),
      );
      return;
    }

    if (
      state.selectedTool === "theorem-triangle-sss" ||
      state.selectedTool === "theorem-parallelogram-triangle" ||
      state.selectedTool === "theorem-parallelogram-line" ||
      state.selectedTool === "theorem-parallelogram-figure" ||
      state.selectedTool === "theorem-square"
    ) {
      const segment = findNearbySegment(state.objects, x, y, 28);
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose an existing segment as the base for this earned construction action.",
          },
        });
        return;
      }

      const result =
        state.selectedTool === "theorem-triangle-sss"
          ? constructPreviewTriangleOnSegment(state, segment)
          : state.selectedTool === "theorem-square"
            ? constructSquareOnSegmentPreview(state, segment)
            : constructParallelogramPreview(
                state,
                segment,
                state.selectedTool === "theorem-parallelogram-triangle"
                  ? "I.42"
                  : state.selectedTool === "theorem-parallelogram-line"
                    ? "I.44"
                    : "I.45",
              );
      if (!result || result.objects.length === 0) {
        set({
          validation: {
            success: false,
            message: "That earned construction could not be placed on this segment.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "compass-transfer") {
      if (state.compassTransferSource) {
        if (state.selectedPointIds.length === 0) {
          const targetStart = findNearbyPoint(state.objects, x, y);
          if (!targetStart) {
            set({
              validation: {
                success: false,
                message: "Choose the point where the copied length should start.",
              },
            });
            return;
          }

          set({
            selectedPointIds: [targetStart.id],
            theoremSelectionIds: [],
            validation: {
              success: false,
              message: "Start point selected. Now click the target line or ray.",
            },
          });
          return;
        }

        const result = constructCopiedLengthOnTarget(state, state.compassTransferSource, state.selectedPointIds[0], x, y);
        if (!result || "validation" in result) {
          set({
            selectedPointIds: [],
            compassTransferSource: null,
            theoremSelectionIds: [],
            validation: result?.validation ?? {
              success: false,
              message: "That copied length could not be placed on the selected target.",
            },
          });
          return;
        }

        const nextCompletedActionIds = addCompletedActions(state, result.actionIds);
        set({
          ...addObjectsAndSelect(state, result.objects, [], result.animatedObjectId),
          theoremSelectionIds: [],
          completedActionIds: nextCompletedActionIds,
          validation: {
            success: false,
            message:
              state.currentPropositionId === "I.6"
                ? "DB has been copied from AC onto AB. Join D to C."
                : "Length copied. Continue the Euclidean construction.",
          },
        });
        return;
      }

      if (state.selectedPointIds.length === 0) {
        const sourcePoint = findNearbyPoint(state.objects, x, y);
        if (sourcePoint) {
          set({
            selectedPointIds: [sourcePoint.id],
            compassTransferSource: null,
            validation: null,
          });
          return;
        }

        const sourceSegment = findNearbySegment(state.objects, x, y, 20);
        if (sourceSegment) {
          set({
            selectedPointIds: [],
            compassTransferSource: {
              p1: sourceSegment.p1,
              p2: sourceSegment.p2,
              segmentId: sourceSegment.id,
            },
            theoremSelectionIds: [],
            validation: {
              success: false,
              message: "Source length selected. Now choose the target start point.",
            },
          });
          return;
        }

        const resolved = resolvePointAt(state, x, y);
        if (resolved.newPoint) {
          set(addObjectsAndSelect(state, [resolved.newPoint], [resolved.point.id], resolved.point.id));
          return;
        }

        set({
          selectedPointIds: [resolved.point.id],
          validation: null,
        });
        return;
      }

      const firstPointId = state.selectedPointIds[0];
      const resolvedSecond = resolvePointAt(state, x, y);
      const newObjects = resolvedSecond.newPoint ? [resolvedSecond.newPoint] : [];
      if (firstPointId === resolvedSecond.point.id) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "Choose two distinct points for the source length.",
          },
        });
        return;
      }

      set({
        ...addObjectsAndSelect(state, newObjects, [], resolvedSecond.newPoint?.id),
        compassTransferSource: {
          p1: firstPointId,
          p2: resolvedSecond.point.id,
        },
        validation: {
          success: false,
          message: "Source length selected. Now choose the target start point.",
        },
      });
      return;
    }

    const resolvedPoint = resolvePointAt(state, x, y);
    if (state.selectedPointIds.length === 0) {
      if (resolvedPoint.newPoint) {
        set(addObjectsAndSelect(state, [resolvedPoint.newPoint], [resolvedPoint.point.id], resolvedPoint.point.id));
        return;
      }

      set(handlePointToolClick(state, resolvedPoint.point, state.selectedTool));
      return;
    }

    const baseObjects = resolvedPoint.newPoint ? [...state.objects, resolvedPoint.newPoint] : state.objects;
    const result = constructBetweenPoints(
      state,
      state.selectedPointIds[0],
      resolvedPoint.point.id,
      state.selectedTool,
      baseObjects,
    );

    if (result.newObjects.length === 0) {
      set({
        selectedPointIds: result.selectedPointIds,
        validation: result.validation ?? null,
      });
      return;
    }

    set(
      addObjectsAndMaybeCompleteProp14(
        state,
        [...(resolvedPoint.newPoint ? [resolvedPoint.newPoint] : []), ...result.newObjects],
        result.selectedPointIds,
        result.newObjects[result.newObjects.length - 1]?.id ?? resolvedPoint.newPoint?.id,
      ),
    );
  },
  handleCanvasDrag: (startPointId, startX, startY, endX, endY, guidePointId) => {
    const state = get();
    if (state.phase !== "construction") {
      return;
    }

    if (state.selectedTool === "theorem-equilateral") {
      const base = equilateralBaseFromEndpointDrag(state, startPointId, startX, startY, endX, endY, guidePointId);
      if (!base) {
        set({
          selectedPointIds: [],
          theoremSelectionIds: [],
          validation: {
            success: false,
            message: "Drag from one endpoint of the intended base to the other, then pull to choose the triangle side.",
          },
        });
        return;
      }

      const result = buildEquilateralTriangleOnBase(state, base.start, base.end, base.support.id, base.sideSign);
      if (!result || result.objects.length === 0) {
        set({
          selectedPointIds: [],
          theoremSelectionIds: [],
          validation: {
            success: false,
            message: "That equilateral action could not be placed here.",
          },
        });
        return;
      }

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
      return;
    }

    if (state.selectedTool === "theorem-sas" || state.selectedTool === "theorem-sss") {
      const result = handleCongruenceToolDrag(state, startX, startY, endX, endY);
      if (result) {
        set(result);
      }
      return;
    }

    if (state.selectedTool !== "compass" && state.selectedTool !== "straightedge" && state.selectedTool !== "extend") {
      return;
    }

    if (state.selectedTool === "extend") {
      const start = startPointId ? getPoint(state.objects, startPointId) : findNearbyPoint(state.objects, startX, startY);
      if (!start) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "Begin from an endpoint of an existing segment.",
          },
        });
        return;
      }

      const guidedEnd = snapToPointRay(state.objects, start, endX, endY);
      if (!guidedEnd) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "Drag from an endpoint through another point on an existing segment to produce the line.",
          },
        });
        return;
      }

      const baseSegment = segmentExistsBetween(state.objects, start.id, guidedEnd.guide.id);
      if (!baseSegment) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "Postulate 2 extends an existing finite segment. Draw the segment first.",
          },
        });
        return;
      }

      if (extendedLineExists(state.objects, start.id, guidedEnd.guide.id)) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "That line has already been produced in this direction.",
          },
        });
        return;
      }

      const line = createExtendedLine(start.id, guidedEnd.guide.id, baseSegment.id, "ink");
      set({
        ...addObjectWithHistory(state, line),
        selectedPointIds: [],
      });
      return;
    }

    const resolvedStart = startPointId
      ? { point: getPoint(state.objects, startPointId), newPoint: undefined }
      : resolvePointAt(state, startX, startY);
    if (!resolvedStart.point) {
      return;
    }

    const objectsWithStart = resolvedStart.newPoint ? [...state.objects, resolvedStart.newPoint] : state.objects;
    const resolvedEnd = resolvePointAt(state, endX, endY, objectsWithStart);

    if (
      resolvedStart.point.id === resolvedEnd.point.id ||
      Math.hypot(resolvedStart.point.x - resolvedEnd.point.x, resolvedStart.point.y - resolvedEnd.point.y) < 2
    ) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Choose two distinct points.",
        },
      });
      return;
    }

    const preliminaryObjects = [
      ...(resolvedStart.newPoint ? [resolvedStart.newPoint] : []),
      ...(resolvedEnd.newPoint ? [resolvedEnd.newPoint] : []),
    ];
    const result = constructBetweenPoints(
      state,
      resolvedStart.point.id,
      resolvedEnd.point.id,
      state.selectedTool,
      [...state.objects, ...preliminaryObjects],
    );
    if (result.newObjects.length === 0) {
      set({
        selectedPointIds: result.selectedPointIds,
        validation: result.validation ?? null,
      });
      return;
    }

    set(
      addObjectsAndMaybeCompleteProp14(
        state,
        [...preliminaryObjects, ...result.newObjects],
        result.selectedPointIds,
        result.newObjects[result.newObjects.length - 1]?.id ?? preliminaryObjects[preliminaryObjects.length - 1]?.id,
      ),
    );
  },
  checkConstruction: () => {
    const state = get();
    const result = validateProposition(
      state.currentPropositionId,
      state.objects,
      state.completedActionIds,
      state.reasoningRelations,
    );
    set({
      validation: result,
      proofContext: result.context ?? null,
      phase: result.success ? "constructionComplete" : "construction",
      currentReplayStep: 0,
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      animatedObjectId: null,
    });
  },
  autoCompleteConstruction: (result) =>
    set((state) => {
      if (state.phase !== "construction" || !result.success) {
        return state;
      }

      return {
        phase: "constructionComplete",
        validation: result,
        proofContext: result.context ?? null,
        currentReplayStep: 0,
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
        animatedObjectId: null,
      };
    }),
  startProofPlay: () =>
    set((state) => ({
      phase: state.proofContext ? "playingProof" : state.phase,
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      animatedObjectId: null,
    })),
  completeProofChallenge: () =>
    set((state) => {
      if (!state.proofContext) {
        return state;
      }

      const unlockStore = useUnlockStore.getState();
      unlockStore.completeProposition(state.currentPropositionId);
      const updatedUnlockStore = useUnlockStore.getState();

      return {
        phase: "proofComplete",
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
        animatedObjectId: null,
        unlockedPropositionIds: updatedUnlockStore.getUnlockedPropositionIds(),
        completedPropositionIds: updatedUnlockStore.completedPropositionIds,
      };
    }),
  startLogicReplay: () =>
    set((state) => ({
      phase: state.proofContext ? "readingReplay" : state.phase,
      currentReplayStep: 0,
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      animatedObjectId: null,
    })),
  nextReplayStep: () =>
    set((state) => ({
      currentReplayStep: Math.min(
        state.currentReplayStep + 1,
        getProposition(state.currentPropositionId).replaySteps.length - 1,
      ),
    })),
  previousReplayStep: () =>
    set((state) => ({
      currentReplayStep: Math.max(state.currentReplayStep - 1, 0),
    })),
  finishReplay: () =>
    set((state) => {
      const proposition = getProposition(state.currentPropositionId);
      const unlockStore = useUnlockStore.getState();
      unlockStore.completeProposition(state.currentPropositionId);
      const updatedUnlockStore = useUnlockStore.getState();
      const completedPropositionIds = updatedUnlockStore.completedPropositionIds;
      const unlockedPropositionIds = updatedUnlockStore.getUnlockedPropositionIds();

      return {
        phase: "completionAnimation",
        currentReplayStep: proposition.replaySteps.length - 1,
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        animatedObjectId: null,
        unlockedPropositionIds,
        completedPropositionIds,
      };
    }),
  resetProposition: () =>
    set((state) => ({
      phase: "construction",
      selectedTool: defaultToolFor(state.currentPropositionId),
      selectedPointIds: [],
      theoremSelectionIds: [],
      congruenceSelection: null,
      compassTransferSource: null,
      objects: cloneInitialObjects(state.currentPropositionId),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
      completedActionIds: [],
      reasoningRelations: [],
    })),
  undo: () =>
    set((state) => {
      const previous = state.history[state.history.length - 1];
      if (!previous) {
        return state;
      }

      return {
        objects: previous,
        history: state.history.slice(0, -1),
        selectedPointIds: [],
        theoremSelectionIds: [],
        congruenceSelection: null,
        compassTransferSource: null,
        validation: null,
        phase:
          state.phase === "logicReplay" ||
          state.phase === "readingReplay" ||
          state.phase === "completionAnimation" ||
          state.phase === "completed" ||
          state.phase === "success" ||
          state.phase === "constructionComplete" ||
          state.phase === "playingProof" ||
          state.phase === "proofComplete"
            ? "construction"
            : state.phase,
        proofContext: null,
        currentReplayStep: 0,
        animatedObjectId: null,
        completedActionIds: [],
        reasoningRelations: [],
      };
    }),
}));
