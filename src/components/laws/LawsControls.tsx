type LawsControlsProps = {
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onReplay: () => void;
  onNext: () => void;
  onReturnHome: () => void;
  onBegin: () => void;
};

export function LawsControls({
  canGoBack,
  canGoNext,
  onBack,
  onReplay,
  onNext,
  onReturnHome,
  onBegin,
}: LawsControlsProps) {
  return (
    <nav className="laws-world-controls" aria-label="Laws of the World controls">
      <button type="button" onClick={onBack} disabled={!canGoBack}>
        Last step
      </button>
      <button type="button" onClick={onReplay}>
        Replay
      </button>
      <button type="button" onClick={onNext} disabled={!canGoNext}>
        Next step
      </button>
      <button type="button" onClick={onReturnHome}>
        Return home
      </button>
      <button type="button" onClick={onBegin}>
        Begin
      </button>
    </nav>
  );
}
