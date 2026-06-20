import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop10: Proposition = {
  id: "I.10",
  book: "Book I",
  number: 10,
  title: "Bisect Segment",
  subtitle: "Build the Elements",
  playerGoal: "Cut the given finite straight-line AB in half.",
  originalStatement: "To cut a given finite straight-line in half.",
  instruction:
    "Build equilateral triangle ABC on AB, bisect angle ACB with CD, then use SAS on triangles ACD and BCD.",
  initialObjects: [
    { id: "A", type: "point", x: 240, y: 360, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 640, y: 360, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", given: true, source: "given" },
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
    "theorem-sss",
    "theorem-bisect-angle",
  ],
  validationGoal: {
    id: "validateSegmentBisectionBySAS",
    description: "Construct equilateral ABC, bisect angle ACB with CD meeting AB at D, and prove AD = DB by SAS.",
    hiddenConstraints: ["usesAngleBisector", "usesSAS", "noMidpointShortcut"],
  },
  pointLabelSequence: ["C", "D", "E", "F", "G", "H", "K", "L", "M"],
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "equilateral-sides",
      highlight: ["segmentAC", "segmentBC", "pointC"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentBC", color: "red" },
      ],
      text: "AC = CB because ABC is equilateral.",
    },
    {
      id: "common-side",
      highlight: ["segmentCD", "pointC", "pointD"],
      highlightStyles: [{ target: "segmentCD", color: "gold" }],
      text: "CD = CD because it is common to both triangles.",
    },
    {
      id: "bisected-angle",
      highlight: ["segmentAC", "segmentBC", "segmentCD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentBC", color: "blue" },
        { target: "segmentCD", color: "gold" },
      ],
      angleHighlights: [
        { points: ["A", "C", "D"], color: "blue", amplifyVertex: true },
        { points: ["D", "C", "B"], color: "blue", amplifyVertex: true, radius: 34 },
      ],
      text: "Angle ACD equals angle DCB because CD bisects angle ACB.",
    },
    {
      id: "sas-parts",
      highlight: ["segmentAC", "segmentBC", "segmentCD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentBC", color: "red" },
        { target: "segmentCD", color: "gold" },
      ],
      angleHighlights: [
        { points: ["A", "C", "D"], color: "blue", amplifyVertex: true },
        { points: ["B", "C", "D"], color: "blue", amplifyVertex: true, radius: 34 },
      ],
      text: "Therefore triangles ACD and BCD have two corresponding sides and the included angle equal.",
    },
    {
      id: "sas",
      highlight: ["segmentAC", "segmentBC", "segmentCD", "segmentAB", "segmentAD", "segmentBD", "pointD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentBC", color: "red" },
        { target: "segmentCD", color: "gold" },
        { target: "segmentAD", color: "green" },
        { target: "segmentBD", color: "green" },
      ],
      angleHighlights: [
        { points: ["A", "C", "D"], color: "blue", amplifyVertex: true },
        { points: ["B", "C", "D"], color: "blue", amplifyVertex: true, radius: 34 },
      ],
      text: "By SAS, AD = DB.",
    },
    {
      id: "cuts-equal-parts",
      highlight: ["segmentAB", "segmentAD", "segmentBD", "pointD"],
      highlightStyles: [
        { target: "segmentAB", color: "gold" },
        { target: "segmentAD", color: "green" },
        { target: "segmentBD", color: "green" },
      ],
      text: "Since D lies on AB, D cuts AB into two equal parts.",
    },
    {
      id: "bisects-segment",
      highlight: ["segmentAB", "pointA", "pointB", "pointD"],
      highlightStyles: [{ target: "segmentAB", color: "gold" }],
      text: "Thus AB is bisected at D.",
    },
  ],
};
