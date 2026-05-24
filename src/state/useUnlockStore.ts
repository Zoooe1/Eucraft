import { create } from "zustand";
import { getUnlockedPropositionIds } from "../euclid/dependencies";
import { getEuclidProposition } from "../euclid/propositions";
import { hiddenAxiomUnlocks, initialLogicUnlocks, primitiveToolUnlocks, unlockById, unlocks } from "../euclid/unlocks";
import type { Unlock } from "../geometry/types";

const UNLOCK_PROGRESS_KEY = "eucraft-unlock-progress-v1";
const LEGACY_PROGRESS_KEY = "eucraft-progress-v1";

type UnlockProgress = {
  completedPropositionIds: string[];
  unlockedIds: string[];
};

type UnlockStore = UnlockProgress & {
  lastUnlockedIds: string[];
  completeProposition: (id: string) => string[];
  isUnlocked: (unlockId: string) => boolean;
  getVisibleTools: () => Unlock[];
  getVisibleTheoremActions: () => Unlock[];
  getLogicRules: () => Unlock[];
  getInternalConstraints: () => Unlock[];
  getUnlockedPropositionIds: () => string[];
  clearLastUnlocked: () => void;
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function initialUnlockedIds() {
  return [
    ...primitiveToolUnlocks.map((unlock) => unlock.id),
    ...initialLogicUnlocks.map((unlock) => unlock.id),
    ...hiddenAxiomUnlocks.map((unlock) => unlock.id),
  ];
}

function readLegacyCompleted() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_PROGRESS_KEY) ?? "{}") as {
      completedPropositionIds?: string[];
    };
    return legacy.completedPropositionIds ?? [];
  } catch {
    return [];
  }
}

function readProgress(): UnlockProgress {
  const fallback = {
    completedPropositionIds: readLegacyCompleted(),
    unlockedIds: initialUnlockedIds(),
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(UNLOCK_PROGRESS_KEY) ?? "{}") as Partial<UnlockProgress>;
    return {
      completedPropositionIds: unique([...(fallback.completedPropositionIds ?? []), ...(stored.completedPropositionIds ?? [])]),
      unlockedIds: unique([...initialUnlockedIds(), ...(stored.unlockedIds ?? [])]),
    };
  } catch {
    return fallback;
  }
}

function writeProgress(progress: UnlockProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(UNLOCK_PROGRESS_KEY, JSON.stringify(progress));
}

function resolveUnlocksForCompleted(completedPropositionIds: string[], currentUnlockedIds: string[]) {
  const unlockedIds = new Set(currentUnlockedIds);
  let changed = true;

  while (changed) {
    changed = false;
    for (const propositionId of completedPropositionIds) {
      const proposition = getEuclidProposition(propositionId);
      for (const unlockId of proposition?.unlocks ?? []) {
        const unlock = unlockById.get(unlockId);
        const dependenciesMet = unlock?.dependsOn.every((dependency) => unlockedIds.has(dependency)) ?? false;
        if (dependenciesMet && !unlockedIds.has(unlockId)) {
          unlockedIds.add(unlockId);
          changed = true;
        }
      }
    }
  }

  return Array.from(unlockedIds);
}

const initialProgress = readProgress();
const initialState = {
  completedPropositionIds: initialProgress.completedPropositionIds,
  unlockedIds: resolveUnlocksForCompleted(initialProgress.completedPropositionIds, initialProgress.unlockedIds),
};

export const useUnlockStore = create<UnlockStore>((set, get) => ({
  ...initialState,
  lastUnlockedIds: [],
  completeProposition: (id) => {
    const state = get();
    const proposition = getEuclidProposition(id);
    if (!proposition) {
      return [];
    }

    const completedPropositionIds = unique([...state.completedPropositionIds, id]);
    const before = new Set(state.unlockedIds);
    const unlockedIds = resolveUnlocksForCompleted(completedPropositionIds, state.unlockedIds);
    const lastUnlockedIds = proposition.unlocks.filter((unlockId) => unlockedIds.includes(unlockId) && !before.has(unlockId));
    const progress = { completedPropositionIds, unlockedIds };
    writeProgress(progress);
    set({ ...progress, lastUnlockedIds });
    return lastUnlockedIds;
  },
  isUnlocked: (unlockId) => get().unlockedIds.includes(unlockId),
  getVisibleTools: () =>
    unlocks.filter(
      (unlock) =>
        unlock.unlockType === "primitive-tool" &&
        unlock.visibleToPlayer &&
        get().unlockedIds.includes(unlock.id),
    ),
  getVisibleTheoremActions: () =>
    unlocks.filter(
      (unlock) =>
        unlock.unlockType === "theorem-action" &&
        unlock.visibleToPlayer &&
        get().unlockedIds.includes(unlock.id),
    ),
  getLogicRules: () =>
    unlocks.filter(
      (unlock) =>
        unlock.unlockType === "logic-rule" &&
        unlock.visibleToPlayer &&
        get().unlockedIds.includes(unlock.id),
    ),
  getInternalConstraints: () =>
    unlocks.filter(
      (unlock) =>
        unlock.unlockType === "constraint-rule" &&
        get().unlockedIds.includes(unlock.id),
    ),
  getUnlockedPropositionIds: () => getUnlockedPropositionIds(get().completedPropositionIds),
  clearLastUnlocked: () => set({ lastUnlockedIds: [] }),
}));

export function getUnlockById(id: string) {
  return unlockById.get(id);
}
