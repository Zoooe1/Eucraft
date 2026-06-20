import type { LawsAnimationKey } from "../../data/lawsOfTheWorldSteps";

type LawsPostulateAnimationProps = {
  animationKeyName: LawsAnimationKey;
};

function RightAngle({
  x,
  y,
  rotation = 0,
  size = 62,
  className = "",
}: {
  x: number;
  y: number;
  rotation?: number;
  size?: number;
  className?: string;
}) {
  const markerSize = 22;

  return (
    <g className={`laws-postulate-right-angle ${className}`} transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <line className="laws-right-angle-arm" x1="0" y1="0" x2={size} y2="0" />
      <line className="laws-right-angle-arm" x1="0" y1="0" x2="0" y2={-size} />
      <path className="laws-right-angle-marker" d={`M0 0 h${markerSize} v-${markerSize} h-${markerSize} Z`} />
    </g>
  );
}

export function LawsPostulateAnimation({ animationKeyName }: LawsPostulateAnimationProps) {
  if (animationKeyName === "postulate-line") {
    return (
      <svg className="laws-animation-svg laws-postulate-line" viewBox="0 0 900 420" aria-hidden="true">
        <circle className="laws-endpoint left" cx="300" cy="235" r="10" />
        <circle className="laws-endpoint right" cx="600" cy="170" r="10" />
        <line className="laws-postulate-drawn-line" x1="260" y1="244" x2="640" y2="161" />
      </svg>
    );
  }

  if (animationKeyName === "postulate-produce-line") {
    return (
      <svg className="laws-animation-svg laws-postulate-produce" viewBox="0 0 900 420" aria-hidden="true">
        <line className="laws-postulate-infinite-baseline" x1="110" y1="220" x2="790" y2="220" />
        <line className="laws-postulate-finite-highlight" x1="340" y1="220" x2="560" y2="220" />
      </svg>
    );
  }

  if (animationKeyName === "postulate-circle") {
    return (
      <svg className="laws-animation-svg laws-postulate-circle laws-postulate-circle-rotation" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-plane-backdrop laws-circle-plane-static" d="M220 92 H710 L650 360 H160 Z" />
        <g className="laws-postulate-circle-tracing-angle">
          <line className="laws-circle-angle-arm fixed" x1="450" y1="226" x2="570" y2="226" />
          <line className="laws-circle-angle-arm moving" x1="450" y1="226" x2="542" y2="150" />
        </g>
        <circle className="laws-postulate-circle-outline" cx="450" cy="226" r="120" />
        <line className="laws-postulate-radius" x1="450" y1="226" x2="570" y2="226" />
        <circle className="laws-circle-radius-end start" cx="450" cy="226" r="6.5" />
        <circle className="laws-circle-radius-end edge" cx="570" cy="226" r="6.5" />
        <circle className="laws-center-point laws-postulate-center-point" cx="450" cy="226" r="8" />
      </svg>
    );
  }

  if (animationKeyName === "postulate-right-angles") {
    return (
      <svg className="laws-animation-svg laws-postulate-right-angles" viewBox="0 0 900 420" aria-hidden="true">
        <g className="laws-right-angle-demo">
          <line className="laws-right-angle-demo-arm horizontal" x1="450" y1="252" x2="560" y2="252" />
          <line className="laws-right-angle-demo-arm vertical" x1="450" y1="252" x2="450" y2="142" />
          <path className="laws-right-angle-demo-marker" d="M450 252 h22 v-22 h-22 Z" />
        </g>
        <g className="laws-right-angle-duplicates">
          <RightAngle x={160} y={190} rotation={12} size={72} className="laws-right-angle-duplicate" />
          <RightAngle x={365} y={155} rotation={-55} size={46} className="laws-right-angle-duplicate" />
          <RightAngle x={660} y={160} rotation={100} size={64} className="laws-right-angle-duplicate" />
          <RightAngle x={785} y={125} rotation={-155} size={38} className="laws-right-angle-duplicate" />
          <RightAngle x={250} y={310} rotation={-22} size={118} className="laws-right-angle-duplicate" />
          <RightAngle x={465} y={280} rotation={35} size={92} className="laws-right-angle-duplicate" />
          <RightAngle x={680} y={270} rotation={-18} size={58} className="laws-right-angle-duplicate" />
          <RightAngle x={115} y={370} rotation={-88} size={40} className="laws-right-angle-duplicate" />
          <RightAngle x={390} y={350} rotation={145} size={58} className="laws-right-angle-duplicate" />
          <RightAngle x={815} y={330} rotation={-122} size={74} className="laws-right-angle-duplicate" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="laws-animation-svg laws-postulate-parallel" viewBox="0 0 900 420" aria-hidden="true">
      <line className="laws-cross-line top" x1="250" y1="145" x2="595" y2="191.68" />
      <line className="laws-cross-line bottom" x1="230" y1="286" x2="610" y2="234.38" />
      <line className="laws-transversal" x1="430" y1="95" x2="500" y2="330" />
      <path className="laws-internal-angle one" d="M494.7 178.1 A42 42 0 0 1 465.1 212.8" />
      <path className="laws-internal-angle two" d="M464.9 212.2 A42 42 0 0 1 518.5 246.8" />
      <line className="laws-produced-meeting one" x1="595" y1="191.68" x2="760" y2="214" />
      <line className="laws-produced-meeting two" x1="610" y1="234.38" x2="760" y2="214" />
      <circle className="laws-meeting-point" cx="760" cy="214" r="8" />
    </svg>
  );
}
