import { create } from "zustand";
import type { AppPhase, GeometryObject, GeometryTool, Point, ProofContext, ValidationResult } from "../geometry/types";
import {
  circleExists,
  createCircle,
  createSegment,
  findNearbyPoint,
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
  checkConstruction: () => void;
  startLogicReplay: () => void;
  nextReplayStep: () => void;
  previousReplayStep: () => void;
  finishReplay: () => void;
  resetProposition: () => void;
  undo: () => void;
};

const cloneInitialObjects = () => book1Prop1.initialObjects.map((object) => ({ ...object }));

function addObjectWithHistory(state: GeometryStore, object: GeometryObject) {
  return {
    phase: "construction" as AppPhase,
    objects: [...state.objects, object],
    history: [...state.history, state.objects],
    validation: null,
    proofContext: null,
    currentReplayStep: 0,
  };
}

function handlePointToolClick(state: GeometryStore, clickedPoint: Point, tool: GeometryTool) {
  if (state.selectedPointIds.length === 0) {
    return {
      selectedPointIds: [clickedPoint.id],
      validation: null,
    };
  }

  const firstPointId = state.selectedPointIds[0];
  if (firstPointId === clickedPoint.id) {
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

export const useGeometryStore = create<GeometryStore>((set, get) => ({
  phase: "title",
  backgroundColor: "#efe3cf",
  selectedTool: "compass",
  selectedPointIds: [],
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
    }),
  startConstruction: () =>
    set({
      phase: "construction",
      selectedTool: "compass",
      selectedPointIds: [],
      validation: null,
      proofContext: null,
      currentReplayStep: 0,
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
            message: "No circle crossing is close enough. Click one of the highlighted crossing targets.",
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
          message: "Choose an existing point. Euclid's tools begin from points already on the page.",
        },
      });
      return;
    }

    set(handlePointToolClick(state, clickedPoint, state.selectedTool));
  },
  checkConstruction: () => {
    const result = validateBook1Prop1(get().objects);
    set({
      validation: result,
      proofContext: result.context ?? null,
      phase: result.success ? "success" : "construction",
      currentReplayStep: 0,
      selectedPointIds: [],
    });
  },
  startLogicReplay: () =>
    set((state) => ({
      phase: state.proofContext ? "logicReplay" : state.phase,
      currentReplayStep: 0,
      selectedPointIds: [],
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
      };
    }),
}));
