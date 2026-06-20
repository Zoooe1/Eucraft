import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop6: Proposition = {
  id: "I.6",
  book: "Book I",
  number: 6,
  title: "Equal Angles, Equal Sides",
  subtitle: "Build the Elements",
  playerGoal: "Use a guided contradiction to prove the sides opposite equal angles match.",
  originalStatement:
    "If a triangle has two angles equal to one another then the sides subtending the equal angles will also be equal to one another.",
  instruction: "Enter the assumption AB > AC, cut DB equal to AC, join DC, then order the contradiction proof.",
  type: "theorem",
  challengeType: "derive",
  userTask: "Work inside the temporary assumption. Cut DB from AB equal to AC, then join D to C.",
  initialObjects: [
    { id: "A", type: "point", x: 430, y: 120, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 280, y: 455, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 580, y: 455, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "black", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "black", given: true, source: "given" },
  ],
  allowedTools: [
    "point",
    "straightedge",
    "extend",
    "compass",
    "compass-transfer",
    "intersection",
    "theorem-equilateral",
    "theorem-sas",
  ],
  requiredUserActions: [
    {
      id: "prop6-assume-ab-greater",
      actionType: "compare-objects",
      description: "Assume AB > AC.",
    },
    {
      id: "prop6-use-cut-equal",
      actionType: "match-congruent-parts",
      description: "Use Copy Length.",
    },
  ],
  validationGoal: {
    id: "validateConverseIsoscelesContradiction",
    description: "Under the temporary assumption AB > AC, cut DB equal to AC and join DC.",
    minimumUserActions: ["prop6-assume-ab-greater", "prop6-use-cut-equal", "prop6-cut-db-ac"],
    hiddenConstraints: ["contradictionMode", "sasOnly", "wholeGreaterThanPart"],
  },
  pointLabelSequence: ["D", "E", "F", "G", "H", "K"],
  nextPropositionId: "I.7",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-equal-angles",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointB", "pointC"],
      angleHighlights: [
        { points: ["A", "B", "C"], color: "gold", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "gold", amplifyVertex: true },
      ],
      text: "Let triangle ABC have angle ABC equal to angle ACB. I say that side AB is also equal to side AC.",
    },
    {
      id: "assume-unequal",
      highlight: ["segmentAB", "segmentAC"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "blue" },
      ],
      text: "For if AB is unequal to AC, one of them is greater. Let AB be greater.",
    },
    {
      id: "cut-off",
      highlight: ["segmentDB", "segmentAC", "segmentDC", "pointD"],
      highlightStyles: [
        { target: "segmentDB", color: "blue" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDC", color: "teal" },
      ],
      text: "Cut DB from the greater AB equal to the lesser AC, and join DC. [Prop. I.3, Post. 1]",
    },
    {
      id: "angle-transfer",
      highlight: ["segmentDB", "segmentBC", "segmentAC"],
      highlightStyles: [
        { target: "segmentDB", color: "blue" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentBC", color: "gold" },
      ],
      angleHighlights: [
        { points: ["D", "B", "C"], color: "gold", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "gold", amplifyVertex: true },
      ],
      text: "Since D lies on AB, angle DBC is the given angle ABC. Hence angle DBC = angle ACB.",
    },
    {
      id: "common-side",
      highlight: ["segmentBC"],
      highlightStyles: [{ target: "segmentBC", color: "gold" }],
      text: "BC is common to the two triangles DBC and ACB.",
    },
    {
      id: "sas-contradiction",
      highlight: ["segmentDB", "segmentAC", "segmentBC"],
      highlightStyles: [
        { target: "segmentDB", color: "blue" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentBC", color: "gold" },
      ],
      angleHighlights: [
        { points: ["D", "B", "C"], color: "gold", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "gold", amplifyVertex: true },
      ],
      text: "DB = AC, BC = CB, and angle DBC = ACB. Thus DC = AB and triangle DBC equals triangle ACB by SAS. [Prop. I.4]",
    },
    {
      id: "whole-part",
      highlight: ["triangleABC", "segmentDB", "segmentDC", "segmentBC", "pointD"],
      highlightStyles: [
        { target: "segmentDB", color: "rose" },
        { target: "segmentDC", color: "rose" },
        { target: "segmentBC", color: "rose" },
      ],
      text: "But triangle DBC is only part of triangle ACB, and a part cannot equal the whole.",
    },
    {
      id: "reverse-assumption",
      highlight: ["segmentAB", "segmentAC"],
      highlightStyles: [
        { target: "segmentAB", color: "green" },
        { target: "segmentAC", color: "green" },
      ],
      text: "So AB is not unequal to AC. Therefore AB is equal to AC, as required.",
    },
  ],
};
