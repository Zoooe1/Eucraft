import type { CSSProperties } from "react";
import type { LawsAnimationKey } from "../../data/lawsOfTheWorldSteps";

type LawsDefinitionAnimationProps = {
  animationKeyName: LawsAnimationKey;
};

function RightAngleMarker({ x, y }: { x: number; y: number }) {
  return <path className="laws-angle-square" d={`M${x} ${y} h22 v-22 h-22 Z`} />;
}

export function LawsDefinitionAnimation({ animationKeyName }: LawsDefinitionAnimationProps) {
  if (animationKeyName === "definition-point") {
    const pointCutStages = [
      "M250 118 H650 V318 H250 Z",
      "M330 118 H650 V318 H330 Z",
      "M330 118 H650 V280 H330 Z",
      "M330 118 H570 V280 H330 Z",
      "M330 170 H570 V280 H330 Z",
      "M400 170 H570 V280 H400 Z",
      "M400 170 H570 V250 H400 Z",
      "M400 170 H510 V250 H400 Z",
      "M400 200 H510 V250 H400 Z",
      "M435 200 H510 V250 H435 Z",
      "M435 200 H510 V232 H435 Z",
      "M435 200 H468 V232 H435 Z",
      "M435 214 H468 V232 H435 Z",
      "M447 214 H468 V232 H447 Z",
      "M447 214 H468 V224 H447 Z",
      "M447 214 H454 V224 H447 Z",
      "M447 219 H454 V224 H447 Z",
    ];

    const pointCutActions = [
      { piece: "M250 118 H330 V318 H250 Z", guide: "M330 118 V318", dots: [[330, 118], [330, 318]], moveX: -52, moveY: 0 },
      { piece: "M330 280 H650 V318 H330 Z", guide: "M330 280 H650", dots: [[330, 280], [650, 280]], moveX: 0, moveY: 44 },
      { piece: "M570 118 H650 V280 H570 Z", guide: "M570 118 V280", dots: [[570, 118], [570, 280]], moveX: 52, moveY: 0 },
      { piece: "M330 118 H570 V170 H330 Z", guide: "M330 170 H570", dots: [[330, 170], [570, 170]], moveX: 0, moveY: -44 },
      { piece: "M330 170 H400 V280 H330 Z", guide: "M400 170 V280", dots: [[400, 170], [400, 280]], moveX: -42, moveY: 0 },
      { piece: "M400 250 H570 V280 H400 Z", guide: "M400 250 H570", dots: [[400, 250], [570, 250]], moveX: 0, moveY: 36 },
      { piece: "M510 170 H570 V250 H510 Z", guide: "M510 170 V250", dots: [[510, 170], [510, 250]], moveX: 40, moveY: 0 },
      { piece: "M400 170 H510 V200 H400 Z", guide: "M400 200 H510", dots: [[400, 200], [510, 200]], moveX: 0, moveY: -32 },
      { piece: "M400 200 H435 V250 H400 Z", guide: "M435 200 V250", dots: [[435, 200], [435, 250]], moveX: -30, moveY: 0 },
      { piece: "M435 232 H510 V250 H435 Z", guide: "M435 232 H510", dots: [[435, 232], [510, 232]], moveX: 0, moveY: 26 },
      { piece: "M468 200 H510 V232 H468 Z", guide: "M468 200 V232", dots: [[468, 200], [468, 232]], moveX: 28, moveY: 0 },
      { piece: "M435 200 H468 V214 H435 Z", guide: "M435 214 H468", dots: [[435, 214], [468, 214]], moveX: 0, moveY: -22 },
      { piece: "M435 214 H447 V232 H435 Z", guide: "M447 214 V232", dots: [[447, 214], [447, 232]], moveX: -20, moveY: 0 },
      { piece: "M447 224 H468 V232 H447 Z", guide: "M447 224 H468", dots: [[447, 224], [468, 224]], moveX: 0, moveY: 18 },
      { piece: "M454 214 H468 V224 H454 Z", guide: "M454 214 V224", dots: [[454, 214], [454, 224]], moveX: 18, moveY: 0 },
      { piece: "M447 214 H454 V219 H447 Z", guide: "M447 219 H454", dots: [[447, 219], [454, 219]], moveX: 0, moveY: -16 },
    ];

    return (
      <svg className="laws-animation-svg laws-definition-point" viewBox="0 0 900 420" aria-hidden="true">
        {pointCutStages.map((d, index) => (
          <path
            className="laws-point-cut-shape"
            d={d}
            key={`point-stage-${index}`}
            style={
              {
                "--stage-delay": `${index * 520}ms`,
                "--stage-duration": index === pointCutStages.length - 1 ? "1200ms" : "780ms",
              } as CSSProperties
            }
          />
        ))}
        {pointCutActions.map((cut, index) => (
          <path
            className="laws-point-cut-piece"
            d={cut.piece}
            key={`point-piece-${index}`}
            style={
              {
                "--cut-delay": `${index * 520 + 360}ms`,
                "--piece-x": `${cut.moveX}px`,
                "--piece-y": `${cut.moveY}px`,
              } as CSSProperties
            }
          />
        ))}
        {pointCutActions.map((cut, index) => (
          <path
            className="laws-point-cut-guide"
            d={cut.guide}
            key={`point-guide-${index}`}
            style={{ "--cut-delay": `${index * 520 + 360}ms` } as CSSProperties}
          />
        ))}
        {pointCutActions.map((cut, index) => (
          <g className="laws-point-cut-boundary-dots" key={`point-dots-${index}`} style={{ "--cut-delay": `${index * 520 + 360}ms` } as CSSProperties}>
            {cut.dots.map(([cx, cy], dotIndex) => (
              <circle cx={cx} cy={cy} key={`point-dot-${index}-${dotIndex}`} r={4.5} />
            ))}
          </g>
        ))}
        <circle className="laws-center-point laws-final-cut-point" cx="450" cy="220" r="8" />
      </svg>
    );
  }

  if (animationKeyName === "definition-line") {
    const lineSeed = { x: 450, y: 220 };
    const coarseDots = [210, 330, 570, 690];
    const gapDots = [270, 390, 510, 630];
    const fineDots = [240, 300, 360, 420, 480, 540, 600, 660];
    const denseDots = Array.from({ length: 33 }, (_, index) => 210 + index * 15).filter((x) => x !== lineSeed.x);
    const dotDelay = (x: number) => `${Math.round(Math.abs(x - lineSeed.x) * 0.9)}ms`;

    return (
      <svg className="laws-animation-svg laws-definition-line" viewBox="0 0 900 420" aria-hidden="true">
        <line className="laws-line-continuous-stroke" x1="180" y1={lineSeed.y} x2="720" y2={lineSeed.y} />
        <circle className="laws-line-seed-point" cx={lineSeed.x} cy={lineSeed.y} r="8" />
        <g className="laws-line-dot-layer coarse">
          {coarseDots.map((x) => (
            <circle cx={x} cy={lineSeed.y} key={`coarse-${x}`} r="7.2" style={{ "--dot-delay": dotDelay(x) } as CSSProperties} />
          ))}
        </g>
        <g className="laws-line-dot-layer gap">
          {gapDots.map((x) => (
            <circle cx={x} cy={lineSeed.y} key={`gap-${x}`} r="6.2" style={{ "--dot-delay": dotDelay(x) } as CSSProperties} />
          ))}
        </g>
        <g className="laws-line-dot-layer fine">
          {fineDots.map((x) => (
            <circle cx={x} cy={lineSeed.y} key={`fine-${x}`} r="4.8" style={{ "--dot-delay": dotDelay(x) } as CSSProperties} />
          ))}
        </g>
        <g className="laws-line-dot-layer dense">
          {denseDots.map((x) => (
            <circle cx={x} cy={lineSeed.y} key={`dense-${x}`} r="3.3" style={{ "--dot-delay": dotDelay(x) } as CSSProperties} />
          ))}
        </g>
      </svg>
    );
  }

  if (animationKeyName === "definition-surface") {
    return (
      <svg className="laws-animation-svg laws-definition-surface" viewBox="0 0 900 420" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <line
            className="laws-surface-ghost-line"
            key={index}
            x1="220"
            y1={128 + index * 13}
            x2="680"
            y2={128 + index * 13}
            style={{ "--line-delay": `${index * 70}ms` } as CSSProperties}
          />
        ))}
        <rect className="laws-surface-fill" x="220" y="128" width="460" height="169" />
        <rect className="laws-surface-boundary" x="220" y="128" width="460" height="169" />
      </svg>
    );
  }

  if (animationKeyName === "definition-plane-surface") {
    return (
      <svg className="laws-animation-svg laws-definition-plane" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-plane-fill" d="M230 120 H690 L640 310 H180 Z" />
        <line className="laws-plane-line one" x1="225" y1="162" x2="675" y2="162" />
        <line className="laws-plane-line two" x1="210" y1="218" x2="660" y2="218" />
        <line className="laws-plane-line three" x1="310" y1="120" x2="260" y2="310" />
        <line className="laws-plane-line four" x1="560" y1="120" x2="510" y2="310" />
      </svg>
    );
  }

  if (animationKeyName === "definition-plane-angle") {
    return (
      <svg className="laws-animation-svg laws-definition-angle" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-plane-backdrop laws-plane-angle-plane" d="M240 126 H676 L626 306 H190 Z" />
        <line className="laws-angle-ray fixed laws-angle-horizontal" x1="450" y1="232" x2="650" y2="232" />
        <line className="laws-angle-ray moving laws-angle-side" x1="450" y1="232" x2="606" y2="130" />
        <path className="laws-angle-wash laws-angle-sector-fill" d="M450 232 H520 A70 70 0 0 0 509 194 Z" />
        <path className="laws-angle-arc laws-angle-sector-line" d="M520 232 A70 70 0 0 0 509 194" />
        <circle className="laws-angle-vertex laws-angle-vertex-staged" cx="450" cy="232" r="8" />
      </svg>
    );
  }

  if (animationKeyName === "definition-right-angle") {
    return (
      <svg className="laws-animation-svg laws-definition-right-angle" viewBox="0 0 900 420" aria-hidden="true">
        <line className="laws-angle-ray fixed" x1="300" y1="265" x2="610" y2="265" />
        <line className="laws-angle-ray standing" x1="450" y1="265" x2="450" y2="100" />
        <path className="laws-equal-angle left" d="M450 265 L390 265 A60 60 0 0 1 450 205 Z" />
        <path className="laws-equal-angle right" d="M450 265 L510 265 A60 60 0 0 0 450 205 Z" />
        <RightAngleMarker x={450} y={265} />
      </svg>
    );
  }

  if (animationKeyName === "definition-obtuse-acute") {
    return (
      <svg className="laws-animation-svg laws-definition-obtuse-acute" viewBox="0 0 900 420" aria-hidden="true">
        <g className="laws-angle-transition-source">
          <line className="laws-angle-transition-left" x1="300" y1="265" x2="450" y2="265" />
          <line className="laws-angle-transition-base" x1="450" y1="265" x2="610" y2="265" />
          <line className="laws-angle-transition-standing" x1="450" y1="265" x2="450" y2="100" />
          <path className="laws-angle-transition-square" d="M450 265 h22 v-22 h-22 Z" />
          <path className="laws-angle-transition-cut" d="M450 288 L450 82" />
        </g>
        <g className="laws-angle-comparison-row obtuse">
          <line className="laws-angle-ray fixed" x1="360" y1="112" x2="444" y2="112" />
          <line className="laws-angle-ray laws-obtuse-moving-side" x1="360" y1="112" x2="360" y2="28" />
          <path className="laws-angle-arc laws-obtuse-arc" d="M428 112 A68 68 0 0 0 318 62" />
          <path className="laws-angle-square laws-transforming-angle-square" d="M360 112 h22 v-22 h-22 Z" />
          <text className="laws-angle-label" x="492" y="122">
            Obtuse
          </text>
        </g>
        <g className="laws-angle-comparison-row right">
          <line className="laws-angle-ray fixed" x1="360" y1="226" x2="444" y2="226" />
          <line className="laws-angle-ray standing" x1="360" y1="226" x2="360" y2="142" />
          <RightAngleMarker x={360} y={226} />
          <text className="laws-angle-label" x="492" y="236">
            Right
          </text>
        </g>
        <g className="laws-angle-comparison-row acute">
          <line className="laws-angle-ray fixed" x1="360" y1="340" x2="444" y2="340" />
          <line className="laws-angle-ray laws-acute-moving-side" x1="360" y1="340" x2="360" y2="256" />
          <path className="laws-angle-arc laws-acute-arc" d="M414 340 A54 54 0 0 0 401 304" />
          <path className="laws-angle-square laws-transforming-angle-square" d="M360 340 h22 v-22 h-22 Z" />
          <text className="laws-angle-label" x="492" y="350">
            Acute
          </text>
        </g>
      </svg>
    );
  }

  if (animationKeyName === "definition-boundary-figure") {
    return (
      <svg className="laws-animation-svg laws-definition-boundary" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-figure-fill" d="M310 160 C370 105 505 112 580 172 C635 218 590 310 490 318 C375 326 275 260 310 160 Z" />
        <path className="laws-figure-boundary" d="M310 160 C370 105 505 112 580 172 C635 218 590 310 490 318 C375 326 275 260 310 160 Z" />
      </svg>
    );
  }

  if (animationKeyName === "definition-circle") {
    return (
      <svg className="laws-animation-svg laws-definition-circle laws-circle-rotation-definition" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-plane-backdrop laws-circle-plane-static" d="M160 66 H760 L704 356 H104 Z" />
        <g className="laws-circle-tracing-angle">
          <line className="laws-circle-angle-arm fixed" x1="450" y1="202" x2="570" y2="202" />
          <line className="laws-circle-angle-arm moving" x1="450" y1="202" x2="544" y2="128" />
        </g>
        <circle className="laws-circle-traced-outline" cx="450" cy="202" r="120" />
        <line className="laws-circle-rotation-radius" x1="450" y1="202" x2="570" y2="202" />
        <circle className="laws-circle-center-ring" cx="450" cy="202" r="25" />
        <circle className="laws-center-point laws-circle-center-dot" cx="450" cy="202" r="8" />
        <line className="laws-circle-diameter" x1="330" y1="202" x2="570" y2="202" />
        <path className="laws-circle-final-fill" d="M330 202 C330 136 384 82 450 82 C516 82 570 136 570 202 Z" />
        <path className="laws-circle-final-arc" d="M330 202 C330 136 384 82 450 82 C516 82 570 136 570 202" />
        <line className="laws-circle-final-diameter" x1="330" y1="202" x2="570" y2="202" />
      </svg>
    );
  }

  if (animationKeyName === "definition-rectilinear-figures") {
    return (
      <svg className="laws-animation-svg laws-definition-rectilinear" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-straight-figure laws-rectilinear-good-shape" d="M230 290 L315 132 L435 176 L402 300 Z" />
        <g className="laws-nonrectilinear-choice">
          <path className="laws-nonrectilinear-shape" d="M570 260 C520 216 548 134 628 126 C718 116 768 188 734 255 C700 320 614 302 570 260 Z" />
          <g className="laws-nonrectilinear-cross">
            <line x1="590" y1="320" x2="740" y2="370" />
            <line x1="740" y1="320" x2="590" y2="370" />
          </g>
        </g>
      </svg>
    );
  }

  if (animationKeyName === "definition-triangles-by-sides") {
    return (
      <svg className="laws-animation-svg laws-definition-triangles" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-triangle eq" d="M165 318 L255 162 L345 318 Z" />
        <path className="laws-triangle iso" d="M385 318 L500 96 L615 318 Z" />
        <path className="laws-triangle sca" d="M650 318 L785 126 L835 304 Z" />
        <path
          className="laws-equality-mark"
          d="M205 238 l18 10 M255 306 v24 M305 248 l-18 -10 M432 218 l18 9 M441 202 l18 9 M568 218 l-18 9 M559 202 l-18 9"
        />
        <path className="laws-scalene-unequal-mark" d="M708 230 l18 12 M806 205 l-16 8 M814 224 l-16 8 M720 306 v22 M746 308 v22 M772 310 v22" />
      </svg>
    );
  }

  if (animationKeyName === "definition-triangles-by-angles") {
    return (
      <svg className="laws-animation-svg laws-definition-triangle-angles" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-triangle right" d="M190 285 H350 L190 125 Z" />
        <RightAngleMarker x={190} y={285} />
        <path className="laws-triangle obtuse" d="M420 285 H650 L555 230 Z" />
        <path className="laws-angle-arc obtuse" d="M504 251 A58 58 0 0 0 603 258" />
        <path className="laws-triangle acute" d="M665 285 L735 125 L810 285 Z" />
        <path className="laws-angle-arc acute-one" d="M690 285 A28 28 0 0 0 675 250" />
        <path className="laws-angle-arc acute-two" d="M724 150 A28 28 0 0 0 746 150" />
        <path className="laws-angle-arc acute-three" d="M786 250 A28 28 0 0 0 770 285" />
      </svg>
    );
  }

  if (animationKeyName === "definition-quadrilaterals") {
    return (
      <svg className="laws-animation-svg laws-definition-quads" viewBox="0 0 900 420" aria-hidden="true">
        <path className="laws-quad square" d="M145 135 H255 V245 H145 Z" />
        <path className="laws-quad oblong" d="M305 150 H470 V240 H305 Z" />
        <path className="laws-quad rhombus" d="M555 140 L650 140 L610 250 L515 250 Z" />
        <path className="laws-quad rhomboid" d="M165 300 L305 300 L270 365 L130 365 Z" />
        <path className="laws-quad trapezia" d="M495 300 H670 L710 365 H460 Z" />
        <RightAngleMarker x={145} y={245} />
        <RightAngleMarker x={305} y={240} />
        <path className="laws-equality-mark" d="M177 132 v16 M223 132 v16 M142 177 h16 M142 215 h16 M558 154 l12 8 M635 154 l-12 8 M540 246 l13 -8 M606 246 l-13 -8" />
      </svg>
    );
  }

  return (
    <svg className="laws-animation-svg laws-definition-parallel" viewBox="0 0 900 420" aria-hidden="true">
      <path className="laws-plane-fill" d="M220 120 H700 L650 310 H170 Z" />
      <line className="laws-parallel-line one" x1="160" y1="180" x2="740" y2="120" />
      <line className="laws-parallel-line two" x1="160" y1="280" x2="740" y2="220" />
      <path className="laws-infinity-stretch" d="M150 180 h-55 M750 120 h55 M150 280 h-55 M750 220 h55" />
    </svg>
  );
}
