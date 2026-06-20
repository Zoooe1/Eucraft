import type { GeometryObject, RequiredAction } from "../geometry/types";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

function objectName(object: GeometryObject) {
  if (object.type === "point") {
    return `point ${object.label ?? object.id}`;
  }

  if (object.type === "segment") {
    return `straight-line ${object.label ?? object.id}`;
  }

  if (object.type === "circle") {
    return `circle ${object.label ?? object.id}`;
  }

  return `produced line ${object.label ?? object.id}`;
}

function actionVerb(action: RequiredAction) {
  if (action.actionType.startsWith("select")) {
    return "Select";
  }

  if (action.actionType.startsWith("compare")) {
    return "Compare";
  }

  if (action.actionType.startsWith("trace")) {
    return "Trace";
  }

  if (action.actionType.startsWith("match")) {
    return "Match";
  }

  if (action.actionType.startsWith("decompose") || action.actionType.startsWith("recompose")) {
    return "Mark";
  }

  return "Complete";
}

export function ChallengePanel() {
  const propositionId = useGeometryStore((state) => state.currentPropositionId);
  const completedActionIds = useGeometryStore((state) => state.completedActionIds);
  const markChallengeAction = useGeometryStore((state) => state.markChallengeAction);
  const proposition = getProposition(propositionId);

  if (!proposition.userTask) {
    return null;
  }

  return (
    <section className="challenge-panel" aria-label="Proposition challenge">
      <div className="challenge-meta">
        <p className="panel-label">Given</p>
        <span>{proposition.challengeType}</span>
      </div>
      <p className="given-list">
        {proposition.initialObjects
          .filter((object) => object.type === "point" || object.type === "segment")
          .map(objectName)
          .join(", ")}
      </p>

      <p className="panel-label">Challenge</p>
      <p className="user-task">{proposition.userTask}</p>

      {proposition.requiredUserActions && proposition.requiredUserActions.length > 0 && (
        <div className="challenge-actions">
          {proposition.requiredUserActions.map((action) => {
            const completed = completedActionIds.includes(action.id);

            return (
              <button
                className={completed ? "challenge-action complete" : "challenge-action"}
                key={action.id}
                type="button"
                onClick={() => markChallengeAction(action.id)}
              >
                <span>{completed ? "Done" : actionVerb(action)}</span>
                {action.description}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
