import { useMemo } from "react";
import {
  historicalUnlockIdsForProposition,
  theoremActionUnlocksForProposition,
} from "../euclid/gameplayRegistry";
import { unlocks } from "../euclid/unlocks";
import type { GeometryTool, Unlock } from "../geometry/types";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";
import { ToolIcon } from "./tools/ToolIcon";

const toolConfig: Record<string, { tool: GeometryTool; mark: string; fallbackHint: string }> = {
  "primitive-point-selector": {
    tool: "point",
    mark: "•",
    fallbackHint: "Create a point, or select an existing nearby point.",
  },
  "primitive-arrange-triangle": {
    tool: "arrange-triangle",
    mark: "△",
    fallbackHint: "Move or rotate a rigid triangle until it coincides with another triangle.",
  },
  "primitive-straightedge": {
    tool: "straightedge",
    mark: "╱",
    fallbackHint: "Draw a full straight line through two points.",
  },
  "primitive-extend-line": {
    tool: "extend",
    mark: "↗",
    fallbackHint: "Produce a straight line continuously through a point.",
  },
  "primitive-compass": {
    tool: "compass",
    mark: "○",
    fallbackHint: "Draw a circle with center and radius points.",
  },
  "primitive-intersection-selector": {
    tool: "intersection",
    mark: "×",
    fallbackHint: "Create a point at a valid intersection.",
  },
};

const theoremActionTools: Record<string, GeometryTool> = {
  constructEquilateralTriangleOnSegment: "theorem-equilateral",
  createCircleWithTransferredRadius: "compass-transfer",
  cutOffEqualSegment: "compass-transfer",
  applySASCongruence: "theorem-sas",
  applySSSCongruence: "theorem-sss",
  bisectAngle: "theorem-bisect-angle",
  bisectSegment: "theorem-bisect-segment",
  dropPerpendicularFromPointToLine: "theorem-drop-perpendicular",
  constructTriangleFromThreeSegments: "theorem-triangle-sss",
  copyAngleToLine: "theorem-copy-angle",
  drawParallelThroughPoint: "theorem-parallel",
  constructParallelogramEqualToTriangle: "theorem-parallelogram-triangle",
  applyParallelogramEqualToTriangleOnLine: "theorem-parallelogram-line",
  constructParallelogramEqualToRectilinearFigure: "theorem-parallelogram-figure",
  constructSquareOnSegment: "theorem-square",
};

function toolBrief(tool: GeometryTool, propositionId: string) {
  if (tool === "point") {
    return "Point: create or select a point.";
  }

  if (tool === "straightedge") {
    return "Straightedge: draw a straight line through two points.";
  }

  if (tool === "extend") {
    return "Extend: produce a line beyond a chosen point.";
  }

  if (tool === "compass") {
    return "Compass: draw a circle from a center and radius.";
  }

  if (tool === "intersection") {
    return "Intersection: mark where constructed objects meet.";
  }

  if (tool === "arrange-triangle") {
    return "Arrange: move or rotate a rigid triangle.";
  }

  if (tool === "compass-transfer") {
    return "Copy Length: choose a source length, a start point, then a target line or ray.";
  }

  if (tool === "theorem-equilateral") {
    return "Equilateral: click a segment, or drag endpoint to endpoint and pull to a side.";
  }

  if (tool === "theorem-sas") {
    return "SAS: click side, included vertex, side, then the matching parts.";
  }

  if (tool === "theorem-sss") {
    return "SSS: click three sides, then the matching three sides.";
  }

  if (tool === "theorem-bisect-angle") {
    return "Bisect Angle: divide an angle into two equal angles.";
  }

  if (tool === "theorem-bisect-segment") {
    return "Bisect Segment: mark the midpoint of a segment.";
  }

  if (tool === "theorem-drop-perpendicular") {
    if (propositionId === "I.13") {
      return "Perpendicular: click B on CD, then another point on CD.";
    }

    return "Perpendicular: click the outside point, then a point on the line.";
  }

  if (tool === "theorem-triangle-sss") {
    return "Triangle SSS: build a triangle from three lengths.";
  }

  if (tool === "theorem-copy-angle") {
    return "Copy Angle: place an equal angle on a new line.";
  }

  if (tool === "theorem-parallel") {
    return "Parallel: draw a line parallel to a given line.";
  }

  if (
    tool === "theorem-parallelogram-triangle" ||
    tool === "theorem-parallelogram-line" ||
    tool === "theorem-parallelogram-figure"
  ) {
    return "Area: construct an equal parallelogram.";
  }

  if (tool === "theorem-square") {
    return "Square: construct a square on a segment.";
  }

  return "Select a tool.";
}

function TheoremActionButton({
  unlock,
  selectedTool,
  setTool,
}: {
  unlock: Unlock;
  selectedTool: GeometryTool;
  setTool: (tool: GeometryTool) => void;
}) {
  const tool = theoremActionTools[unlock.functionName];

  if (tool) {
    return (
      <button
        className={selectedTool === tool ? "theorem-action-button active" : "theorem-action-button actionable"}
        aria-label={unlock.name}
        type="button"
        onClick={() => setTool(tool)}
        title={unlock.description}
      >
        <ToolIcon tool={tool} />
        <span className="sr-only">{unlock.name}</span>
      </button>
    );
  }

  return (
    <button className="theorem-action-button" aria-label={unlock.name} type="button" title={unlock.description}>
      <span className="sr-only">{unlock.name}</span>
    </button>
  );
}

export function ToolShelf() {
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const setTool = useGeometryStore((state) => state.setTool);
  const undo = useGeometryStore((state) => state.undo);
  const resetProposition = useGeometryStore((state) => state.resetProposition);
  const history = useGeometryStore((state) => state.history);
  const allowedTools = getProposition(currentPropositionId).allowedTools;
  const historicalUnlockIds = useMemo(() => historicalUnlockIdsForProposition(currentPropositionId), [currentPropositionId]);
  const visibleTools = useMemo(
    () =>
      unlocks.filter(
        (unlock) => {
          const config = toolConfig[unlock.id];
          return (
            Boolean(config && (historicalUnlockIds.has(unlock.id) || allowedTools.includes(config.tool))) &&
            unlock.unlockType === "primitive-tool" &&
            unlock.visibleToPlayer
          );
        },
      ),
    [allowedTools, historicalUnlockIds],
  );
  const theoremActions = useMemo(
    () =>
      [
        ...theoremActionUnlocksForProposition(currentPropositionId),
        ...unlocks.filter((unlock) => {
          const tool = theoremActionTools[unlock.functionName];
          return Boolean(tool && allowedTools.includes(tool) && unlock.unlockType === "theorem-action" && unlock.visibleToPlayer);
        }),
      ].filter((unlock, index, list) => {
        const tool = theoremActionTools[unlock.functionName];
        return (
          list.findIndex((candidate) => candidate.id === unlock.id) === index &&
          (!tool || list.findIndex((candidate) => theoremActionTools[candidate.functionName] === tool) === index)
        );
      }),
    [allowedTools, currentPropositionId],
  );
  return (
    <section className="tool-panel" aria-label="Construction tools">
      <div>
        <div className="tool-grid">
          {visibleTools.map((unlock) => {
            const config = toolConfig[unlock.id];
            if (!config) {
              return null;
            }

            return (
              <button
                className={selectedTool === config.tool ? "tool-button active" : "tool-button"}
                aria-label={unlock.name}
                key={unlock.id}
                type="button"
                onClick={() => setTool(config.tool)}
                title={unlock.description || config.fallbackHint}
              >
                <span className="tool-icon-mark" aria-hidden="true">
                  <ToolIcon tool={config.tool} />
                </span>
                <span className="sr-only">{unlock.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {theoremActions.length > 0 && (
        <div className="theorem-action-shelf">
          <div className="unlock-button-list">
            {theoremActions.map((unlock) => (
              <TheoremActionButton key={unlock.id} unlock={unlock} selectedTool={selectedTool} setTool={setTool} />
            ))}
          </div>
        </div>
      )}

      <p className="tool-instruction">{toolBrief(selectedTool, currentPropositionId)}</p>

      <div className="action-row">
        <button className="quiet-button" type="button" onClick={undo} disabled={history.length === 0}>
          Undo
        </button>
        <button className="quiet-button" type="button" onClick={resetProposition}>
          Reset
        </button>
      </div>

    </section>
  );
}
