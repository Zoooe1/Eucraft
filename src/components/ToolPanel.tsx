import type { GeometryTool } from "../geometry/types";
import { useGeometryStore } from "../state/useGeometryStore";

const toolLabels: Partial<Record<GeometryTool, { label: string; mark: string; hint: string }>> = {
  point: {
    label: "Point",
    mark: "•",
    hint: "Click to create a point, or select an existing nearby point.",
  },
  straightedge: {
    label: "Straightedge",
    mark: "╱",
    hint: "Draw a full straight line through two points.",
  },
  compass: {
    label: "Compass",
    mark: "○",
    hint: "Draw a circle from a center to a radius point.",
  },
  "compass-transfer": {
    label: "Copy Length",
    mark: "◌",
    hint: "Choose a source length, then choose the compass center point.",
  },
  intersection: {
    label: "Intersection",
    mark: "×",
    hint: "Move near a crossing, then click when the gold snap dot appears.",
  },
  "theorem-equilateral": {
    label: "Equilateral",
    mark: "△",
    hint: "Choose a segment, or drag endpoint to endpoint and pull to a side.",
  },
  "theorem-bisect-angle": {
    label: "Bisect Angle",
    mark: "∠",
    hint: "Choose a vertex and two side points.",
  },
  "theorem-bisect-segment": {
    label: "Bisect Segment",
    mark: "—",
    hint: "Choose a segment to mark its midpoint.",
  },
};

const fallbackToolLabel = {
  label: "Euclid Action",
  mark: "◇",
  hint: "Use the active theorem-action on the construction page.",
};

const toolOrder: GeometryTool[] = ["point", "straightedge", "compass", "compass-transfer", "intersection"];

function toolInstruction(tool: GeometryTool, selectedCount: number) {
  if (tool === "compass" && selectedCount === 1) {
    return "Choose a radius point.";
  }

  if (tool === "compass-transfer") {
    return toolLabels[tool]?.hint ?? fallbackToolLabel.hint;
  }

  if (tool === "straightedge" && selectedCount === 1) {
    return "Choose another point; the line continues both ways.";
  }

  return toolLabels[tool]?.hint ?? fallbackToolLabel.hint;
}

export function ToolPanel() {
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const setTool = useGeometryStore((state) => state.setTool);
  const undo = useGeometryStore((state) => state.undo);
  const resetProposition = useGeometryStore((state) => state.resetProposition);
  const history = useGeometryStore((state) => state.history);

  return (
    <section className="tool-panel" aria-label="Construction tools">
      <div className="tool-grid">
        {toolOrder.map((toolKey) => {
          const toolInfo = toolLabels[toolKey] ?? fallbackToolLabel;
          return (
            <button
              className={selectedTool === toolKey ? "tool-button active" : "tool-button"}
              key={toolKey}
              type="button"
              onClick={() => setTool(toolKey)}
              title={toolInfo.hint}
            >
              <span aria-hidden="true">{toolInfo.mark}</span>
              {toolInfo.label}
            </button>
          );
        })}
      </div>

      <p className="tool-instruction">{toolInstruction(selectedTool, selectedPointIds.length)}</p>

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
