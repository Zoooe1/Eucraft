import { useEffect, useState } from "react";
import { LOGIC_REPLAY_STEP_DURATION_MS } from "../logicReplayConfig";
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
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (phase === "readingReplay" || phase === "logicReplay") {
      setIsPlaying(true);
    }
  }, [phase, currentPropositionId]);

  useEffect(() => {
    if ((phase !== "readingReplay" && phase !== "logicReplay") || !isPlaying) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (isLastStep) {
        finishReplay();
        return;
      }

      nextReplayStep();
    }, LOGIC_REPLAY_STEP_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [phase, currentReplayStep, isPlaying, isLastStep, nextReplayStep, finishReplay]);

  if (phase !== "readingReplay" && phase !== "logicReplay") {
    return null;
  }

  const step = proposition.replaySteps[currentReplayStep];
  const isFirstStep = currentReplayStep === 0;
  const replayFromStart = () => {
    startLogicReplay();
    setIsPlaying(true);
  };
  const goPrevious = () => {
    previousReplayStep();
  };
  const goNext = () => {
    if (isLastStep) {
      finishReplay();
      return;
    }

    nextReplayStep();
  };

  return (
    <section className="logic-panel">
      <div className="proof-meta">
        <span>Logic Replay</span>
        <span>{currentReplayStep + 1} / {proposition.replaySteps.length}</span>
      </div>
      <p className="proof-text">{step.text}</p>
      <div className="proof-progress" aria-hidden="true">
        {proposition.replaySteps.map((replayStep, index) => (
          <span className={index <= currentReplayStep ? "lit" : ""} key={replayStep.id} />
        ))}
      </div>
      <div className="logic-controls">
        <button className="quiet-button" type="button" onClick={() => setIsPlaying(true)} disabled={isPlaying}>
          Play
        </button>
        <button className="quiet-button" type="button" onClick={() => setIsPlaying(false)} disabled={!isPlaying}>
          Pause
        </button>
        <button className="quiet-button" type="button" onClick={goPrevious} disabled={isFirstStep}>
          Previous Step
        </button>
        <button className="quiet-button" type="button" onClick={goNext}>
          Next Step
        </button>
        <button className="quiet-button" type="button" onClick={replayFromStart}>
          Replay
        </button>
        <button className="primary-button" type="button" onClick={finishReplay}>
          Skip Replay / Finish
        </button>
      </div>
    </section>
  );
}
