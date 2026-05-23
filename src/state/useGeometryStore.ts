import { create } from "zustand";
import type { AppPhase, GeometryObject, GeometryTool, Point, ProofContext, ValidationResult } from "../geometry/types";
import {
  circleExists,
  createCircle,
  createSegment,
  findNearbyPoint,
  getPoint,
  INTERSECTION_TOLERANCE,
  nextPointLabel,
  segmentExistsBetween,
} from "../geometry/operations";
import { findNearbyIntersection, pointNearCoordinates } from "../geometry/intersections";
import { validateBook1Prop1 } from "../geometry/validation";
import { book1Prop1 } from "../propositions/book1prop1";

type GeometryStore = {
  phase: AppPhase;
  backgroundColor: string;
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
  startConstruction: () => void;
  setBackgroundColor: (color: string) => void;
  setTool: (tool: GeometryTool) => void;
  handleCanvasClick: (x: number, y: number) => void;
  handleCanvasDrag: (startPointId: string, endX: number, endY: number) => void;
  checkConstruction: () => void;
  startLogicReplay: () => void;
  nextReplayStep: () => void;
  previousReplayStep: () => void;
  finishReplay: () => void;
  resetProposition: () => void;
  undo: () => void;
};

const cloneInitialObjects = () => book1Prop1.initialObjects.map((object) => ({ ...object }));

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

  const isFirstEuclidCircle = firstPointId === "A" && clickedPoint.id === "B";
  const isSecondEuclidCircle = firstPointId === "B" && clickedPoint.id === "A";
  const circle = createCircle(firstPointId, clickedPoint.id, isFirstEuclidCircle ? "red" : isSecondEuclidCircle ? "blue" : "gold");
  return {
    ...addObjectWithHistory(state, circle),
    selectedPointIds: [],
  };
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
  selectedTool: "compass",
  selectedPointIds: [],
  animatedObjectId: null,
  objects: cloneInitialObjects(),
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
    set({
      phase: "intro",
      selectedTool: "compass",
      selectedPointIds: [],
      objects: cloneInitialObjects(),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
    }),
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
            message: "No circle crossing is close enough. Click where the two circles cross.",
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
        set({
          validation: {
            success: false,
            message: `${existing.label ?? "That point"} is already marked. Use the straightedge to connect it to A and B.`,
          },
        });
        return;
      }

      const label = nextPointLabel(state.objects);
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
  handleCanvasDrag: (startPointId, endX, endY) => {
    const state = get();
    if (state.phase !== "construction" || (state.selectedTool !== "compass" && state.selectedTool !== "straightedge")) {
      return;
    }

    const startPoint = getPoint(state.objects, startPointId);
    const endPoint = findNearbyPoint(state.objects, endX, endY);

    if (!startPoint || !endPoint) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message:
            state.selectedTool === "compass"
              ? "Drag from a center point and release on another point to set the radius."
              : "Drag from one existing point and release on another point to draw the straightedge.",
        },
      });
      return;
    }

    set(constructBetweenPoints(state, startPoint.id, endPoint.id, state.selectedTool));
  },
  checkConstruction: () => {
    const result = validateBook1Prop1(get().objects);
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
      currentReplayStep: Math.min(state.currentReplayStep + 1, book1Prop1.replaySteps.length - 1),
    })),
  previousReplayStep: () =>
    set((state) => ({
      currentReplayStep: Math.max(state.currentReplayStep - 1, 0),
    })),
  finishReplay: () =>
    set({
      phase: "completed",
      currentReplayStep: book1Prop1.replaySteps.length - 1,
      selectedPointIds: [],
      animatedObjectId: null,
    }),
  resetProposition: () =>
    set({
      phase: "intro",
      selectedTool: "compass",
      selectedPointIds: [],
      objects: cloneInitialObjects(),
      history: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
      animatedObjectId: null,
    }),
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
