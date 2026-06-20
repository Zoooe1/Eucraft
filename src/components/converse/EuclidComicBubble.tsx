import type { EuclidDialogueStep } from "../../data/euclidDialogueSteps";
import { ConverseAnimationStage } from "./ConverseAnimationStage";

type EuclidComicBubbleProps = {
  step: EuclidDialogueStep;
  replayKey: number;
  isMuted: boolean;
  interactionCompleted: boolean;
  onInteractionComplete: () => void;
};

export function EuclidComicBubble({
  step,
  replayKey,
  isMuted,
  interactionCompleted,
  onInteractionComplete,
}: EuclidComicBubbleProps) {
  return (
    <section className="euclid-comic-bubble" aria-label={`Euclid definition ${step.definitionNumber}`}>
      <svg className="cloud-bubble-outline" viewBox="0 0 1000 640" aria-hidden="true" preserveAspectRatio="none">
        <path d="M142 356 C63 348 38 270 80 224 C49 164 94 105 165 117 C188 49 270 30 332 67 C380 16 472 29 500 91 C562 37 658 51 690 123 C766 103 832 155 824 230 C909 250 924 343 857 389 C876 468 802 529 726 502 C679 572 573 570 528 501 C474 562 371 548 344 471 C276 507 181 459 183 384 C169 370 156 362 142 356 Z" />
        <path className="cloud-tail" d="M226 469 C188 524 142 558 79 577 C148 579 219 550 267 496 Z" />
      </svg>

      <div className="euclid-bubble-content">
        <div className="euclid-speaker-row">
          <span className="euclid-speaker">Euclid</span>
          <span className="euclid-step-count">
            {step.section} {step.definitionNumber}
          </span>
        </div>
        <p className="euclid-line">“{step.euclidLine}”</p>

        <ConverseAnimationStage
          step={step}
          replayKey={replayKey}
          isMuted={isMuted}
          completed={interactionCompleted}
          onInteractionComplete={onInteractionComplete}
        />

        <div className="definition-source">
          <strong>Definition {step.definitionNumber}:</strong>
          <span>{step.sourceText}</span>
        </div>

        {step.interaction && step.interaction.type !== "none" && (
          <p className={interactionCompleted ? "interaction-prompt completed" : "interaction-prompt"}>
            {interactionCompleted ? "Seen." : step.interaction.instruction}
          </p>
        )}
      </div>
    </section>
  );
}
