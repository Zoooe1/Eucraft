import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";
import { book1Prop2 } from "./book1prop2";
import { book1Prop3 } from "./book1prop3";

export const propositions: Proposition[] = [book1Prop1, book1Prop2, book1Prop3];

export function getProposition(id: string): Proposition {
  return propositions.find((proposition) => proposition.id === id) ?? book1Prop1;
}
