import { openingLawSections } from "../euclid/laws";
import { useGeometryStore } from "../state/useGeometryStore";

function LawsDiagram() {
  return (
    <svg className="laws-diagram" viewBox="0 0 320 240" aria-hidden="true">
      <circle className="diagram-circle red" cx="124" cy="136" r="78" />
      <circle className="diagram-circle blue" cx="196" cy="136" r="78" />
      <polygon className="diagram-triangle" points="124,136 196,136 160,74" />
      <line className="diagram-segment ink" x1="58" y1="198" x2="262" y2="42" />
      <line className="diagram-segment red" x1="124" y1="136" x2="160" y2="74" />
      <line className="diagram-segment blue" x1="196" y1="136" x2="160" y2="74" />
      <path className="diagram-angle" d="M74 186Q83 171 98 166" />
      <path className="diagram-angle gold" d="M215 78Q232 86 238 102" />
      <circle className="diagram-dot" cx="124" cy="136" r="5" />
      <circle className="diagram-dot" cx="196" cy="136" r="5" />
      <circle className="diagram-dot" cx="160" cy="74" r="5" />
    </svg>
  );
}

export function LawsScreen() {
  const openProposition = useGeometryStore((state) => state.openProposition);

  return (
    <section className="screen-stage laws-screen">
      <div className="screen-heading">
        <p className="app-kicker">Eucraft</p>
        <h1>Laws of the World</h1>
        <p className="screen-copy">Euclid's world begins with a small set of usable laws. They are the physics of the page.</p>
        <LawsDiagram />
      </div>

      <div className="law-sections">
        {openingLawSections.map((section) => (
          <article className="law-card" key={section.title}>
            <h2>{section.title}</h2>
            <ol>
              {section.items.map((item, index) => (
                <li key={item.id}>
                  <span className="law-number">{index + 1}.</span>
                  <span>
                    <strong>{item.title}:</strong> {item.text} <em>{item.source}</em>
                  </span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <button className="primary-button large-command" type="button" onClick={() => openProposition("I.1")}>
        Enter Proposition I.1
      </button>
    </section>
  );
}
