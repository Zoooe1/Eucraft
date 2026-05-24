import { euclidPropositions } from "./propositions";
import { unlockById } from "./unlocks";

export function dependenciesMet(propositionId: string, completedPropositionIds: string[]) {
  const proposition = euclidPropositions.find((item) => item.id === propositionId);
  if (!proposition) {
    return false;
  }

  return proposition.dependencies.every((dependency) => completedPropositionIds.includes(dependency));
}

export function unlockDependenciesMet(unlockId: string, unlockedIds: string[]) {
  const unlock = unlockById.get(unlockId);
  if (!unlock) {
    return false;
  }

  return unlock.dependsOn.every((dependency) => unlockedIds.includes(dependency));
}

export function getUnlockedPropositionIds(completedPropositionIds: string[]) {
  return euclidPropositions
    .filter((proposition) => proposition.id === "I.1" || dependenciesMet(proposition.id, completedPropositionIds))
    .map((proposition) => proposition.id);
}
