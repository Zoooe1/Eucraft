import { useEffect, useState, type PointerEvent } from "react";
import type { EuclidDialogueStep } from "../../data/euclidDialogueSteps";
import { playSound, type SoundCue } from "./SoundManager";

type DefinitionAnimationRendererProps = {
  step: EuclidDialogueStep;
  replayKey: number;
  isMuted: boolean;
  completed: boolean;
  onInteractionComplete: () => void;
};

function useReplayReset<T>(initial: T, replayKey: number, stepId: string) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [replayKey, stepId]);

  return [value, setValue] as const;
}

function cue(isMuted: boolean, cueName?: string) {
  if (!isMuted && cueName) {
    playSound(cueName as SoundCue);
  }
}

function PointFromDivision({
  replayKey,
  completed,
  isMuted,
  onInteractionComplete,
}: Pick<DefinitionAnimationRendererProps, "replayKey" | "completed" | "isMuted" | "onInteractionComplete">) {
  const [awakened, setAwakened] = useReplayReset(completed, replayKey, "point");

  const awakenPoint = () => {
    setAwakened(true);
    cue(isMuted, "ink-tap");
    onInteractionComplete();
  };

  return (
    <svg className="definition-svg definition-point" viewBox="0 0 640 280" role="img" aria-label="A divided ink mark becomes a point">
      <g className="ink-chunk">
        <path d="M251 97 C292 58 354 66 384 101 C414 137 400 193 358 211 C315 230 255 215 232 172 C217 143 224 120 251 97 Z" />
      </g>
      <g className="ink-parts">
        <path d="M210 144 C225 119 260 119 273 143 C287 168 266 193 237 189 C209 185 195 168 210 144 Z" />
        <path d="M326 86 C351 78 374 95 374 120 C373 148 341 159 319 142 C299 127 303 95 326 86 Z" />
        <path d="M351 174 C375 160 405 175 404 204 C402 230 368 241 347 222 C329 207 330 186 351 174 Z" />
      </g>
      <g className="chosen-part">
        <path d="M287 137 C303 122 331 127 340 148 C351 172 329 195 303 188 C279 181 268 154 287 137 Z" />
      </g>
      <g className="pure-position">
        <circle cx="320" cy="148" r={awakened ? 8 : 5} />
        <path d="M320 125 L320 136 M320 160 L320 171 M297 148 L309 148 M331 148 L343 148" />
      </g>
      <rect className="svg-hotspot point-hotspot" x="260" y="92" width="120" height="112" role="button" tabIndex={0} onClick={awakenPoint} aria-label="Awaken the point" />
    </svg>
  );
}

function PointToLine() {
  return (
    <svg className="definition-svg definition-line" viewBox="0 0 640 280" role="img" aria-label="A point becomes many points and then a line">
      <circle className="seed-point" cx="320" cy="140" r="8" />
      <g className="aligned-points">
        {Array.from({ length: 17 }).map((_, index) => (
          <circle key={index} cx={160 + index * 20} cy="140" r="4.2" />
        ))}
      </g>
      <line className="born-line" x1="142" y1="140" x2="498" y2="140" />
    </svg>
  );
}

function LineExtremities({
  replayKey,
  completed,
  isMuted,
  onInteractionComplete,
}: Pick<DefinitionAnimationRendererProps, "replayKey" | "completed" | "isMuted" | "onInteractionComplete">) {
  const [clicked, setClicked] = useReplayReset<string[]>(completed ? ["left", "right"] : [], replayKey, "extremities");

  const clickEndpoint = (id: string) => {
    const next = clicked.includes(id) ? clicked : [...clicked, id];
    setClicked(next);
    cue(isMuted, "ink-tap");
    if (next.length >= 2) {
      onInteractionComplete();
    }
  };

  return (
    <svg className="definition-svg definition-extremities" viewBox="0 0 640 280" role="img" aria-label="The ends of a line are points">
      <line className="quiet-line" x1="170" y1="140" x2="470" y2="140" />
      <circle className={`endpoint ${clicked.includes("left") ? "discovered" : ""}`} cx="170" cy="140" r="10" />
      <circle className={`endpoint ${clicked.includes("right") ? "discovered" : ""}`} cx="470" cy="140" r="10" />
      <text x="150" y="118">A</text>
      <text x="482" y="118">B</text>
      {clicked.length >= 2 && <text className="mini-confirmation" x="236" y="198">The line ends in points.</text>}
      <circle className="svg-hotspot endpoint-left" cx="170" cy="140" r="34" role="button" tabIndex={0} onClick={() => clickEndpoint("left")} aria-label="Click left endpoint" />
      <circle className="svg-hotspot endpoint-right" cx="470" cy="140" r="34" role="button" tabIndex={0} onClick={() => clickEndpoint("right")} aria-label="Click right endpoint" />
    </svg>
  );
}

function StraightLine() {
  return (
    <svg className="definition-svg definition-straight" viewBox="0 0 640 280" role="img" aria-label="A wandering line becomes straight">
      <path className="wandering-line" d="M135 146 C220 94 266 193 340 144 C401 101 451 173 508 126" />
      <g className="line-points">
        {[150, 210, 270, 330, 390, 450, 510].map((x) => (
          <circle key={x} cx={x} cy="142" r="4" />
        ))}
      </g>
      <line className="settled-line" x1="132" y1="142" x2="510" y2="142" />
    </svg>
  );
}

function LineToSurface() {
  return (
    <svg className="definition-svg definition-surface" viewBox="0 0 640 280" role="img" aria-label="A line sweeps into a surface">
      <line className="sweep-line original" x1="166" y1="92" x2="474" y2="92" />
      <line className="sweep-line ghost" x1="166" y1="190" x2="474" y2="190" />
      <rect className="surface-fill" x="166" y="92" width="308" height="98" />
      <path className="surface-edge" d="M166 92 H474 V190 H166 Z" />
    </svg>
  );
}

function SurfaceExtremities({
  replayKey,
  completed,
  isMuted,
  onInteractionComplete,
}: Pick<DefinitionAnimationRendererProps, "replayKey" | "completed" | "isMuted" | "onInteractionComplete">) {
  const [traced, setTraced] = useReplayReset(completed, replayKey, "surface-extremities");

  const traceBoundary = () => {
    setTraced(true);
    cue(isMuted, "line-highlight");
    onInteractionComplete();
  };

  return (
    <svg className="definition-svg definition-surface-extremities" viewBox="0 0 640 280" role="img" aria-label="The extremities of a surface are lines">
      <rect className="surface-muted" x="178" y="76" width="284" height="130" />
      <path className={`boundary-lines ${traced ? "traced" : ""}`} d="M178 76 H462 V206 H178 Z" />
      <rect className="svg-hotspot boundary-hotspot" x="168" y="66" width="304" height="150" role="button" tabIndex={0} onClick={traceBoundary} aria-label="Trace a boundary line" />
    </svg>
  );
}

function PlaneSurface() {
  return (
    <svg className="definition-svg definition-plane" viewBox="0 0 640 280" role="img" aria-label="A surface settles into a plane">
      <path className="warped-surface" d="M152 91 C226 59 304 113 372 87 C432 65 483 83 511 115 L486 207 C400 237 331 180 256 211 C202 233 155 210 129 178 Z" />
      <path className="plane-surface-shape" d="M152 91 H506 L486 207 H129 Z" />
      <line className="plane-line one" x1="168" y1="122" x2="484" y2="122" />
      <line className="plane-line two" x1="152" y1="166" x2="496" y2="166" />
      <line className="plane-line three" x1="204" y1="91" x2="181" y2="207" />
      <line className="plane-line four" x1="404" y1="91" x2="386" y2="207" />
    </svg>
  );
}

function PlaneAngle({
  replayKey,
  completed,
  isMuted,
  onInteractionComplete,
}: Pick<DefinitionAnimationRendererProps, "replayKey" | "completed" | "isMuted" | "onInteractionComplete">) {
  const [angle, setAngle] = useReplayReset(completed ? -38 : -50, replayKey, "angle");

  const dragRay = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - rect.width * 0.5;
    const dy = y - rect.height * 0.57;
    const nextAngle = Math.max(-78, Math.min(-14, (Math.atan2(dy, dx) * 180) / Math.PI));
    setAngle(nextAngle);
    cue(isMuted, "soft-hinge");
    onInteractionComplete();
  };

  const radians = (angle * Math.PI) / 180;
  const vertex = { x: 320, y: 160 };
  const rayEnd = {
    x: vertex.x + Math.cos(radians) * 178,
    y: vertex.y + Math.sin(radians) * 178,
  };
  const arcEnd = {
    x: vertex.x + Math.cos(radians) * 48,
    y: vertex.y + Math.sin(radians) * 48,
  };

  return (
    <svg
      className="definition-svg definition-angle"
      viewBox="0 0 640 280"
      role="img"
      aria-label="Two lines meet and form a plane angle"
      onPointerDown={dragRay}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          dragRay(event);
        }
      }}
    >
      <path className="plane-backdrop" d="M152 84 H506 L486 216 H129 Z" />
      <line className="angle-ray fixed" x1={vertex.x} y1={vertex.y} x2="500" y2={vertex.y} />
      <line className="angle-ray moving" x1={vertex.x} y1={vertex.y} x2={rayEnd.x} y2={rayEnd.y} />
      <circle className="angle-vertex" cx={vertex.x} cy={vertex.y} r="7" />
      <path className="angle-arc" d={`M368 160 A48 48 0 0 0 ${arcEnd.x} ${arcEnd.y}`} />
      <path className="angle-wash" d={`M${vertex.x} ${vertex.y} L368 160 A48 48 0 0 0 ${arcEnd.x} ${arcEnd.y} Z`} />
    </svg>
  );
}

export function DefinitionAnimationRenderer({
  step,
  replayKey,
  isMuted,
  completed,
  onInteractionComplete,
}: DefinitionAnimationRendererProps) {
  const key = `${step.id}-${replayKey}`;

  if (step.animationKey === "point-from-division") {
    return <PointFromDivision key={key} replayKey={replayKey} completed={completed} isMuted={isMuted} onInteractionComplete={onInteractionComplete} />;
  }

  if (step.animationKey === "point-to-line") {
    return <PointToLine key={key} />;
  }

  if (step.animationKey === "line-extremities") {
    return <LineExtremities key={key} replayKey={replayKey} completed={completed} isMuted={isMuted} onInteractionComplete={onInteractionComplete} />;
  }

  if (step.animationKey === "straight-line") {
    return <StraightLine key={key} />;
  }

  if (step.animationKey === "line-to-surface") {
    return <LineToSurface key={key} />;
  }

  if (step.animationKey === "surface-extremities") {
    return <SurfaceExtremities key={key} replayKey={replayKey} completed={completed} isMuted={isMuted} onInteractionComplete={onInteractionComplete} />;
  }

  if (step.animationKey === "plane-surface") {
    return <PlaneSurface key={key} />;
  }

  return <PlaneAngle key={key} replayKey={replayKey} completed={completed} isMuted={isMuted} onInteractionComplete={onInteractionComplete} />;
}
