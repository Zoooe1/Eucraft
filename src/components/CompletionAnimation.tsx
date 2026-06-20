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

  if (unlock.unlockType === "logic-rule" || unlock.unlockType === "parallel-rule" || unlock.unlockType === "area-rule") {
    return "New Logic Unlocked";
  }

  return "Unlocked";
}

export function CompletionAnimation({
  propositionId,
  propositionTitle,
  nextPropositionId,
  onAdvance,
}: CompletionAnimationProps) {
  const lastUnlockedIds = useUnlockStore((state) => state.lastUnlockedIds);
  const unlocks = visibleLastUnlocks(lastUnlockedIds);
  const bookComplete = propositionId === "I.48";
  const advanceLabel = bookComplete
    ? "Review Book I Map"
    : nextPropositionId
      ? `Advance to Proposition ${nextPropositionId}`
      : "Return to Proposition Map";

  return (
    <section className="completion-overlay" aria-label="Proposition completion">
      <div className="completion-animation-card">
        <div className="completion-border" aria-hidden="true" />

        <svg className="completion-seal" viewBox="0 0 240 150" aria-hidden="true">
          <circle cx="92" cy="88" r="50" pathLength="1" />
          <circle cx="148" cy="88" r="50" pathLength="1" />
          <path d="M92 88L148 88L120 39.5Z" pathLength="1" />
          <line x1="92" y1="88" x2="148" y2="88" pathLength="1" />
          <line x1="92" y1="88" x2="120" y2="39.5" pathLength="1" />
          <line x1="148" y1="88" x2="120" y2="39.5" pathLength="1" />
        </svg>

        <p className="completion-title">{bookComplete ? "Book I Complete" : "Proposition Complete"}</p>
        <h2 className="completion-subtitle">
          {bookComplete ? "Fundamentals of Plane Geometry Involving Straight-Lines" : `Euclid ${propositionId} - ${propositionTitle}`}
        </h2>
        <p className="completion-message">
          {bookComplete
            ? "You have played through the first book of Euclid's Elements."
            : completionMessages[propositionId] ?? "A new Euclidean page has opened."}
        </p>

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
          {bookComplete && (
            <button className="quiet-button" type="button" disabled title="Book II is not implemented yet.">
              Continue to Book II Preview
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
