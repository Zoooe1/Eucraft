import type { CSSProperties } from "react";
import { useGeometryStore } from "../state/useGeometryStore";

const choiceFootprints = [
  { x: "43%", y: "5%", delay: 0, scale: 0.72, color: "#c5a0a5", opacity: 0.36 },
  { x: "56%", y: "13%", delay: 150, scale: 0.74, color: "#be949c", opacity: 0.43 },
  { x: "46%", y: "22%", delay: 300, scale: 0.76, color: "#b98591", opacity: 0.5 },
  { x: "55%", y: "31%", delay: 450, scale: 0.78, color: "#ad7380", opacity: 0.57 },
  { x: "45%", y: "40%", delay: 600, scale: 0.8, color: "#a56570", opacity: 0.64 },
  { x: "56%", y: "49%", delay: 750, scale: 0.82, color: "#9a5660", opacity: 0.71 },
  { x: "47%", y: "58%", delay: 900, scale: 0.84, color: "#8d424c", opacity: 0.78 },
  { x: "55%", y: "67%", delay: 1050, scale: 0.86, color: "#84353f", opacity: 0.84 },
  { x: "48%", y: "76%", delay: 1200, scale: 0.88, color: "#7a252d", opacity: 0.9 },
  { x: "55%", y: "85%", delay: 1350, scale: 0.92, color: "#760d14", opacity: 0.94 },
  { x: "49%", y: "94%", delay: 1500, scale: 0.96, color: "#760000", opacity: 0.96 },
];

function ChoiceFootprintMark({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`choice-footprint-mark ${side}`} viewBox="0 0 42 70" aria-hidden="true">
      <path d="M22 5 C32 6 37 16 34 29 C31 43 22 52 12 49 C3 46 1 35 5 23 C9 10 13 4 22 5 Z" />
      <path d="M10 52 C18 50 25 55 25 62 C25 69 15 72 8 67 C3 63 4 55 10 52 Z" />
    </svg>
  );
}

function ChoiceFootprintTrail() {
  return (
    <div className="choice-footprint-trail" aria-hidden="true">
      {choiceFootprints.map((step, index) => (
        <div
          className="choice-footprint-step"
          key={`${step.x}-${step.y}`}
          style={
            {
              "--choice-footprint-x": step.x,
              "--choice-footprint-y": step.y,
              "--choice-footprint-delay": `${step.delay}ms`,
              "--choice-footprint-scale": step.scale,
              "--choice-footprint-color": step.color,
              "--choice-footprint-opacity": step.opacity,
              "--choice-footprint-tilt": `${180 + (index % 2 === 0 ? -5 : 5)}deg`,
            } as CSSProperties
          }
        >
          <ChoiceFootprintMark side="left" />
          <ChoiceFootprintMark side="right" />
        </div>
      ))}
    </div>
  );
}

export function ConstructionCompleteChoice() {
  const startProofPlay = useGeometryStore((state) => state.startProofPlay);
  const startLogicReplay = useGeometryStore((state) => state.startLogicReplay);

  return (
    <section className="choice-panel" aria-label="Construction complete">
      <ChoiceFootprintTrail />
      <h2>Choose your next path.</h2>
      <div className="choice-actions">
        <button className="primary-button" type="button" onClick={startProofPlay}>
          Play the proof
        </button>
        <button className="quiet-button" type="button" onClick={startLogicReplay}>
          Read the proof
        </button>
      </div>
    </section>
  );
}
