import { book1Prop1 } from "../propositions/book1prop1";
import { useGeometryStore } from "../state/useGeometryStore";

export function LogicReplayPanel() {
  const phase = useGeometryStore((state) => state.phase);
  const currentReplayStep = useGeometryStore((state) => state.currentReplayStep);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const nextReplayStep = useGeometryStore((state) => state.nextReplayStep);
  const previousReplayStep = useGeometryStore((state) => state.previousReplayStep);
  const finishReplay = useGeometryStore((state) => state.finishReplay);

  if (phase === "success") {
    return (
      <section className="logic-panel logic-ready">
        <p className="panel-label">Logic Replay unlocked</p>
        <h2>You built it. Now watch why it must be true.</h2>
        <p>The proof will use the actual objects in your construction.</p>
        <button className="primary-button" type="button" onClick={startLogicReplay}>
          Reveal Logic
        </button>
      </section>
    );
  }

  if (phase !== "logicReplay") {
    return null;
  }

  const step = book1Prop1.replaySteps[currentReplayStep];
  const isFirstStep = currentReplayStep === 0;
  const isLastStep = currentReplayStep === book1Prop1.replaySteps.length - 1;

  return (
    <section className="logic-panel">
      <div className="proof-meta">
        <span>Logic Replay</span>
        <span>
          {currentReplayStep + 1} / {book1Prop1.replaySteps.length}
        </span>
      </div>
      <p className="proof-text">{step.text}</p>
      <div className="proof-progress" aria-hidden="true">
        {book1Prop1.replaySteps.map((replayStep, index) => (
          <span className={index <= currentReplayStep ? "lit" : ""} key={replayStep.id} />
        ))}
      </div>
      <div className="action-row">
        <button className="quiet-button" type="button" onClick={previousReplayStep} disabled={isFirstStep}>
          Back
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={isLastStep ? finishReplay : nextReplayStep}
        >
          {isLastStep ? "Complete Proposition" : "Next"}
        </button>
      </div>
    </section>
  );
}
