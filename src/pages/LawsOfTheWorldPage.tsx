import { useMemo, useState } from "react";
import { LawsComicBubble } from "../components/laws/LawsComicBubble";
import { LawsControls } from "../components/laws/LawsControls";
import { playLawsSound } from "../components/laws/SoundManager";
import { lawsOfTheWorldSteps } from "../data/lawsOfTheWorldSteps";
import { useGeometryStore } from "../state/useGeometryStore";

export function LawsOfTheWorldPage() {
  const returnToTitle = useGeometryStore((state) => state.returnToTitle);
  const startApp = useGeometryStore((state) => state.startApp);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const currentStep = lawsOfTheWorldSteps[currentStepIndex];
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < lawsOfTheWorldSteps.length - 1;

  const progressLabel = useMemo(
    () => `${currentStepIndex + 1} / ${lawsOfTheWorldSteps.length}`,
    [currentStepIndex],
  );

  const moveToStep = (nextIndex: number, cueName: "page-next" | "page-back") => {
    playLawsSound(cueName);
    setCurrentStepIndex(nextIndex);
    setReplayKey((key) => key + 1);
  };

  const replay = () => {
    playLawsSound(currentStep.soundCue);
    setReplayKey((key) => key + 1);
  };

  return (
    <main className="laws-world-page" aria-label="Laws of the World">
      <div className="laws-world-stage">
        <p className="laws-world-section">{currentStep.section}</p>
        <LawsComicBubble step={currentStep} replayKey={replayKey} />
      </div>

      <aside className="laws-world-rail" aria-label={`Step ${progressLabel}`}>
        <div className="laws-world-ribbon" aria-hidden="true" />
        <p className="laws-world-progress">{progressLabel}</p>
        <LawsControls
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          onBack={() => canGoBack && moveToStep(currentStepIndex - 1, "page-back")}
          onReplay={replay}
          onNext={() => canGoNext && moveToStep(currentStepIndex + 1, "page-next")}
          onReturnHome={returnToTitle}
          onBegin={startApp}
        />
      </aside>
    </main>
  );
}
