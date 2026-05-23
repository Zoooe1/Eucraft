import type { GeometryTool } from "../geometry/types";
import { useGeometryStore } from "../state/useGeometryStore";

const toolLabels: Record<GeometryTool, { label: string; mark: string; hint: string }> = {
  select: {
    label: "Select",
    mark: "•",
    hint: "Select or inspect points.",
  },
  straightedge: {
    label: "Straightedge",
    mark: "╱",
    hint: "Drag from one point to another to draw a segment.",
  },
  compass: {
    label: "Compass",
    mark: "○",
    hint: "Drag from a center point to another point to set the radius.",
  },
  intersection: {
    label: "Intersection",
    mark: "×",
    hint: "Click a crossing marker to place a real point there.",
  },
};

const toolOrder: GeometryTool[] = ["select", "straightedge", "compass", "intersection"];

function toolInstruction(tool: GeometryTool, selectedCount: number) {
  if (tool === "compass" && selectedCount === 1) {
    return "Choose or drag to a point to set the radius.";
  }

  if (tool === "straightedge" && selectedCount === 1) {
    return "Choose or drag to the second point for the straightedge.";
  }

  return toolLabels[tool].hint;
}

export function ToolPanel() {
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const setTool = useGeometryStore((state) => state.setTool);
  const checkConstruction = useGeometryStore((state) => state.checkConstruction);
  const undo = useGeometryStore((state) => state.undo);
  const resetProposition = useGeometryStore((state) => state.resetProposition);
  const history = useGeometryStore((state) => state.history);

  return (
    <section className="tool-panel" aria-label="Construction tools">
      <div className="tool-grid">
        {toolOrder.map((toolKey) => {
          const toolInfo = toolLabels[toolKey];
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

      <button className="primary-button check-button" type="button" onClick={checkConstruction}>
        Check Construction
      </button>
    </section>
  );
}
