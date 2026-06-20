import type { LawsAnimationKey } from "../../data/lawsOfTheWorldSteps";

type LawsCommonNotionAnimationProps = {
  animationKeyName: LawsAnimationKey;
};

function Segment({ x, y, width, className = "" }: { x: number; y: number; width: number; className?: string }) {
  return <line className={`laws-notion-segment ${className}`} x1={x} y1={y} x2={x + width} y2={y} />;
}

export function LawsCommonNotionAnimation({ animationKeyName }: LawsCommonNotionAnimationProps) {
  if (animationKeyName === "common-equal-same") {
    return (
      <svg className="laws-animation-svg laws-common-equal-same" viewBox="0 0 900 420" aria-hidden="true">
        <text className="laws-common-write-text one" x="450" y="178" textAnchor="middle">
          AB = AB
        </text>
        <text className="laws-common-write-text two" x="450" y="268" textAnchor="middle">
          BA = BA
        </text>
      </svg>
    );
  }

  if (animationKeyName === "common-add-equals") {
    return (
      <svg className="laws-animation-svg laws-common-add" viewBox="0 0 900 420" aria-hidden="true">
        <Segment x={260} y={170} width={180} className="red" />
        <Segment x={260} y={260} width={180} className="red" />
        <Segment x={440} y={170} width={95} className="gold laws-added-piece" />
        <Segment x={440} y={260} width={95} className="gold laws-added-piece" />
      </svg>
    );
  }

  if (animationKeyName === "common-subtract-equals") {
    return (
      <svg className="laws-animation-svg laws-common-subtract" viewBox="0 0 900 420" aria-hidden="true">
        <Segment x={250} y={170} width={210} className="red laws-subtract-keep" />
        <Segment x={250} y={260} width={210} className="red laws-subtract-keep" />
        <Segment x={460} y={170} width={120} className="laws-subtract-cut" />
        <Segment x={460} y={260} width={120} className="laws-subtract-cut" />
        <line className="laws-subtract-cut-guide" x1="460" y1="132" x2="460" y2="298" />
        <Segment x={250} y={170} width={210} className="blue laws-subtract-blue" />
        <Segment x={250} y={260} width={210} className="blue laws-subtract-blue" />
      </svg>
    );
  }

  if (animationKeyName === "common-coincide") {
    return (
      <svg className="laws-animation-svg laws-common-coincide" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-coincide-triangle base" d="M330 285 L445 105 L565 285 Z" />
        <path className="laws-coincide-triangle moving" d="M80 310 L195 130 L315 310 Z" />
      </svg>
    );
  }

  return (
    <svg className="laws-animation-svg laws-common-whole-part" viewBox="0 0 900 420" aria-hidden="true">
      <path className="laws-paper-whole" d="M230 125 H475 V300 H230 Z" />
      <path className="laws-paper-corner-cut-line" d="M405 125 L475 195" />
      <path className="laws-paper-cut-body" d="M230 125 H405 L475 195 V300 H230 Z" />
      <path className="laws-paper-part laws-paper-corner-part" d="M405 125 H475 V195 Z" />
      <path className="laws-greater-mark laws-whole-greater-mark" d="M545 224 L610 246 L545 268" />
    </svg>
  );
}
