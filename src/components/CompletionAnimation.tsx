import type { Unlock } from "../geometry/types";
import { getUnlockById, useUnlockStore } from "../state/useUnlockStore";

export type CompletionAnimationProps = {
  propositionId: string;
  propositionTitle: string;
  nextPropositionId?: string;
  onAdvance: () => void;
  onReplayLogic?: () => void;
};

const completionMessages: Record<string, string> = {
  "I.1": "You have built your first Euclidean truth.",
  "I.2": "You have earned the power to carry a length.",
  "I.3": "You can now cut a known length from a greater line.",
  "I.4": "You have unlocked a new way to recognize equal triangles.",
  "I.5": "Equal sides now speak as equal angles.",
  "I.6": "Equal angles now speak back as equal sides.",
  "I.7": "The page now knows a two-distance point is unique.",
  "I.8": "Three sides now determine the matching angle.",
  "I.9": "You have learned how to divide an angle in two.",
  "I.10": "You have found the midpoint by Euclid's own path.",
};

function visibleLastUnlocks(ids: string[]) {
  return ids
    .map((id) => getUnlockById(id))
    .filter((unlock): unlock is Unlock => Boolean(unlock?.visibleToPlayer));
}

function unlockKind(unlock: Unlock) {
  if (unlock.unlockType === "theorem-action") {
    return "New Action Unlocked";
  }

  if (unlock.unlockType === "logic-rule") {
    return "New Logic Unlocked";
  }

  return "Unlocked";
}

export function CompletionAnimation({
  propositionId,
  propositionTitle,
  nextPropositionId,
  onAdvance,
  onReplayLogic,
}: CompletionAnimationProps) {
  const lastUnlockedIds = useUnlockStore((state) => state.lastUnlockedIds);
  const unlocks = visibleLastUnlocks(lastUnlockedIds);
  const advanceLabel = nextPropositionId ? `Advance to Proposition ${nextPropositionId}` : "Return to Proposition Map";

  return (
    <section className="completion-overlay" aria-label="Proposition completion">
      <div className="completion-animation-card">
        <div className="completion-border" aria-hidden="true" />

        <svg className="completion-seal" viewBox="0 0 180 120" aria-hidden="true">
          <circle cx="64" cy="76" r="42" />
          <circle cx="116" cy="76" r="42" />
          <path d="M64 76L116 76L90 31Z" />
          <line x1="64" y1="76" x2="116" y2="76" />
          <line x1="64" y1="76" x2="90" y2="31" />
          <line x1="116" y1="76" x2="90" y2="31" />
        </svg>

        <p className="completion-title">Proposition Complete</p>
        <h2 className="completion-subtitle">
          Euclid {propositionId} - {propositionTitle}
        </h2>
        <p className="completion-message">{completionMessages[propositionId] ?? "A new Euclidean page has opened."}</p>

        {unlocks.length > 0 && (
          <div className="completion-unlocks" aria-label="New unlocks">
            {unlocks.map((unlock) => (
              <span className="unlock-badge" key={unlock.id}>
                {unlockKind(unlock)}: {unlock.name}
              </span>
            ))}
          </div>
        )}

        <div className="completion-actions">
          {onReplayLogic && (
            <button className="quiet-button" type="button" onClick={onReplayLogic}>
              Replay Logic
            </button>
          )}
          <button className="primary-button advance-button" type="button" onClick={onAdvance}>
            {advanceLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
