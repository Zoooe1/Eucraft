import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

export function PropositionIntro() {
  const startConstruction = useGeometryStore((state) => state.startConstruction);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const proposition = getProposition(currentPropositionId);

  return (
    <section className="intro-panel">
      <p className="prop-label proposition-label">Prop {proposition.id}</p>
      <h1 className="proposition-title">{proposition.title}</h1>
      <p className="sidebar-prompt">{proposition.originalStatement.replace(/^To\s+/i, "")}</p>
      <blockquote>{proposition.originalStatement}</blockquote>
      <button className="primary-button large-command" type="button" onClick={startConstruction}>
        Start Construction
      </button>
    </section>
  );
}
