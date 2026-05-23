import { CompletionCard } from "./components/CompletionCard";
import { GeometryCanvas } from "./components/GeometryCanvas";
import { LawsScreen } from "./components/LawsScreen";
import { LogicReplayPanel } from "./components/LogicReplayPanel";
import { Marginalia } from "./components/Marginalia";
import { PropositionIntro } from "./components/PropositionIntro";
import { TitleScreen } from "./components/TitleScreen";
import { ToolPanel } from "./components/ToolPanel";
import { ValidationMessage } from "./components/ValidationMessage";
import { book1Prop1 } from "./propositions/book1prop1";
import { useGeometryStore } from "./state/useGeometryStore";

export default function App() {
  const phase = useGeometryStore((state) => state.phase);
  const backgroundColor = useGeometryStore((state) => state.backgroundColor);
  const validation = useGeometryStore((state) => state.validation);

  if (phase === "title") {
    return (
      <main className="app-shell screen-shell" style={{ backgroundColor }}>
        <TitleScreen />
      </main>
    );
  }

  if (phase === "laws") {
    return (
      <main className="app-shell screen-shell" style={{ backgroundColor }}>
        <LawsScreen />
      </main>
    );
  }

  return (
    <main className={`app-shell phase-${phase}`} style={{ backgroundColor }}>
      <aside className="left-pane">
        {phase === "intro" ? (
          <PropositionIntro />
        ) : (
          <>
            <header className="proposition-header">
              <p className="app-kicker">Eucraft</p>
              <p className="prop-label">
                {book1Prop1.book}, Proposition {book1Prop1.number}
              </p>
              <h1>{book1Prop1.title}</h1>
              <p className="challenge-goal">{book1Prop1.playerGoal}</p>
              <blockquote>{book1Prop1.originalStatement}</blockquote>
            </header>

            {phase === "construction" && <ToolPanel />}
            {phase === "construction" && <Marginalia />}
            <ValidationMessage validation={validation} />
            {(phase === "success" || phase === "logicReplay") && <LogicReplayPanel />}
            {phase === "completed" && <CompletionCard />}
          </>
        )}
      </aside>

      <GeometryCanvas />
    </main>
  );
}
