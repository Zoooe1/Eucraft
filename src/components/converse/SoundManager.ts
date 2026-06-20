export type SoundCue =
  | "ink-tap"
  | "split"
  | "line-draw"
  | "soft-snap"
  | "surface-sweep"
  | "line-highlight"
  | "soft-settle"
  | "soft-hinge"
  | "page-next"
  | "page-back";

export function playSound(_cue: SoundCue): void {
  // Placeholder for future subtle manuscript sound assets. This is intentionally safe to call without audio files.
}
