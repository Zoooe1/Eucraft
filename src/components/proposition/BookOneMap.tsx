import { euclidPropositions } from "../../euclid/propositions";
import { useGeometryStore } from "../../state/useGeometryStore";
import { useUnlockStore } from "../../state/useUnlockStore";

export function BookOneMap() {
  const openProposition = useGeometryStore((state) => state.openProposition);
  const returnToTitle = useGeometryStore((state) => state.returnToTitle);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const completedPropositionIds = useUnlockStore((state) => state.completedPropositionIds);
  const nextAvailableId =
    euclidPropositions.find((proposition) => !completedPropositionIds.includes(proposition.id))?.id ??
    currentPropositionId;

  return (
    <section className="book-one-map" aria-label="Book I proposition map">
      <div className="book-map-sidebar" aria-hidden="true" />
      <div className="book-map-content">
        <header className="book-map-header">
          <button type="button" onClick={returnToTitle}>
            Home
          </button>
        </header>
        <div className="book-map-grid" aria-label="Book I propositions">
          {euclidPropositions.map((proposition) => {
            const completed = completedPropositionIds.includes(proposition.id);
            const current = proposition.id === nextAvailableId;
            const status = completed ? "Completed" : "Play";
            const className = [
              "book-map-proposition",
              "unlocked",
              completed ? "completed" : "",
              current ? "current" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                aria-label={`Proposition ${proposition.id}, ${proposition.title}, ${status.toLowerCase()}`}
                className={className}
                key={proposition.id}
                onClick={() => openProposition(proposition.id)}
                type="button"
              >
                <span className="proposition-label">Prop {proposition.id}</span>
                <small className="proposition-title">{proposition.title}</small>
                <em>{status}</em>
                {completed && <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
