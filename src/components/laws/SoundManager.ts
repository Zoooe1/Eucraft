export type LawsSoundCue =
  | "ink-tap"
  | "line-draw"
  | "stretch"
  | "soft-snap"
  | "compass-sweep"
  | "right-angle-click"
  | "paper-rip"
  | "page-next"
  | "page-back";

export function playLawsSound(_cueName?: LawsSoundCue | string) {
  // Sound hooks are intentionally no-op until Eucraft has approved audio assets.
}
