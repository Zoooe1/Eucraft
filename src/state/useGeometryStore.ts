import { create } from "zustand";
import type { AppPhase, GeometryObject, GeometryTool, Point, ProofContext, ValidationResult } from "../geometry/types";
import {
  circleExists,
  createAuxiliaryPoint,
  createCircle,
  createSegment,
  findNearbyPoint,
  getPoint,
  INTERSECTION_TOLERANCE,
  nextPointLabel,
  segmentExistsBetween,
} from "../geometry/operations";
import { findNearbyIntersection, pointNearCoordinates } from "../geometry/intersections";
import { validateProposition } from "../geometry/validation";
import { getProposition } from "../propositions";

type GeometryStore = {
  phase: AppPhase;
  backgroundColor: string;
  currentPropositionId: string;
  unlockedPropositionIds: string[];
  completedPropositionIds: string[];
  selectedTool: GeometryTool;
  selectedPointIds: string[];
  animatedObjectId: string | null;
  objects: GeometryObject[];
  history: GeometryObject[][];
  validation: ValidationResult | null;
  proofContext: ProofContext | null;
  currentReplayStep: number;
  startApp: () => void;
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

const PROGRESS_KEY = "eucraft-progress-v1";
const FIRST_PROPOSITION_ID = "I.1";

function readProgress() {
  if (typeof window === "undefined") {
    return { unlockedPropositionIds: [FIRST_PROPOSITION_ID], completedPropositionIds: [] };
  }

  try {
    const progress = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "{}") as {
      unlockedPropositionIds?: string[];
      completedPropositionIds?: string[];
    };
    return {
      unlockedPropositionIds: Array.from(new Set([FIRST_PROPOSITION_ID, ...(progress.unlockedPropositionIds ?? [])])),
      completedPropositionIds: progress.completedPropositionIds ?? [],
    };
  } catch {
    return { unlockedPropositionIds: [FIRST_PROPOSITION_ID], completedPropositionIds: [] };
  }
}

function writeProgress(unlockedPropositionIds: string[], completedPropositionIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ unlockedPropositionIds, completedPropositionIds }));
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

function constructBetweenPoints(state: GeometryStore, firstPointId: string, secondPointId: string, tool: GeometryTool) {
  const clickedPoint = getPoint(state.objects, secondPointId);
  if (!clickedPoint || firstPointId === clickedPoint.id) {
    return {
      selectedPointIds: [],
      validation: null,
    };
  }

  if (tool === "straightedge") {
    if (segmentExistsBetween(state.objects, firstPointId, clickedPoint.id)) {
      return {
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That straight line is already drawn. Choose another pair of points.",
        },
      };
    }

    const segment = createSegment(firstPointId, clickedPoint.id, "ink");
    return {
      ...addObjectWithHistory(state, segment),
      selectedPointIds: [],
    };
  }

  if (circleExists(state.objects, firstPointId, clickedPoint.id)) {
    return {
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
    ...addObjectWithHistory(state, circle),
    selectedPointIds: [],
  };
}

function resolveDragPoint(
  objects: GeometryObject[],
  pointId: string | null,
  x: number,
  y: number,
): { point: Point; newPoint?: Point } {
  const existing = pointId ? getPoint(objects, pointId) : findNearbyPoint(objects, x, y);
  if (existing) {
    return { point: existing };
  }

  const point = createAuxiliaryPoint(x, y);
  return { point, newPoint: point };
}

function handlePointToolClick(state: GeometryStore, clickedPoint: Point, tool: GeometryTool) {
  if (state.selectedPointIds.length === 0) {
    return {
      selectedPointIds: [clickedPoint.id],
      validation: null,
    };
  }

  return constructBetweenPoints(state, state.selectedPointIds[0], clickedPoint.id, tool);
}

export const useGeometryStore = create<GeometryStore>((set, get) => ({
  phase: "title",
  backgroundColor: "#efe3cf",
  currentPropositionId: FIRST_PROPOSITION_ID,
  unlockedPropositionIds: initialProgress.unlockedPropositionIds,
  completedPropositionIds: initialProgress.completedPropositionIds,
  selectedTool: "compass",
  selectedPointIds: [],
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
      validation: null,
      animatedObjectId: null,
    }),
  enterProposition: () =>
    set((state) => ({
      phase: "intro",
      selectedTool: "compass",
      selectedPointIds: [],
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
      const point: Point = {
        id: label,
        type: "point",
        x: intersection.x,
        y: intersection.y,
        label,
        color: "gold",
      };

      set({
        ...addObjectWithHistory(state, point),
        selectedPointIds: [],
      });
      return;
    }

    if (state.selectedTool === "select") {
      const point = findNearbyPoint(state.objects, x, y);
      set({
        selectedPointIds: point ? [point.id] : [],
        validation: null,
      });
      return;
    }

    const clickedPoint = findNearbyPoint(state.objects, x, y);
    if (!clickedPoint) {
      set({
        validation: {
          success: false,
          message:
            state.selectedTool === "straightedge"
              ? "Choose an existing point. Mark an intersection first if you want to draw from it."
              : "Choose an existing point. Euclid's tools begin from points already on the page.",
        },
      });
      return;
    }

    set(handlePointToolClick(state, clickedPoint, state.selectedTool));
  },
  handleCanvasDrag: (startPointId, startX, startY, endX, endY) => {
    const state = get();
    if (state.phase !== "construction" || (state.selectedTool !== "compass" && state.selectedTool !== "straightedge")) {
      return;
    }

    const start = resolveDragPoint(state.objects, startPointId, startX, startY);
    const objectsWithStart = start.newPoint ? [...state.objects, start.newPoint] : state.objects;
    const end = resolveDragPoint(objectsWithStart, null, endX, endY);
    const newPoints = [start.newPoint, end.newPoint].filter(Boolean) as Point[];

    if (start.point.id === end.point.id || Math.hypot(start.point.x - end.point.x, start.point.y - end.point.y) < 2) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Drag far enough to give Euclid something to draw.",
        },
      });
      return;
    }

    const workingObjects = [...state.objects, ...newPoints];

    if (state.selectedTool === "straightedge") {
      if (segmentExistsBetween(workingObjects, start.point.id, end.point.id)) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "That straight line is already drawn. Choose another pair of points.",
          },
        });
        return;
      }

      const segment = createSegment(start.point.id, end.point.id, "ink");
      set({
        ...addObjectsWithHistory(state, [...newPoints, segment], segment.id),
        selectedPointIds: [],
      });
      return;
    }

    if (circleExists(workingObjects, start.point.id, end.point.id)) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That circle is already on the page. Choose a new center or radius point.",
        },
      });
      return;
    }

    const isFirstEuclidCircle = state.currentPropositionId === "I.1" && start.point.id === "A" && end.point.id === "B";
    const isSecondEuclidCircle = state.currentPropositionId === "I.1" && start.point.id === "B" && end.point.id === "A";
    const circle = createCircle(start.point.id, end.point.id, isFirstEuclidCircle ? "red" : isSecondEuclidCircle ? "blue" : "gold");
    set({
      ...addObjectsWithHistory(state, [...newPoints, circle], circle.id),
      selectedPointIds: [],
    });
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
      const completedPropositionIds = Array.from(new Set([...state.completedPropositionIds, state.currentPropositionId]));
      const unlockedPropositionIds = Array.from(
        new Set([...state.unlockedPropositionIds, ...(proposition.nextPropositionId ? [proposition.nextPropositionId] : [])]),
      );
      writeProgress(unlockedPropositionIds, completedPropositionIds);

      return {
        phase: "completed",
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
        validation: null,
        phase:
          state.phase === "logicReplay" || state.phase === "completed" || state.phase === "success"
            ? "construction"
            : state.phase,
        proofContext: null,
        currentReplayStep: 0,
        animatedObjectId: null,
      };
    }),
}));
