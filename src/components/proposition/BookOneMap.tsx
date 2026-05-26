import { useMemo } from "react";
import { getUnlockedPropositionIds } from "../../euclid/dependencies";
import { euclidPropositions } from "../../euclid/propositions";
import { useGeometryStore } from "../../state/useGeometryStore";
import { useUnlockStore } from "../../state/useUnlockStore";
import { FaintGeometrySketches } from "../landing/FaintGeometrySketches";

export function BookOneMap() {
  const openProposition = useGeometryStore((state) => state.openProposition);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const completedPropositionIds = useUnlockStore((state) => state.completedPropositionIds);
  const unlockedPropositionIds = useMemo(
    () => getUnlockedPropositionIds(completedPropositionIds),
    [completedPropositionIds],
  );
  const nextAvailableId =
    euclidPropositions.find(
      (proposition) =>
        unlockedPropositionIds.includes(proposition.id) && !completedPropositionIds.includes(proposition.id),
    )?.id ?? currentPropositionId;

  return (
    <section className="book-one-map" aria-label="Book I proposition map">
      <div className="book-map-sidebar" aria-hidden="true" />
      <FaintGeometrySketches />
      <div className="book-map-grid" aria-label="Book I propositions">
        {euclidPropositions.map((proposition) => {
          const unlocked = unlockedPropositionIds.includes(proposition.id);
          const completed = completedPropositionIds.includes(proposition.id);
          const current = proposition.id === nextAvailableId;
          const className = [
            "book-map-proposition",
            unlocked ? "unlocked" : "locked",
            completed ? "completed" : "",
            current ? "current" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              aria-label={`Proposition ${proposition.id}, ${proposition.title}${unlocked ? "" : ", locked"}`}
              className={className}
              disabled={!unlocked}
              key={proposition.id}
              onClick={() => openProposition(proposition.id)}
              type="button"
            >
              <span>Prop {proposition.id}</span>
              {completed && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
