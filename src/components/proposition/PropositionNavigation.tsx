import { useMemo } from "react";
import { getUnlockedPropositionIds } from "../../euclid/dependencies";
import { euclidPropositions } from "../../euclid/propositions";
import { useGeometryStore } from "../../state/useGeometryStore";
import { useUnlockStore } from "../../state/useUnlockStore";

export function PropositionNavigation() {
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const openProposition = useGeometryStore((state) => state.openProposition);
  const startApp = useGeometryStore((state) => state.startApp);
  const returnToTitle = useGeometryStore((state) => state.returnToTitle);
  const completedPropositionIds = useUnlockStore((state) => state.completedPropositionIds);
  const unlockedPropositionIds = useMemo(
    () => getUnlockedPropositionIds(completedPropositionIds),
    [completedPropositionIds],
  );
  const currentIndex = euclidPropositions.findIndex((proposition) => proposition.id === currentPropositionId);
  const previousProposition = currentIndex > 0 ? euclidPropositions[currentIndex - 1] : undefined;
  const nextProposition = currentIndex >= 0 ? euclidPropositions[currentIndex + 1] : undefined;
  const canOpenPrevious = Boolean(previousProposition && unlockedPropositionIds.includes(previousProposition.id));
  const canOpenNext = Boolean(nextProposition && unlockedPropositionIds.includes(nextProposition.id));

  return (
    <nav className="proposition-nav" aria-label="Proposition navigation">
      <div>
        <button type="button" onClick={returnToTitle}>
          Home
        </button>
        <button type="button" onClick={startApp}>
          Catalog
        </button>
      </div>
      <div>
        <button
          type="button"
          disabled={!canOpenPrevious || !previousProposition}
          onClick={() => previousProposition && openProposition(previousProposition.id)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canOpenNext || !nextProposition}
          onClick={() => nextProposition && openProposition(nextProposition.id)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
