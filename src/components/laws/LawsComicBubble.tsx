import type { LawsStep } from "../../data/lawsOfTheWorldSteps";
import { LawsAnimationStage } from "./LawsAnimationStage";

type LawsComicBubbleProps = {
  step: LawsStep;
  replayKey: number;
};

function formatStepLabel(step: LawsStep) {
  if (step.groupedDefinitions?.length) {
    const first = step.groupedDefinitions[0];
    const last = step.groupedDefinitions[step.groupedDefinitions.length - 1] ?? first;
    return first === last ? `Def 1.${first}` : `Def 1.${first}-${last}`;
  }

  if (step.groupedPostulates?.length) {
    return `Postulate ${step.groupedPostulates[0]}`;
  }

  return `Common Notion ${step.groupedCommonNotions?.[0] ?? step.stepNumber}`;
}

export function LawsComicBubble({ step, replayKey }: LawsComicBubbleProps) {
  return (
    <section className="laws-comic-bubble" aria-label={`${step.section} ${step.stepNumber}`}>
      <svg className="laws-bubble-outline" viewBox="0 0 1280 720" aria-hidden="true" preserveAspectRatio="none">
        <path d="M52 56 H1228 Q1260 56 1260 88 V604 Q1260 636 1228 636 H232 Q186 637 150 665 L82 708 Q69 716 69 698 V664 Q69 636 42 636 H38 Q20 636 20 618 V88 Q20 56 52 56 Z" />
      </svg>
      <div className="laws-bubble-content">
        {step.sourceLines ? (
          <div className="laws-source-text laws-source-list">
            {step.sourceLines.map((line) => (
              <p className="laws-source-line" key={line.label}>
                <span>{line.label}</span>
                <span>{line.text}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="laws-source-text">
            <span>{formatStepLabel(step)}</span> {step.sourceText}
          </p>
        )}
        <LawsAnimationStage step={step} replayKey={replayKey} />
      </div>
      <p className="laws-euclid-signature">Euclid</p>
    </section>
  );
}
