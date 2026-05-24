import { useMemo } from "react";
import { getUnlockedPropositionIds } from "../euclid/dependencies";
import { euclidPropositions } from "../euclid/propositions";
import { propositions as playablePropositions } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";
import { useUnlockStore } from "../state/useUnlockStore";

const playableIds = new Set(playablePropositions.map((proposition) => proposition.id));

export function PropositionMap() {
  const openProposition = useGeometryStore((state) => state.openProposition);
  const completedPropositionIds = useUnlockStore((state) => state.completedPropositionIds);
  const unlockedPropositionIds = useMemo(
    () => getUnlockedPropositionIds(completedPropositionIds),
    [completedPropositionIds],
  );

  return (
    <div className="proposition-shelf" aria-label="Proposition map">
      {euclidPropositions.map((proposition) => {
        const unlocked = unlockedPropositionIds.includes(proposition.id);
        const completed = completedPropositionIds.includes(proposition.id);
        const playable = playableIds.has(proposition.id);
        const disabled = !unlocked || !playable;

        return (
          <button
            className={disabled ? "proposition-card-button locked" : "proposition-card-button"}
            disabled={disabled}
            key={proposition.id}
            onClick={() => openProposition(proposition.id)}
            type="button"
          >
            <span>{proposition.id}</span>
            <strong>{proposition.title}</strong>
            <small>{completed ? "Completed" : unlocked && playable ? "Unlocked" : unlocked ? "Coming Soon" : "Locked"}</small>
          </button>
        );
      })}
    </div>
  );
}
