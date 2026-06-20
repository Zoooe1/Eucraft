import { useEffect, useMemo, useState } from "react";
import { useGeometryStore } from "../state/useGeometryStore";

type GuideDiagram = "copy-length" | "sas";

type WorkspaceGuide = {
  id: string;
  propositionId: string;
  eyebrow: string;
  title: string;
  diagram: GuideDiagram;
  steps: Array<{
    focus: string;
    text: string;
  }>;
};

const workspaceGuides: WorkspaceGuide[] = [
  {
    id: "copy-length-i3",
    propositionId: "I.3",
    eyebrow: "New Tool",
    title: "Copy Length",
    diagram: "copy-length",
    steps: [
      { focus: "CD", text: "Click the highlighted segment CD to take the length you want to copy." },
      { focus: "A", text: "Click A as the starting point for the copied length." },
      { focus: "target", text: "Click the target line or ray where the copied length should land." },
      { focus: "E", text: "The new point E is placed so AE matches CD." },
    ],
  },
  {
    id: "sas-i5",
    propositionId: "I.5",
    eyebrow: "New Theorem",
    title: "SAS",
    diagram: "sas",
    steps: [
      { focus: "side-one", text: "Match the first pair of equal sides." },
      { focus: "included-point", text: "Match the shared point where the two chosen sides meet." },
      { focus: "side-two", text: "Match the second pair of equal sides." },
    ],
  },
];

const DISMISSED_GUIDES_STORAGE_KEY = "eucraft-workspace-guides-dismissed-v2";

function readDismissedGuideIds() {
  try {
    return JSON.parse(window.sessionStorage.getItem(DISMISSED_GUIDES_STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function storeDismissedGuideIds(ids: string[]) {
  try {
    window.sessionStorage.setItem(DISMISSED_GUIDES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Session storage is only a convenience; the guide still works without it.
  }
}

function CopyLengthGuideDiagram({ focus, onFocusClick }: { focus: string; onFocusClick: (focus: string) => void }) {
  const active = (id: string) => (focus === id ? "is-active" : "");

  return (
    <svg className="workspace-guide-diagram copy-length-guide" viewBox="0 0 720 340" role="img" aria-label="Copy length walkthrough">
      <line className={`workspace-coach-line copy-source ${active("CD")}`} x1="250" y1="88" x2="392" y2="88" />
      <line
        className="workspace-guide-hotspot"
        x1="250"
        y1="88"
        x2="392"
        y2="88"
        onClick={() => onFocusClick("CD")}
      />

      <line className="workspace-coach-line copy-base" x1="142" y1="246" x2="574" y2="246" />
      <line
        className={`workspace-coach-line copy-base ${active("target")}`}
        x1="142"
        y1="246"
        x2="574"
        y2="246"
      />
      <line
        className="workspace-guide-hotspot"
        x1="142"
        y1="246"
        x2="574"
        y2="246"
        onClick={() => onFocusClick("target")}
      />

      <circle className={`workspace-coach-point ${active("A")}`} cx="142" cy="246" r="8" />
      <circle className={`workspace-coach-point ${active("E")}`} cx="284" cy="246" r="8" />
      <circle className="workspace-coach-point" cx="574" cy="246" r="7" />
      <circle className="workspace-coach-point" cx="250" cy="88" r="7" />
      <circle className="workspace-coach-point" cx="392" cy="88" r="7" />

      <circle className="workspace-guide-hotspot-point" cx="142" cy="246" r="24" onClick={() => onFocusClick("A")} />
      <circle className="workspace-guide-hotspot-point" cx="284" cy="246" r="24" onClick={() => onFocusClick("E")} />

      <text x="126" y="284">A</text>
      <text x="568" y="284">B</text>
      <text className={active("E")} x="276" y="284">
        E
      </text>
      <text x="238" y="58">C</text>
      <text x="386" y="58">D</text>
      <text className={`workspace-guide-side-label copy-source ${active("CD")}`} x="310" y="73">
        CD
      </text>
      <text className={`workspace-guide-side-label copy-target ${active("E")}`} x="205" y="232">
        AE
      </text>
    </svg>
  );
}

type SasTriangleConfig = {
  x: number;
};

function SASTriangle({
  config,
  focus,
  onFocusClick,
}: {
  config: SasTriangleConfig;
  focus: string;
  onFocusClick: (focus: string) => void;
}) {
  const active = (id: string) => (focus === id ? "is-active" : "");
  const apex = { x: config.x + 110, y: 76 };
  const left = { x: config.x, y: 318 };
  const right = { x: config.x + 220, y: 318 };
  const pointActive = focus === "included-point";

  return (
    <g>
      <line
        className={`workspace-coach-line sas-side-one ${active("side-one")}`}
        x1={apex.x}
        y1={apex.y}
        x2={left.x}
        y2={left.y}
      />
      <line
        className={`workspace-coach-line sas-side-two ${active("side-two")}`}
        x1={apex.x}
        y1={apex.y}
        x2={right.x}
        y2={right.y}
      />
      <line className="workspace-coach-line sas-base" x1={left.x} y1={left.y} x2={right.x} y2={right.y} />

      <line
        className="workspace-guide-hotspot"
        x1={apex.x}
        y1={apex.y}
        x2={left.x}
        y2={left.y}
        onClick={() => onFocusClick("side-one")}
      />
      <line
        className="workspace-guide-hotspot"
        x1={apex.x}
        y1={apex.y}
        x2={right.x}
        y2={right.y}
        onClick={() => onFocusClick("side-two")}
      />

      <circle
        className="workspace-guide-hotspot-point"
        cx={apex.x}
        cy={apex.y}
        r="38"
        onClick={() => onFocusClick("included-point")}
      />

      <line className="workspace-coach-tick sas-side-one" x1={config.x + 50} y1="186" x2={config.x + 68} y2="194" />
      <line className="workspace-coach-tick sas-side-two" x1={config.x + 152} y1="194" x2={config.x + 170} y2="186" />

      <circle className={`workspace-coach-point-ring ${pointActive ? "is-active" : ""}`} cx={apex.x} cy={apex.y} r="22" />
      <circle className={`workspace-coach-point ${pointActive ? "is-active" : ""}`} cx={apex.x} cy={apex.y} r="8" />
      <circle className="workspace-coach-point" cx={left.x} cy={left.y} r="7" />
      <circle className="workspace-coach-point" cx={right.x} cy={right.y} r="7" />
    </g>
  );
}

function SASGuideDiagram({ focus, onFocusClick }: { focus: string; onFocusClick: (focus: string) => void }) {
  const left = {
    x: 112,
  };
  const right = {
    x: 450,
  };

  return (
    <svg className="workspace-guide-diagram sas-guide" viewBox="0 0 780 380" role="img" aria-label="SAS walkthrough">
      <SASTriangle config={left} focus={focus} onFocusClick={onFocusClick} />
      <SASTriangle config={right} focus={focus} onFocusClick={onFocusClick} />
    </svg>
  );
}

export function WorkspaceToolGuide() {
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const phase = useGeometryStore((state) => state.phase);
  const selectedTool = useGeometryStore((state) => state.selectedTool);
  const congruenceSelection = useGeometryStore((state) => state.congruenceSelection);
  const resetCongruenceSelection = useGeometryStore((state) => state.resetCongruenceSelection);
  const [dismissedGuideIds, setDismissedGuideIds] = useState<string[]>(readDismissedGuideIds);
  const [stepIndex, setStepIndex] = useState(0);

  const guide = useMemo(
    () => workspaceGuides.find((candidate) => candidate.propositionId === currentPropositionId) ?? null,
    [currentPropositionId],
  );
  const activeGuide = phase === "construction" && guide && !dismissedGuideIds.includes(guide.id) ? guide : null;
  const step = activeGuide?.steps[stepIndex] ?? activeGuide?.steps[0];
  const atStart = stepIndex === 0;
  const atEnd = Boolean(activeGuide && stepIndex === activeGuide.steps.length - 1);

  useEffect(() => {
    setStepIndex(0);
  }, [activeGuide?.id]);

  if (
    phase === "construction" &&
    congruenceSelection &&
    (selectedTool === "theorem-sas" || selectedTool === "theorem-sss")
  ) {
    const total = 6;
    const methodName = congruenceSelection.method;
    const status = congruenceSelection.status ?? "idle";

    return (
      <section
        className={`congruence-tool-guide ${status}`}
        aria-label={`${methodName} workspace instructions`}
        aria-live="polite"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <div>
          <p>{methodName} Tool</p>
          <strong>{congruenceSelection.message}</strong>
        </div>
        <span>
          {Math.min(congruenceSelection.picks.length, total)}/{total}
        </span>
        <button type="button" onClick={resetCongruenceSelection}>
          Reset Picks
        </button>
      </section>
    );
  }

  if (!activeGuide || !step) {
    return null;
  }

  const finishGuide = () => {
    setDismissedGuideIds((ids) => {
      const nextIds = ids.includes(activeGuide.id) ? ids : [...ids, activeGuide.id];
      storeDismissedGuideIds(nextIds);
      return nextIds;
    });
    setStepIndex(0);
  };

  const advance = () => {
    if (atEnd) {
      finishGuide();
      return;
    }
    setStepIndex((index) => Math.min(activeGuide.steps.length - 1, index + 1));
  };

  const handleFocusClick = (focusId: string) => {
    if (focusId === step.focus) {
      advance();
    }
  };

  return (
    <div
      className="workspace-guide-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${activeGuide.title} walkthrough`}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
    >
      <section className="workspace-guide-card">
        <div className="workspace-guide-header">
          <p>{activeGuide.eyebrow}</p>
          <strong>{activeGuide.title}</strong>
        </div>

        <div className="workspace-guide-stage">
          {activeGuide.diagram === "copy-length" ? (
            <CopyLengthGuideDiagram focus={step.focus} onFocusClick={handleFocusClick} />
          ) : (
            <SASGuideDiagram focus={step.focus} onFocusClick={handleFocusClick} />
          )}
        </div>

        <p className="workspace-guide-step">
          <span>
            {stepIndex + 1}/{activeGuide.steps.length}
          </span>
          {step.text}
        </p>

        <div className="workspace-guide-actions">
          <button type="button" onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={atStart}>
            Back
          </button>
          <button type="button" onClick={advance}>
            {atEnd ? "Begin Construction" : "Next"}
          </button>
          <button type="button" onClick={finishGuide}>
            Skip Guide
          </button>
        </div>
      </section>
    </div>
  );
}
