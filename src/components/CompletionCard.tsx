import { book1Prop1 } from "../propositions/book1prop1";
import { useGeometryStore } from "../state/useGeometryStore";

export function CompletionCard() {
  const objectCount = useGeometryStore((state) => state.objects.length);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const resetProposition = useGeometryStore((state) => state.resetProposition);

  return (
    <section className="completion-card">
      <p className="panel-label">Proposition unlocked</p>
      <h2>
        {book1Prop1.book}, Proposition {book1Prop1.number}
      </h2>
      <h3>{book1Prop1.title}</h3>

      <svg className="completion-diagram" viewBox="0 0 220 150" aria-hidden="true">
        <circle cx="82" cy="94" r="58" />
        <circle cx="138" cy="94" r="58" />
        <polygon points="82,94 138,94 110,43" />
        <line x1="82" y1="94" x2="138" y2="94" />
        <line x1="82" y1="94" x2="110" y2="43" />
        <line x1="138" y1="94" x2="110" y2="43" />
      </svg>

      <p className="completion-line">Completed</p>
      <p>You have constructed your first Euclidean truth.</p>
      <div className="stat-row" aria-label="Completion stats">
        <span>{objectCount} objects</span>
        <span>Replay completed</span>
      </div>
      <div className="action-row">
        <button className="quiet-button" type="button" onClick={startLogicReplay}>
          Replay Logic Again
        </button>
        <button className="primary-button" type="button" onClick={resetProposition}>
          Reset Proposition
        </button>
      </div>
    </section>
  );
}
