import { CompletionCard } from "./components/CompletionCard";
import { GeometryCanvas } from "./components/GeometryCanvas";
import { LawsScreen } from "./components/LawsScreen";
import { LogicReplay } from "./components/LogicReplay";
import { Marginalia } from "./components/Marginalia";
import { PropositionIntro } from "./components/PropositionIntro";
import { TitleScreen } from "./components/TitleScreen";
import { ToolShelf } from "./components/ToolShelf";
import { ValidationMessage } from "./components/ValidationMessage";
import { getProposition } from "./propositions";
import { useGeometryStore } from "./state/useGeometryStore";

export default function App() {
  const phase = useGeometryStore((state) => state.phase);
  const backgroundColor = useGeometryStore((state) => state.backgroundColor);
  const validation = useGeometryStore((state) => state.validation);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const proposition = getProposition(currentPropositionId);

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
                {proposition.book}, Proposition {proposition.number}
              </p>
              <h1>{proposition.title}</h1>
              <p className="challenge-goal">{proposition.playerGoal}</p>
              <blockquote>{proposition.originalStatement}</blockquote>
            </header>

            {phase === "construction" && <ToolShelf />}
            {phase === "construction" && <Marginalia />}
            <ValidationMessage validation={validation} />
            {(phase === "success" || phase === "logicReplay") && <LogicReplay />}
            {phase === "completed" && <CompletionCard />}
          </>
        )}
      </aside>

      <GeometryCanvas />
    </main>
  );
}
