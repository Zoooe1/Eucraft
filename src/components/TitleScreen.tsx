import { useGeometryStore } from "../state/useGeometryStore";
import { PropositionMap } from "./PropositionMap";

export function TitleScreen() {
  const startApp = useGeometryStore((state) => state.startApp);

  return (
    <section className="screen-stage title-screen">
      <div className="title-hero">
        <div className="title-copy">
          <p className="app-kicker">Interactive Euclid</p>
          <h1>Eucraft</h1>
          <p className="subtitle">The First Game of Euclid&apos;s Elements of Geometry</p>
          <p className="screen-copy">Construct Euclid's propositions and watch them become proof.</p>
          <button className="primary-button large-command" type="button" onClick={startApp}>
            Begin
          </button>
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
      </div>

      <div className="title-map-panel">
        <PropositionMap />
      </div>
    </section>
  );
}
