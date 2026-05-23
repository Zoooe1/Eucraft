import { book1Prop1 } from "../propositions/book1prop1";
import { useGeometryStore } from "../state/useGeometryStore";

export function PropositionIntro() {
  const startConstruction = useGeometryStore((state) => state.startConstruction);

  return (
    <section className="intro-panel">
      <p className="app-kicker">Eucraft</p>
      <p className="prop-label">
        {book1Prop1.book}, Proposition {book1Prop1.number}
      </p>
      <h1>{book1Prop1.title}</h1>
      <p className="challenge-goal">{book1Prop1.playerGoal}</p>
      <blockquote>{book1Prop1.originalStatement}</blockquote>
      <p>{book1Prop1.instruction}</p>
      <button className="primary-button large-command" type="button" onClick={startConstruction}>
        Start Construction
      </button>
    </section>
  );
}
