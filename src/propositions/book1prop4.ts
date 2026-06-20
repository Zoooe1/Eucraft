import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop4: Proposition = {
  id: "I.4",
  book: "Book I",
  number: 4,
  title: "SAS Triangle Match",
  subtitle: "Build the Elements",
  playerGoal: "Move and rotate one triangle until it coincides with another triangle.",
  originalStatement:
    "If two triangles have two sides equal to two sides, respectively, and have the angles enclosed by the equal straight-lines equal, then they will also have the base equal to the base.",
  instruction: "Drag the left triangle to move it. Drag one of its vertices to rotate it until A, B, and C coincide with D, E, and F.",
  type: "theorem",
  challengeType: "arrange",
  userTask: "Make triangle ABC perfectly overlap triangle DEF without changing its shape.",
  initialObjects: [
    { id: "A", type: "point", x: 220, y: 210, label: "A", createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 105, y: 405, label: "B", createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 385, y: 380, label: "C", createdBy: "given", color: "gold" },
    { id: "D", type: "point", x: 580, y: 330, label: "D", fixed: true, createdBy: "given", color: "red", source: "target" },
    { id: "E", type: "point", x: 746.8, y: 483, label: "E", fixed: true, createdBy: "given", color: "blue", source: "target" },
    { id: "F", type: "point", x: 780.6, y: 203.9, label: "F", fixed: true, createdBy: "given", color: "gold", source: "target" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "red", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "blue", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "black", given: true, source: "given" },
    { id: "DE", type: "segment", p1: "D", p2: "E", label: "DE", color: "red", given: true, source: "target" },
    { id: "DF", type: "segment", p1: "D", p2: "F", label: "DF", color: "blue", given: true, source: "target" },
    { id: "EF", type: "segment", p1: "E", p2: "F", label: "EF", color: "black", given: true, source: "target" },
  ],
  allowedTools: ["arrange-triangle"],
  pointLabelSequence: ["G", "H", "K", "L", "M", "N"],
  nextPropositionId: "I.5",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-sas",
      highlight: ["segmentAB", "segmentDE", "segmentAC", "segmentDF", "pointA", "pointD"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
      ],
      angleHighlights: [
        { points: ["B", "A", "C"], color: "gold", amplifyVertex: true },
        { points: ["E", "D", "F"], color: "gold", amplifyVertex: true },
      ],
      text: "Let triangles ABC and DEF have AB = DE, AC = DF, and the enclosed angle BAC equal to EDF.",
    },
    {
      id: "apply-first-side",
      highlight: ["segmentAB", "segmentDE", "pointA", "pointB", "pointD", "pointE"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
      ],
      text: "Apply A to D and place AB along DE; B coincides with E because AB = DE.",
    },
    {
      id: "apply-angle",
      highlight: ["segmentAB", "segmentDE", "segmentAC", "segmentDF", "pointC", "pointF"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
      ],
      angleHighlights: [
        { points: ["B", "A", "C"], color: "gold", amplifyVertex: true },
        { points: ["E", "D", "F"], color: "gold", amplifyVertex: true },
      ],
      text: "With AB coinciding with DE, the equal angle BAC carries AC onto DF; C coincides with F because AC = DF.",
    },
    {
      id: "base-coincides",
      highlight: ["segmentBC", "segmentEF", "pointB", "pointC", "pointE", "pointF"],
      highlightStyles: [
        { target: "segmentBC", color: "teal" },
        { target: "segmentEF", color: "teal" },
      ],
      text: "With B on E and C on F, the base BC coincides with EF. Otherwise two straight-lines enclose an area. [Post. 1]",
    },
    {
      id: "conclusion",
      highlight: ["segmentBC", "segmentEF", "segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      highlightStyles: [
        { target: "segmentBC", color: "teal" },
        { target: "segmentEF", color: "teal" },
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
      ],
      angleHighlights: [
        { points: ["A", "B", "C"], color: "rose", amplifyVertex: true },
        { points: ["D", "E", "F"], color: "rose", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "violet", amplifyVertex: true, radius: 34 },
        { points: ["D", "F", "E"], color: "violet", amplifyVertex: true, radius: 34 },
      ],
      text: "Therefore BC = EF, triangle ABC equals triangle DEF, and the remaining angles ABC = DEF and ACB = DFE. [C.N. 4]",
    },
  ],
};
