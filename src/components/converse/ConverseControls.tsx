type ConverseControlsProps = {
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onReplay: () => void;
  onNext: () => void;
  onReturnHome: () => void;
  onBegin: () => void;
};

export function ConverseControls({
  canGoBack,
  canGoNext,
  onBack,
  onReplay,
  onNext,
  onReturnHome,
  onBegin,
}: ConverseControlsProps) {
  return (
    <nav className="converse-controls" aria-label="Converse with Euclid controls">
      <button type="button" onClick={onBack} disabled={!canGoBack}>
        Back
      </button>
      <button type="button" onClick={onReplay}>
        Replay
      </button>
      <button type="button" onClick={onNext} disabled={!canGoNext}>
        Next
      </button>
      <button type="button" onClick={onReturnHome}>
        Return Home
      </button>
      <button type="button" onClick={onBegin}>
        Begin
      </button>
    </nav>
  );
}
