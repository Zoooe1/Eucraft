import { useMemo } from "react";
import { getUnlockedPropositionIds } from "../euclid/dependencies";
import { euclidPropositions } from "../euclid/propositions";
import { propositions as playablePropositions } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";
import { getUnlockById, useUnlockStore } from "../state/useUnlockStore";

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
        const propositionUnlocks = proposition.unlocks.map((id) => getUnlockById(id)).filter(Boolean);
        const unlocksTool = propositionUnlocks.some((unlock) => unlock?.unlockType === "theorem-action" && unlock.visibleToPlayer);
        const unlocksLogic = propositionUnlocks.some(
          (unlock) =>
            unlock?.visibleToPlayer &&
            (unlock.unlockType === "logic-rule" ||
              unlock.unlockType === "parallel-rule" ||
              unlock.unlockType === "area-rule" ||
              unlock.unlockType === "constraint-rule"),
        );
        const mode = proposition.type === "construction" ? "Construction" : "Theorem Replay";
        const status = completed ? "Completed" : unlocked && playable ? "Not Started" : "Locked";
        const unlockBadge = unlocksTool ? "Unlocks Tool" : unlocksLogic ? "Unlocks Logic" : "";
        const modeBadge = unlockBadge ? `${mode} - ${unlockBadge}` : mode;

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
            <small>{status}</small>
            <small>{modeBadge}</small>
          </button>
        );
      })}
    </div>
  );
}
