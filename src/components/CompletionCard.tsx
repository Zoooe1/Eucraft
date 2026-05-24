import type { Unlock } from "../geometry/types";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";
import { getUnlockById, useUnlockStore } from "../state/useUnlockStore";
import { UnlockCard } from "./UnlockCard";

export function CompletionCard() {
  const objectCount = useGeometryStore((state) => state.objects.length);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const resetProposition = useGeometryStore((state) => state.resetProposition);
  const openProposition = useGeometryStore((state) => state.openProposition);
  const lastUnlockedIds = useUnlockStore((state) => state.lastUnlockedIds);
  const proposition = getProposition(currentPropositionId);
  const nextProposition = proposition.nextPropositionId ? getProposition(proposition.nextPropositionId) : null;
  const visibleUnlocks = lastUnlockedIds
    .map((id) => getUnlockById(id))
    .filter((unlock): unlock is Unlock => Boolean(unlock?.visibleToPlayer));

  return (
    <section className="completion-card">
      <p className="panel-label">Proposition unlocked</p>
      <h2>
        {proposition.book}, Proposition {proposition.number}
      </h2>
      <h3>{proposition.title}</h3>

      <svg className="completion-diagram" viewBox="0 0 220 150" aria-hidden="true">
        <circle cx="82" cy="94" r="58" />
        <circle cx="138" cy="94" r="58" />
        <polygon points="82,94 138,94 110,43" />
        <line x1="82" y1="94" x2="138" y2="94" />
        <line x1="82" y1="94" x2="110" y2="43" />
        <line x1="138" y1="94" x2="110" y2="43" />
      </svg>

      <p className="completion-line">Completed</p>
      <p>The construction is now part of your playable Euclidean infrastructure.</p>
      {visibleUnlocks.map((unlock) => (
        <UnlockCard key={unlock.id} unlock={unlock} />
      ))}
      <div className="stat-row" aria-label="Completion stats">
        <span>{objectCount} objects</span>
        <span>Replay completed</span>
      </div>
      <div className="action-row">
        <button className="quiet-button" type="button" onClick={startLogicReplay}>
          Replay Logic Again
        </button>
        {nextProposition ? (
          <button className="primary-button" type="button" onClick={() => openProposition(nextProposition.id)}>
            Next: {nextProposition.id}
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={resetProposition}>
            Reset Proposition
          </button>
        )}
      </div>
    </section>
  );
}
