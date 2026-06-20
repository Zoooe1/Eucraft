import type { GeometryTool } from "../../geometry/types";

type ToolIconProps = {
  tool: GeometryTool;
};

export function ToolIcon({ tool }: ToolIconProps) {
  if (tool === "point") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="7" />
      </svg>
    );
  }

  if (tool === "arrange-triangle") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="20,18 48,28 26,50" fill="none" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M15 33H8V26" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 33A23 23 0 0 1 42 13" fill="none" strokeWidth="4" strokeLinecap="round" />
        <path d="M49 31H56V38" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M56 31A23 23 0 0 1 22 51" fill="none" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "compass") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="20" fill="none" strokeWidth="4" />
        <circle cx="32" cy="32" r="4" />
      </svg>
    );
  }

  if (tool === "straightedge") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="7" y1="33" x2="57" y2="33" strokeWidth="5" strokeLinecap="round" />
        <circle cx="23" cy="33" r="6" />
        <circle cx="41" cy="33" r="6" />
      </svg>
    );
  }

  if (tool === "intersection") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="18" y1="18" x2="46" y2="46" strokeWidth="5" strokeLinecap="round" />
        <line x1="46" y1="18" x2="18" y2="46" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "extend") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="14" y1="47" x2="45" y2="16" strokeWidth="5" strokeLinecap="round" />
        <path d="M32 15H46V29" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tool === "compass-transfer") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="12" y1="45" x2="32" y2="45" strokeWidth="4" strokeLinecap="round" />
        <circle cx="14" cy="45" r="4" />
        <circle cx="32" cy="45" r="4" />
        <path d="M28 42A18 18 0 0 1 52 22" fill="none" strokeWidth="4" strokeLinecap="round" />
        <circle cx="52" cy="22" r="4" />
      </svg>
    );
  }

  if (tool === "theorem-sas") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M15 50L32 14L50 50" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25 30Q32 25 39 30" fill="none" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="14" r="3.5" />
        <line x1="20" y1="39" x2="27" y2="42" strokeWidth="4" strokeLinecap="round" />
        <line x1="37" y1="42" x2="44" y2="39" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "theorem-sss") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="32,10 53,49 11,49" fill="none" strokeWidth="5" strokeLinejoin="round" />
        <line x1="19" y1="43" x2="25" y2="46" strokeWidth="4" strokeLinecap="round" />
        <line x1="23" y1="37" x2="29" y2="40" strokeWidth="4" strokeLinecap="round" />
        <line x1="39" y1="40" x2="45" y2="37" strokeWidth="4" strokeLinecap="round" />
        <line x1="43" y1="46" x2="49" y2="43" strokeWidth="4" strokeLinecap="round" />
        <line x1="25" y1="53" x2="25" y2="45" strokeWidth="4" strokeLinecap="round" />
        <line x1="39" y1="53" x2="39" y2="45" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "theorem-equilateral" || tool === "theorem-triangle-sss") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="32,10 52,48 12,48" fill="none" strokeWidth="5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tool === "theorem-bisect-angle" || tool === "theorem-copy-angle") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 50L32 18L54 50" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="32" y1="18" x2="34" y2="50" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "theorem-bisect-segment") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="10" y1="33" x2="54" y2="33" strokeWidth="5" strokeLinecap="round" />
        <line x1="32" y1="20" x2="32" y2="46" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "theorem-perpendicular-on-line" || tool === "theorem-drop-perpendicular") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="12" y1="45" x2="52" y2="45" strokeWidth="5" strokeLinecap="round" />
        <line x1="32" y1="14" x2="32" y2="45" strokeWidth="5" strokeLinecap="round" />
        <path d="M32 34H43V45" fill="none" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (tool === "theorem-parallel") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <line x1="13" y1="24" x2="51" y2="18" strokeWidth="5" strokeLinecap="round" />
        <line x1="13" y1="45" x2="51" y2="39" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (
    tool === "theorem-parallelogram-triangle" ||
    tool === "theorem-parallelogram-line" ||
    tool === "theorem-parallelogram-figure"
  ) {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <polygon points="18,18 54,18 44,48 8,48" fill="none" strokeWidth="5" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="16" y="16" width="32" height="32" fill="none" strokeWidth="5" />
    </svg>
  );
}
