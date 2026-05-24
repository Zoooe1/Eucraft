import type { GeometryTool } from "../geometry/types";
import { useGeometryStore } from "../state/useGeometryStore";

const toolLabels: Record<GeometryTool, { label: string; mark: string; hint: string }> = {
  point: {
    label: "Point",
    mark: "•",
    hint: "Click to create a point, or select an existing nearby point.",
  },
  straightedge: {
    label: "Straightedge",
    mark: "╱",
    hint: "Drag between points, or drag through a point to produce a straight-line.",
  },
  extend: {
    label: "Extend",
    mark: "↗",
    hint: "Produce an existing finite straight-line.",
  },
  compass: {
    label: "Compass",
    mark: "○",
    hint: "Draw a circle from a center to a radius point.",
  },
  "compass-transfer": {
    label: "Set Width",
    mark: "◌",
    hint: "Choose a source segment or two points, then choose a center.",
  },
  intersection: {
    label: "Intersection",
    mark: "×",
    hint: "Move near a crossing, then click when the gold snap dot appears.",
  },
};

const toolOrder: GeometryTool[] = ["point", "straightedge", "extend", "compass", "compass-transfer", "intersection"];

function toolInstruction(tool: GeometryTool, selectedCount: number) {
  if (tool === "compass" && selectedCount === 1) {
    return "Choose a radius point.";
  }

  if (tool === "compass-transfer") {
    return selectedCount === 1 ? "Choose the second point of the source length." : toolLabels[tool].hint;
  }

  if (tool === "straightedge" && selectedCount === 1) {
    return "Choose another point, or drag through a point to produce the line.";
  }

  if (tool === "extend" && selectedCount === 1) {
    return "Choose the point the extension passes through.";
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
