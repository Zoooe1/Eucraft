import type { EuclidDialogueStep } from "../../data/euclidDialogueSteps";
import { DefinitionAnimationRenderer } from "./DefinitionAnimationRenderer";

type ConverseAnimationStageProps = {
  step: EuclidDialogueStep;
  replayKey: number;
  isMuted: boolean;
  completed: boolean;
  onInteractionComplete: () => void;
};

export function ConverseAnimationStage({
  step,
  replayKey,
  isMuted,
  completed,
  onInteractionComplete,
}: ConverseAnimationStageProps) {
  return (
    <div className="converse-animation-stage">
      <DefinitionAnimationRenderer
        step={step}
        replayKey={replayKey}
        isMuted={isMuted}
        completed={completed}
        onInteractionComplete={onInteractionComplete}
      />
    </div>
  );
}
