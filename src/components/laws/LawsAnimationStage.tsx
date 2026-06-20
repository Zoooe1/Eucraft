import type { LawsStep } from "../../data/lawsOfTheWorldSteps";
import { LawsCommonNotionAnimation } from "./LawsCommonNotionAnimation";
import { LawsDefinitionAnimation } from "./LawsDefinitionAnimation";
import { LawsPostulateAnimation } from "./LawsPostulateAnimation";

type LawsAnimationStageProps = {
  step: LawsStep;
  replayKey: number;
};

export function LawsAnimationStage({ step, replayKey }: LawsAnimationStageProps) {
  const key = `${step.id}-${replayKey}`;

  return (
    <div className="laws-animation-stage" key={key}>
      {step.section === "Definitions" && <LawsDefinitionAnimation animationKeyName={step.animationKey} />}
      {step.section === "Postulates" && <LawsPostulateAnimation animationKeyName={step.animationKey} />}
      {step.section === "Common Notions" && <LawsCommonNotionAnimation animationKeyName={step.animationKey} />}
    </div>
  );
}
