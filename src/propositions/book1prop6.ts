import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop6: Proposition = {
  id: "I.6",
  book: "Book I",
  number: 6,
  title: "Equal Angles, Equal Sides",
  subtitle: "Build the Elements",
  playerGoal: "Complete the equal-angle triangle and reveal why the opposite sides must match.",
  originalStatement:
    "If a triangle has two angles equal to one another then the sides subtending the equal angles will also be equal to one another.",
  instruction: "Use the straightedge to join A, B, and C into the triangle.",
  initialObjects: [
    { id: "A", type: "point", x: 430, y: 140, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 260, y: 430, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 600, y: 430, label: "C", fixed: true, createdBy: "given", color: "gold" },
  ],
  allowedTools: ["point", "straightedge"],
  pointLabelSequence: ["D", "E", "F", "G", "H", "K"],
  nextPropositionId: "I.7",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-equal-angles",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointB", "pointC"],
      text: "Let triangle ABC have angle ABC equal to angle ACB.",
    },
    {
      id: "assume-unequal",
      highlight: ["segmentAB", "segmentAC"],
      text: "If AB and AC were unequal, let AB be the greater.",
    },
    {
      id: "cut-off",
      highlight: ["segmentAB", "segmentAC"],
      text: "Cut DB from AB equal to AC, and join DC. [Prop. I.3, Post. 1]",
    },
    {
      id: "sas-contradiction",
      highlight: ["segmentAB", "segmentAC", "segmentBC"],
      text: "Then triangle DBC would equal triangle ACB by I.4: the lesser equals the greater.",
    },
    {
      id: "whole-part",
      highlight: ["segmentAB", "segmentAC"],
      text: "That is absurd, for the whole is greater than the part. [C.N. 5]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentAC", "pointA"],
      text: "So AB is not unequal to AC. Therefore AB = AC.",
    },
  ],
};
