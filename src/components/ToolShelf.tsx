import { useMemo } from "react";
import { unlocks } from "../euclid/unlocks";
import type { GeometryTool, Unlock } from "../geometry/types";
import { useGeometryStore } from "../state/useGeometryStore";
import { useUnlockStore } from "../state/useUnlockStore";

const toolConfig: Record<string, { tool: GeometryTool; mark: string; fallbackHint: string }> = {
  "primitive-point-selector": {
    tool: "point",
    mark: "•",
    fallbackHint: "Create a point, or select an existing nearby point.",
  },
  "primitive-straightedge": {
    tool: "straightedge",
    mark: "╱",
    fallbackHint: "Draw a straight-line segment between points.",
  },
  "primitive-extend-line": {
    tool: "extend",
    mark: "↗",
    fallbackHint: "Produce an existing segment in a straight line.",
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

function toolInstruction(tool: GeometryTool, selectedCount: number, hasCompassTransferSource: boolean) {
  if (tool === "point") {
    return "Click anywhere to place a point; nearby points and intersections snap first.";
  }

  if (tool === "compass" && selectedCount === 1) {
    return "Choose a radius point, or click freely to create one.";
  }

  if (tool === "straightedge" && selectedCount === 1) {
    return "Choose another point, or click freely to create one.";
  }

  if (tool === "extend" && selectedCount === 1) {
    return "Choose the point the extension passes through.";
  }

  if (tool === "intersection") {
    return "Move near a crossing, then click when the gold snap dot appears.";
  }

  if (tool === "compass-transfer") {
    if (hasCompassTransferSource) {
      return "Choose the center point for the transferred-width circle.";
    }

    if (selectedCount === 1) {
      return "Choose the second point of the source length.";
    }

    return "Choose a source segment, or choose two points for the compass width.";
  }

  return "Euclid begins from given points, constructed points, and intersections.";
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
  if (unlock.functionName === "createCircleWithTransferredRadius") {
    return (
      <button
        className={selectedTool === "compass-transfer" ? "theorem-action-button active" : "theorem-action-button"}
        type="button"
        onClick={() => setTool("compass-transfer")}
        title={unlock.description}
      >
        <span>{unlock.source}</span>
        {unlock.name}
      </button>
    );
  }

  return (
    <button className="theorem-action-button" type="button" title={unlock.description}>
      <span>{unlock.source}</span>
      {unlock.name}
    </button>
  );
}

export function ToolShelf() {
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const selectedPointIds = useGeometryStore((state) => state.selectedPointIds);
  const compassTransferSource = useGeometryStore((state) => state.compassTransferSource);
  const setTool = useGeometryStore((state) => state.setTool);
  const checkConstruction = useGeometryStore((state) => state.checkConstruction);
  const undo = useGeometryStore((state) => state.undo);
  const resetProposition = useGeometryStore((state) => state.resetProposition);
  const history = useGeometryStore((state) => state.history);
  const unlockedIds = useUnlockStore((state) => state.unlockedIds);
  const visibleTools = useMemo(
    () =>
      unlocks.filter(
        (unlock) =>
          unlock.unlockType === "primitive-tool" &&
          unlock.visibleToPlayer &&
          unlockedIds.includes(unlock.id),
      ),
    [unlockedIds],
  );
  const theoremActions = useMemo(
    () =>
      unlocks.filter(
        (unlock) =>
          unlock.unlockType === "theorem-action" &&
          unlock.visibleToPlayer &&
          unlockedIds.includes(unlock.id),
      ),
    [unlockedIds],
  );
  const logicRules = useMemo(
    () =>
      unlocks.filter(
        (unlock) =>
          unlock.unlockType === "logic-rule" &&
          unlock.propositionId &&
          unlock.visibleToPlayer &&
          unlockedIds.includes(unlock.id),
      ),
    [unlockedIds],
  );

  return (
    <section className="tool-panel" aria-label="Construction tools">
      <div>
        <p className="panel-label">Primitive Tools</p>
        <div className="tool-grid">
          {visibleTools.map((unlock) => {
            const config = toolConfig[unlock.id];
            if (!config) {
              return null;
            }

            return (
              <button
                className={selectedTool === config.tool ? "tool-button active" : "tool-button"}
                key={unlock.id}
                type="button"
                onClick={() => setTool(config.tool)}
                title={unlock.description || config.fallbackHint}
              >
                <span aria-hidden="true">{config.mark}</span>
                {unlock.name}
              </button>
            );
          })}
        </div>
      </div>

      <p className="tool-instruction">{toolInstruction(selectedTool, selectedPointIds.length, Boolean(compassTransferSource))}</p>

      {theoremActions.length > 0 && (
        <div className="theorem-action-shelf">
          <p className="panel-label">Theorem-Actions</p>
          <div className="unlock-button-list">
            {theoremActions.map((unlock) => (
              <TheoremActionButton key={unlock.id} unlock={unlock} selectedTool={selectedTool} setTool={setTool} />
            ))}
          </div>
        </div>
      )}

      {logicRules.length > 0 && (
        <div className="reasoning-library">
          <p className="panel-label">Reasoning Library</p>
          <ul>
            {logicRules.map((unlock) => (
              <li key={unlock.id}>
                <strong>{unlock.name}</strong>
                <span>{unlock.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
