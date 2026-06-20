import { useMemo } from "react";
import { getUnlockedPropositionIds } from "../euclid/dependencies";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";
import { useUnlockStore } from "../state/useUnlockStore";

export function ProofCompletePanel() {
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const openProposition = useGeometryStore((state) => state.openProposition);
  const startApp = useGeometryStore((state) => state.startApp);
  const returnToTitle = useGeometryStore((state) => state.returnToTitle);
  const completedPropositionIds = useUnlockStore((state) => state.completedPropositionIds);
  const unlockedPropositionIds = useMemo(
    () => getUnlockedPropositionIds(completedPropositionIds),
    [completedPropositionIds],
  );
  const proposition = getProposition(currentPropositionId);
  const nextPropositionId = proposition.nextPropositionId;
  const canOpenNext = Boolean(nextPropositionId && unlockedPropositionIds.includes(nextPropositionId));

  return (
    <section className="proof-complete-panel" aria-label="Proof complete">
      <h2>You have proved the proposition.</h2>
      <div className="choice-actions">
        <button className="primary-button" type="button" onClick={startLogicReplay}>
          Read Logic Replay
        </button>
        <button
          className="quiet-button"
          type="button"
          disabled={!canOpenNext || !nextPropositionId}
          onClick={() => nextPropositionId && openProposition(nextPropositionId)}
        >
          Next Proposition
        </button>
        <button className="quiet-button" type="button" onClick={startApp}>
          Back to Catalog
        </button>
        <button className="quiet-button" type="button" onClick={returnToTitle}>
          Home
        </button>
      </div>
    </section>
  );
}
