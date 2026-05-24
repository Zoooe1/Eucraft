import { create } from "zustand";
import type { AppPhase, GeometryObject, GeometryTool, Point, ProofContext, ValidationResult } from "../geometry/types";
import {
  circleExists,
  createCircle,
  createExtendedLine,
  createSegment,
  extendedLineExists,
  findNearbyPoint,
  getPoint,
  INTERSECTION_TOLERANCE,
  nextPointLabel,
  segmentExistsBetween,
  snapToPointRay,
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

  if (tool === "extend") {
    const baseSegment = segmentExistsBetween(state.objects, firstPointId, clickedPoint.id);
    if (!baseSegment) {
      return {
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Extend needs an existing finite segment. Choose an endpoint, then the point it should pass through.",
        },
      };
    }

    if (extendedLineExists(state.objects, firstPointId, clickedPoint.id)) {
      return {
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That line has already been produced in this direction.",
        },
      };
    }

    const line = createExtendedLine(firstPointId, clickedPoint.id, baseSegment.id, "ink");
    return {
      ...addObjectWithHistory(state, line),
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
            source: "intersection",
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
      const point: Point = {
        id: label,
        type: "point",
        x: intersection.x,
        y: intersection.y,
        label,
        color: "gold",
        source: "intersection",
        parentObjectIds: intersection.objects.map((object) => object.id),
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
              : state.selectedTool === "extend"
                ? "Choose an endpoint of an existing segment, then the point it should pass through."
              : "Choose an existing point. Euclid's tools begin from points already on the page.",
        },
      });
      return;
    }

    set(handlePointToolClick(state, clickedPoint, state.selectedTool));
  },
  handleCanvasDrag: (startPointId, startX, startY, endX, endY) => {
    const state = get();
    if (
      state.phase !== "construction" ||
      (state.selectedTool !== "compass" && state.selectedTool !== "straightedge" && state.selectedTool !== "extend")
    ) {
      return;
    }

    const start = startPointId ? getPoint(state.objects, startPointId) : findNearbyPoint(state.objects, startX, startY);
    if (!start) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Begin from an existing point.",
        },
      });
      return;
    }

    if (state.selectedTool === "extend") {
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

    const end = findNearbyPoint(state.objects, endX, endY);

    if (!end) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message:
            state.selectedTool === "compass"
              ? "Compass needs an existing center point and an existing radius point."
              : "Straightedge needs two existing points. Use Extend Line to produce a segment.",
        },
      });
      return;
    }

    if (start.id === end.id || Math.hypot(start.x - end.x, start.y - end.y) < 2) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "Choose two distinct points.",
        },
      });
      return;
    }

    if (state.selectedTool === "straightedge") {
      if (segmentExistsBetween(state.objects, start.id, end.id)) {
        set({
          selectedPointIds: [],
          validation: {
            success: false,
            message: "That straight line is already drawn. Choose another pair of points.",
          },
        });
        return;
      }

      const segment = createSegment(start.id, end.id, "ink");
      set({
        ...addObjectWithHistory(state, segment),
        selectedPointIds: [],
      });
      return;
    }

    if (circleExists(state.objects, start.id, end.id)) {
      set({
        selectedPointIds: [],
        validation: {
          success: false,
          message: "That circle is already on the page. Choose a new center or radius point.",
        },
      });
      return;
    }

    const isFirstEuclidCircle = state.currentPropositionId === "I.1" && start.id === "A" && end.id === "B";
    const isSecondEuclidCircle = state.currentPropositionId === "I.1" && start.id === "B" && end.id === "A";
    const circle = createCircle(start.id, end.id, isFirstEuclidCircle ? "red" : isSecondEuclidCircle ? "blue" : "gold");
    set({
      ...addObjectWithHistory(state, circle),
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
      const unlockStore = useUnlockStore.getState();
      unlockStore.completeProposition(state.currentPropositionId);
      const updatedUnlockStore = useUnlockStore.getState();
      const completedPropositionIds = updatedUnlockStore.completedPropositionIds;
      const unlockedPropositionIds = updatedUnlockStore.getUnlockedPropositionIds();

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
