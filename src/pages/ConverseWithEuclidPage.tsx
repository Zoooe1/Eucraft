import { useMemo, useState } from "react";
import { ConverseControls } from "../components/converse/ConverseControls";
import { EuclidComicBubble } from "../components/converse/EuclidComicBubble";
import { playSound, type SoundCue } from "../components/converse/SoundManager";
import { euclidDialogueSteps } from "../data/euclidDialogueSteps";
import { useGeometryStore } from "../state/useGeometryStore";

export function ConverseWithEuclidPage() {
  const startApp = useGeometryStore((state) => state.startApp);
  const returnToTitle = useGeometryStore((state) => state.returnToTitle);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animationReplayKey, setAnimationReplayKey] = useState(0);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(() => new Set());
  const [isMuted, setIsMuted] = useState(true);

  const currentStep = euclidDialogueSteps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === euclidDialogueSteps.length - 1;
  const interactionCompleted = completedInteractions.has(currentStep.id);

  const progressLabel = useMemo(
    () => `${currentStepIndex + 1} / ${euclidDialogueSteps.length}`,
    [currentStepIndex],
  );

  const sound = (cueName: SoundCue) => {
    if (!isMuted) {
      playSound(cueName);
    }
  };

  const moveToStep = (nextIndex: number, cueName: SoundCue) => {
    sound(cueName);
    setCurrentStepIndex(nextIndex);
    setAnimationReplayKey((key) => key + 1);
  };

  const nextStep = () => {
    if (!isLast) {
      moveToStep(currentStepIndex + 1, "page-next");
    }
  };

  const previousStep = () => {
    if (!isFirst) {
      moveToStep(currentStepIndex - 1, "page-back");
    }
  };

  const replayStep = () => {
    if (!isMuted && currentStep.soundCue) {
      playSound(currentStep.soundCue as SoundCue);
    }
    setAnimationReplayKey((key) => key + 1);
  };

  const completeInteraction = () => {
    setCompletedInteractions((existing) => {
      if (existing.has(currentStep.id)) {
        return existing;
      }

      const next = new Set(existing);
      next.add(currentStep.id);
      return next;
    });
  };

  return (
    <main className="app-shell screen-shell converse-page" aria-label="Converse with Euclid">
      {/* Future: connect this page to an API-powered “Converse with Euclid philosophically” mode.
          Current version is scripted dialogue + animation only. */}
      <header className="converse-header">
        <button className="converse-home-link" type="button" onClick={returnToTitle}>
          Home
        </button>
        <div>
          <p>{currentStep.section}</p>
          <h1>Converse with Euclid</h1>
        </div>
        <button className="converse-sound-toggle" type="button" onClick={() => setIsMuted((muted) => !muted)}>
          {isMuted ? "Sound Off" : "Sound On"}
        </button>
      </header>

      <div className="converse-progress" aria-label={`Dialogue step ${progressLabel}`}>
        <span>{progressLabel}</span>
        <div>
          {euclidDialogueSteps.map((step, index) => (
            <i className={index <= currentStepIndex ? "lit" : ""} key={step.id} />
          ))}
        </div>
      </div>

      <EuclidComicBubble
        step={currentStep}
        replayKey={animationReplayKey}
        isMuted={isMuted}
        interactionCompleted={interactionCompleted}
        onInteractionComplete={completeInteraction}
      />

      <ConverseControls
        canGoBack={!isFirst}
        canGoNext={!isLast}
        onBack={previousStep}
        onReplay={replayStep}
        onNext={nextStep}
        onReturnHome={returnToTitle}
        onBegin={startApp}
      />
    </main>
  );
}
