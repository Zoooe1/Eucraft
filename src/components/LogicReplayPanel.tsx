import { useEffect } from "react";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

export function LogicReplayPanel() {
  const phase = useGeometryStore((state) => state.phase);
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const currentReplayStep = useGeometryStore((state) => state.currentReplayStep);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);
  const nextReplayStep = useGeometryStore((state) => state.nextReplayStep);
  const previousReplayStep = useGeometryStore((state) => state.previousReplayStep);
  const finishReplay = useGeometryStore((state) => state.finishReplay);
  const proposition = getProposition(currentPropositionId);
  const isLastStep = currentReplayStep === proposition.replaySteps.length - 1;

  useEffect(() => {
    if (phase !== "logicReplay" || isLastStep) {
      return;
    }

    const timeout = window.setTimeout(() => {
      nextReplayStep();
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [phase, currentReplayStep, isLastStep, nextReplayStep]);

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

  const step = proposition.replaySteps[currentReplayStep];
  const isFirstStep = currentReplayStep === 0;

  return (
    <section className="logic-panel">
      <div className="proof-meta">
        <span>Logic Replay</span>
        <span>
          Auto-play · {currentReplayStep + 1} / {proposition.replaySteps.length}
        </span>
      </div>
      <p className="proof-text">{step.text}</p>
      <div className="proof-progress" aria-hidden="true">
        {proposition.replaySteps.map((replayStep, index) => (
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
