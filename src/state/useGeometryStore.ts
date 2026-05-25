import { create } from "zustand";
import type { AppPhase, GeometryObject, GeometryTool, Point, ProofContext, Segment, ValidationResult } from "../geometry/types";
import {
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
  INTERSECTION_TOLERANCE,
  nextPointLabel,
  segmentExistsBetween,
  snapToPointRay,
  transferredCircleExists,
} from "../geometry/operations";
import { findNearbyIntersection, pointNearCoordinates } from "../geometry/intersections";
import { validateProposition } from "../geometry/validation";
import { getProposition } from "../propositions";
import { useUnlockStore } from "./useUnlockStore";

type GeometryStore = {
  phase: AppPhase;
  backgroundColor: string;
  currentPropositionId: string;
  unlockedPropositionIds: string[];
  completedPropositionIds: string[];
  selectedTool: GeometryTool;
  selectedPointIds: string[];
  compassTransferSource: { p1: string; p2: string; segmentId?: string } | null;
  animatedObjectId: string | null;
  objects: GeometryObject[];
  history: GeometryObject[][];
  validation: ValidationResult | null;
  proofContext: ProofContext | null;
  currentReplayStep: number;
  startApp: () => void;
  returnToTitle: () => void;
  enterProposition: () => void;
  openProposition: (id: string) => void;
  startConstruction: () => void;
  setBackgroundColor: (color: string) => void;
  setTool: (tool: GeometryTool) => void;
  handleCanvasClick: (x: number, y: number) => void;
  handleCanvasDrag: (startPointId: string | null, startX: number, startY: number, endX: number, endY: number) => void;
  checkConstruction: () => void;
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

const cloneInitialObjects = (propositionId: string) =>
  getProposition(propositionId).initialObjects.map((object) => ({ ...object }));

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

function buildEquilateralTriangleOnSegment(state: GeometryStore, segment: Segment) {
  const p1 = getPoint(state.objects, segment.p1);
  const p2 = getPoint(state.objects, segment.p2);
  if (!p1 || !p2) {
    return undefined;
  }

  const heightScale = Math.sqrt(3) / 2;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const apexX = midX + (p2.y - p1.y) * heightScale;
  const apexY = midY - (p2.x - p1.x) * heightScale;
  const label = pointLabel(state, state.objects);
  const apex = createPoint(label, apexX, apexY, "theorem-action", {
    color: "gold",
    parentObjectIds: [segment.id],
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

function segmentPoints(objects: GeometryObject[], segment: Segment) {
  const p1 = getPoint(objects, segment.p1);
  const p2 = getPoint(objects, segment.p2);
  return p1 && p2 ? { p1, p2 } : undefined;
}

function addSegmentIfMissing(objects: GeometryObject[], p1: string, p2: string, color: string, source: string) {
  return segmentExistsBetween(objects, p1, p2) ? [] : [createSegment(p1, p2, color, source)];
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

function constructParallelThroughPoint(state: GeometryStore, pointId: string, segment: Segment) {
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

function constructCopiedAnglePreview(state: GeometryStore, vertex: Point) {
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
    if (segmentExistsBetween(objects, firstPointId, clickedPoint.id)) {
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
  selectedTool: "compass",
  selectedPointIds: [],
  compassTransferSource: null,
  animatedObjectId: null,
  objects: cloneInitialObjects(FIRST_PROPOSITION_ID),
  history: [],
  validation: null,
  proofContext: null,
  currentReplayStep: 0,
  startApp: () =>
    set({
      phase: "laws",
      selectedPointIds: [],
      compassTransferSource: null,
      validation: null,
      animatedObjectId: null,
    }),
  returnToTitle: () =>
    set(() => {
      const progress = readProgress();
      return {
        phase: "title",
        selectedPointIds: [],
        compassTransferSource: null,
        validation: null,
        animatedObjectId: null,
        unlockedPropositionIds: progress.unlockedPropositionIds,
        completedPropositionIds: progress.completedPropositionIds,
      };
    }),
  enterProposition: () =>
    set((state) => ({
      phase: "intro",
      selectedTool: "compass",
      selectedPointIds: [],
      compassTransferSource: null,
      objects: cloneInitialObjects(state.currentPropositionId),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
    })),
  openProposition: (id) => {
    const state = get();
    if (!state.unlockedPropositionIds.includes(id)) {
      return;
    }

    set({
      phase: "intro",
      currentPropositionId: id,
      selectedTool: "compass",
      selectedPointIds: [],
      compassTransferSource: null,
      objects: cloneInitialObjects(id),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
    });
  },
  startConstruction: () =>
    set({
      phase: "construction",
      selectedTool: "compass",
      selectedPointIds: [],
      compassTransferSource: null,
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
    }),
  setBackgroundColor: (color) =>
    set({
      backgroundColor: color,
    }),
  setTool: (tool) =>
    set({
      selectedTool: tool,
      selectedPointIds: [],
      compassTransferSource: null,
      validation: null,
    }),
  handleCanvasClick: (x, y) => {
    const state = get();
    if (state.phase !== "construction") {
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

      const result = bisectSegmentWithMidpoint(state, segment);
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

      const segment = findNearbySegment(state.objects, x, y, 28);
      const externalPointId = state.selectedPointIds[0];
      if (!segment) {
        set({
          validation: {
            success: false,
            message: "Choose the line that should receive the dropped perpendicular.",
          },
        });
        return;
      }

      const result = dropPerpendicularToSegment(state, externalPointId, segment);
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

      set(addObjectsAndSelect(state, result.objects, [], result.animatedObjectId));
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
        const resolvedCenter = resolvePointAt(state, x, y);
        const objectsWithCenter = resolvedCenter.newPoint ? [...state.objects, resolvedCenter.newPoint] : state.objects;
        const { p1, p2 } = state.compassTransferSource;

        if (transferredCircleExists(objectsWithCenter, resolvedCenter.point.id, p1, p2)) {
          set({
            selectedPointIds: [],
            compassTransferSource: null,
            validation: {
              success: false,
              message: "That transferred-width circle is already on the page.",
            },
          });
          return;
        }

        const circle = createCircleFromLength(resolvedCenter.point.id, p1, p2, "gold", "I.2");
        set(addObjectsAndSelect(state, [...(resolvedCenter.newPoint ? [resolvedCenter.newPoint] : []), circle], [], circle.id));
        return;
      }

      if (state.selectedPointIds.length === 0) {
        const sourceSegment = findNearbySegment(state.objects, x, y, 20);
        if (sourceSegment) {
          set({
            selectedPointIds: [sourceSegment.p1, sourceSegment.p2],
            compassTransferSource: {
              p1: sourceSegment.p1,
              p2: sourceSegment.p2,
              segmentId: sourceSegment.id,
            },
            validation: null,
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
            message: "Choose two distinct points for the compass width.",
          },
        });
        return;
      }

      set({
        ...addObjectsAndSelect(state, newObjects, [firstPointId, resolvedSecond.point.id], resolvedSecond.newPoint?.id),
        compassTransferSource: {
          p1: firstPointId,
          p2: resolvedSecond.point.id,
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
      addObjectsAndSelect(
        state,
        [...(resolvedPoint.newPoint ? [resolvedPoint.newPoint] : []), ...result.newObjects],
        result.selectedPointIds,
        result.newObjects[result.newObjects.length - 1]?.id ?? resolvedPoint.newPoint?.id,
      ),
    );
  },
  handleCanvasDrag: (startPointId, startX, startY, endX, endY) => {
    const state = get();
    if (
      state.phase !== "construction" ||
      (state.selectedTool !== "compass" && state.selectedTool !== "straightedge" && state.selectedTool !== "extend")
    ) {
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
      addObjectsAndSelect(
        state,
        [...preliminaryObjects, ...result.newObjects],
        result.selectedPointIds,
        result.newObjects[result.newObjects.length - 1]?.id ?? preliminaryObjects[preliminaryObjects.length - 1]?.id,
      ),
    );
  },
  checkConstruction: () => {
    const state = get();
    const result = validateProposition(state.currentPropositionId, state.objects);
    set({
      validation: result,
      proofContext: result.context ?? null,
      phase: result.success ? "logicReplay" : "construction",
      currentReplayStep: 0,
      selectedPointIds: [],
      animatedObjectId: null,
    });
  },
  startLogicReplay: () =>
    set((state) => ({
      phase: state.proofContext ? "logicReplay" : state.phase,
      currentReplayStep: 0,
      selectedPointIds: [],
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
        animatedObjectId: null,
        unlockedPropositionIds,
        completedPropositionIds,
      };
    }),
  resetProposition: () =>
    set((state) => ({
      phase: "intro",
      selectedTool: "compass",
      selectedPointIds: [],
      compassTransferSource: null,
      objects: cloneInitialObjects(state.currentPropositionId),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
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
        compassTransferSource: null,
        validation: null,
        phase:
          state.phase === "logicReplay" ||
          state.phase === "completionAnimation" ||
          state.phase === "completed" ||
          state.phase === "success"
            ? "construction"
            : state.phase,
        proofContext: null,
        currentReplayStep: 0,
        animatedObjectId: null,
      };
    }),
}));
