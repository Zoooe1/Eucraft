import { initialLogicUnlocks } from "./unlocks";

export const lawCards = initialLogicUnlocks.map((unlock) => ({
  id: unlock.id,
  title: unlock.name,
  text: unlock.description,
  source: unlock.source ?? "",
}));

export const openingLawSections = [
  {
    title: "Physics of Euclid's World",
    items: lawCards,
  },
];
