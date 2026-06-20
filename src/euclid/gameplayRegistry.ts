import type { GeometryObject, GeometryTool, Unlock } from "../geometry/types";
import { getProposition, propositions } from "../propositions";
import { unlocks } from "./unlocks";

const primitiveToolIds = [
  "primitive-point-selector",
  "primitive-straightedge",
  "primitive-extend-line",
  "primitive-compass",
  "primitive-intersection-selector",
];

const theoremToolByUnlockFunction: Record<string, GeometryTool> = {
  constructEquilateralTriangleOnSegment: "theorem-equilateral",
  createCircleWithTransferredRadius: "compass-transfer",
  cutOffEqualSegment: "compass-transfer",
  applySASCongruence: "theorem-sas",
  applySSSCongruence: "theorem-sss",
  bisectAngle: "theorem-bisect-angle",
  bisectSegment: "theorem-bisect-segment",
  dropPerpendicularFromPointToLine: "theorem-drop-perpendicular",
  constructTriangleFromThreeSegments: "theorem-triangle-sss",
  copyAngleToLine: "theorem-copy-angle",
  drawParallelThroughPoint: "theorem-parallel",
  constructParallelogramEqualToTriangle: "theorem-parallelogram-triangle",
  applyParallelogramEqualToTriangleOnLine: "theorem-parallelogram-line",
  constructParallelogramEqualToRectilinearFigure: "theorem-parallelogram-figure",
  constructSquareOnSegment: "theorem-square",
};

export type PropositionGameplayEntry = {
  propositionId: string;
  initialSceneObjects: GeometryObject[];
  allowedToolsAtLevelStart: GeometryTool[];
  theoremActionsAtLevelStart: string[];
  constructionValidationRequirements: string[];
  proofOrderRequirements: string[];
  unlockAfterCompletion: string[];
};

export function propositionNumberFromId(propositionId: string) {
  return Number(propositionId.split(".")[1]) || 1;
}

function propositionUnlockHappenedBefore(unlock: Unlock, propositionId: string) {
  if (!unlock.propositionId) {
    return false;
  }

  return propositionNumberFromId(unlock.propositionId) < propositionNumberFromId(propositionId);
}

export function historicalUnlockIdsForProposition(propositionId: string) {
  const ids = new Set<string>(primitiveToolIds);

  for (const unlock of unlocks) {
    if (unlock.propositionId && propositionUnlockHappenedBefore(unlock, propositionId)) {
      ids.add(unlock.id);
    }
  }

  return ids;
}

export function historicalToolsForProposition(propositionId: string) {
  const proposition = getProposition(propositionId);
  const historicalUnlockIds = historicalUnlockIdsForProposition(propositionId);
  const tools = new Set<GeometryTool>(proposition.allowedTools);

  for (const unlock of unlocks) {
    if (!historicalUnlockIds.has(unlock.id)) {
      continue;
    }

    if (unlock.unlockType === "primitive-tool") {
      const primitiveTool = {
        "primitive-point-selector": "point",
        "primitive-straightedge": "straightedge",
        "primitive-extend-line": "extend",
        "primitive-compass": "compass",
        "primitive-intersection-selector": "intersection",
        "primitive-arrange-triangle": "arrange-triangle",
      }[unlock.id] as GeometryTool | undefined;

      if (primitiveTool) {
        tools.add(primitiveTool);
      }
      continue;
    }

    const theoremTool = theoremToolByUnlockFunction[unlock.functionName];
    if (theoremTool && unlock.unlockType === "theorem-action") {
      tools.add(theoremTool);
    }
  }

  return Array.from(tools);
}

export function theoremActionUnlocksForProposition(propositionId: string) {
  const historicalUnlockIds = historicalUnlockIdsForProposition(propositionId);

  return unlocks.filter(
    (unlock) =>
      unlock.unlockType === "theorem-action" &&
      unlock.visibleToPlayer &&
      historicalUnlockIds.has(unlock.id) &&
      Boolean(theoremToolByUnlockFunction[unlock.functionName]),
  );
}

export function reasoningUnlocksForProposition(propositionId: string) {
  const historicalUnlockIds = historicalUnlockIdsForProposition(propositionId);

  return unlocks.filter(
    (unlock) =>
      (unlock.unlockType === "logic-rule" ||
        unlock.unlockType === "parallel-rule" ||
        unlock.unlockType === "area-rule" ||
        unlock.unlockType === "constraint-rule") &&
      unlock.propositionId &&
      unlock.visibleToPlayer &&
      historicalUnlockIds.has(unlock.id),
  );
}

export const propositionGameplayRegistry: PropositionGameplayEntry[] = propositions.map((proposition) => ({
  propositionId: proposition.id,
  initialSceneObjects: proposition.initialObjects,
  allowedToolsAtLevelStart: historicalToolsForProposition(proposition.id),
  theoremActionsAtLevelStart: theoremActionUnlocksForProposition(proposition.id).map((unlock) => unlock.id),
  constructionValidationRequirements: [
    proposition.validationGoal?.description,
    ...(proposition.validationGoal?.hiddenConstraints ?? []),
  ].filter((item): item is string => Boolean(item)),
  proofOrderRequirements: proposition.replaySteps.map((step) => step.id),
  unlockAfterCompletion: proposition.unlocks ?? [],
}));

export { theoremToolByUnlockFunction };
