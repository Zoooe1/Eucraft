import { useEffect } from "react";
import { CompletionCard } from "./components/CompletionCard";
import { CompletionAnimation } from "./components/CompletionAnimation";
import { ConstructionCompleteChoice } from "./components/ConstructionCompleteChoice";
import { GeometryCanvas } from "./components/GeometryCanvas";
import { LogicReplay } from "./components/LogicReplay";
import { BookOneMap } from "./components/proposition/BookOneMap";
import { PropositionNavigation } from "./components/proposition/PropositionNavigation";
import { PropositionPlayLayout } from "./components/proposition/PropositionPlayLayout";
import { PropositionIntro } from "./components/PropositionIntro";
import { ProofChallengePanel } from "./components/ProofChallengePanel";
import { ProofCompletePanel } from "./components/ProofCompletePanel";
import { TitleScreen } from "./components/TitleScreen";
import { ToolShelf } from "./components/ToolShelf";
import { ValidationMessage } from "./components/ValidationMessage";
import { validateProposition } from "./geometry/validation";
import { ConverseWithEuclidPage } from "./pages/ConverseWithEuclidPage";
import { LawsOfTheWorldPage } from "./pages/LawsOfTheWorldPage";
import { getProposition } from "./propositions";
import { useGeometryStore } from "./state/useGeometryStore";

export default function App() {
  const phase = useGeometryStore((state) => state.phase);
  const backgroundColor = useGeometryStore((state) => state.backgroundColor);
  const validation = useGeometryStore((state) => state.validation);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const objects = useGeometryStore((state) => state.objects);
  const historyLength = useGeometryStore((state) => state.history.length);
  const completedActionIds = useGeometryStore((state) => state.completedActionIds);
  const reasoningRelations = useGeometryStore((state) => state.reasoningRelations);
  const openProposition = useGeometryStore((state) => state.openProposition);
  const startApp = useGeometryStore((state) => state.startApp);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const autoCompleteConstruction = useGeometryStore((state) => state.autoCompleteConstruction);
  const proposition = getProposition(currentPropositionId);

  useEffect(() => {
    if (phase !== "construction" || (historyLength === 0 && completedActionIds.length === 0)) {
      return;
    }

    const result = validateProposition(currentPropositionId, objects, completedActionIds, reasoningRelations);
    if (result.success) {
      autoCompleteConstruction(result);
    }
  }, [phase, historyLength, completedActionIds, reasoningRelations, currentPropositionId, objects, autoCompleteConstruction]);

  const advanceFromCompletion = () => {
    if (proposition.nextPropositionId) {
      openProposition(proposition.nextPropositionId);
      return;
    }

    startApp();
  };

  if (phase === "title") {
    return (
      <main className="app-shell screen-shell" style={{ backgroundColor }}>
        <TitleScreen />
      </main>
    );
  }

  if (phase === "laws") {
    return <LawsOfTheWorldPage />;
  }

  if (phase === "converse") {
    return <ConverseWithEuclidPage />;
  }

  if (phase === "map") {
    return (
      <main className="app-shell screen-shell book-map-shell" style={{ backgroundColor }}>
        <BookOneMap />
      </main>
    );
  }

  return (
    <PropositionPlayLayout
      phase={phase}
      proposition={proposition}
      sidebar={
        <>
          <PropositionNavigation />
          {phase === "intro" ? (
            <PropositionIntro />
          ) : (
            <>
            <header className="proposition-header">
              <p className="prop-label proposition-label">Prop {proposition.id}</p>
              <h1 className="proposition-title">{proposition.title}</h1>
              <p className="sidebar-prompt">{proposition.originalStatement.replace(/^To\s+/i, "")}</p>
              <blockquote>{proposition.originalStatement}</blockquote>
            </header>

            {phase === "construction" && <ToolShelf />}
            {phase !== "playingProof" && <ValidationMessage validation={validation} />}
            {phase === "constructionComplete" && <ConstructionCompleteChoice />}
            {phase === "playingProof" && <ProofChallengePanel />}
            {phase === "proofComplete" && <ProofCompletePanel />}
            {phase === "readingReplay" && <LogicReplay />}
            {phase === "completionAnimation" && (
              <CompletionAnimation
                propositionId={proposition.id}
                propositionTitle={proposition.title}
                nextPropositionId={proposition.nextPropositionId}
                onAdvance={advanceFromCompletion}
                onReplayLogic={startLogicReplay}
              />
            )}
            {phase === "completed" && <CompletionCard />}
            </>
          )}
        </>
      }
    >
      <GeometryCanvas />
    </PropositionPlayLayout>
  );
}
