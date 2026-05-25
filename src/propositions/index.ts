import type { Proposition } from "../geometry/types";
import { book1ExtendedPropositions } from "./book1extended";
import { book1Prop1 } from "./book1prop1";
import { book1Prop10 } from "./book1prop10";
import { book1Prop2 } from "./book1prop2";
import { book1Prop3 } from "./book1prop3";
import { book1Prop4 } from "./book1prop4";
import { book1Prop5 } from "./book1prop5";
import { book1Prop6 } from "./book1prop6";
import { book1Prop7 } from "./book1prop7";
import { book1Prop8 } from "./book1prop8";
import { book1Prop9 } from "./book1prop9";

export const propositions: Proposition[] = [
  book1Prop1,
  book1Prop2,
  book1Prop3,
  book1Prop4,
  book1Prop5,
  book1Prop6,
  book1Prop7,
  book1Prop8,
  book1Prop9,
  book1Prop10,
  ...book1ExtendedPropositions,
];

export function getProposition(id: string): Proposition {
  return propositions.find((proposition) => proposition.id === id) ?? book1Prop1;
}
