import type { Unlock } from "../geometry/types";

export function UnlockCard({ unlock }: { unlock: Unlock }) {
  return (
    <article className="unlock-card">
      <p className="panel-label">Unlocked</p>
      <h3>{unlock.name}</h3>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>{unlock.source ?? unlock.propositionId}</dd>
        </div>
        {unlock.originalStatement && (
          <div>
            <dt>Original</dt>
            <dd>{unlock.originalStatement}</dd>
          </div>
        )}
        <div>
          <dt>What it lets you do</dt>
          <dd>{unlock.whatItLetsYouDo ?? unlock.description}</dd>
        </div>
        <div>
          <dt>Why it matters</dt>
          <dd>{unlock.futureUses.length > 0 ? unlock.futureUses.join(", ") : "Future propositions can depend on it."}</dd>
        </div>
        {unlock.dependsOn.length > 0 && (
          <div>
            <dt>Depends on</dt>
            <dd>{unlock.dependsOn.join(", ")}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
