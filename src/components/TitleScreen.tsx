import { propositions } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

export function TitleScreen() {
  const startApp = useGeometryStore((state) => state.startApp);
  const openProposition = useGeometryStore((state) => state.openProposition);
  const unlockedPropositionIds = useGeometryStore((state) => state.unlockedPropositionIds);
  const completedPropositionIds = useGeometryStore((state) => state.completedPropositionIds);

  return (
    <section className="screen-stage title-screen">
      <div className="title-copy">
        <p className="app-kicker">Interactive Euclid</p>
        <h1>Eucraft</h1>
        <p className="subtitle">Build the Elements.</p>
        <p className="screen-copy">Construct Euclid's propositions and watch them become proof.</p>
        <button className="primary-button large-command" type="button" onClick={startApp}>
          Begin
        </button>

        <div className="proposition-shelf" aria-label="Unlocked propositions">
          {propositions.map((proposition) => {
            const unlocked = unlockedPropositionIds.includes(proposition.id);
            const completed = completedPropositionIds.includes(proposition.id);
            return (
              <button
                className={unlocked ? "proposition-card-button" : "proposition-card-button locked"}
                disabled={!unlocked}
                key={proposition.id}
                onClick={() => openProposition(proposition.id)}
                type="button"
              >
                <span>{proposition.id}</span>
                <strong>{proposition.title}</strong>
                <small>{completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}</small>
              </button>
            );
          })}
        </div>
      </div>

      <svg className="title-diagram" viewBox="0 0 560 500" role="img" aria-label="A Byrne-inspired geometric diagram">
        <rect width="560" height="500" fill="#f6f0df" />
        <circle className="diagram-circle red" cx="220" cy="280" r="150" />
        <circle className="diagram-circle blue" cx="340" cy="280" r="150" />
        <polygon className="diagram-triangle" points="220,280 340,280 280,150" />
        <line className="diagram-segment ink" x1="220" y1="280" x2="340" y2="280" />
        <line className="diagram-segment red" x1="220" y1="280" x2="280" y2="150" />
        <line className="diagram-segment blue" x1="340" y1="280" x2="280" y2="150" />
        <g className="diagram-point">
          <circle cx="220" cy="280" r="7" />
          <text x="198" y="312">A</text>
        </g>
        <g className="diagram-point">
          <circle cx="340" cy="280" r="7" />
          <text x="354" y="312">B</text>
        </g>
        <g className="diagram-point">
          <circle cx="280" cy="150" r="7" />
          <text x="292" y="142">C</text>
        </g>
      </svg>
    </section>
  );
}
