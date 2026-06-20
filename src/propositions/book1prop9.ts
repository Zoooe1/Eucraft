import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop9: Proposition = {
  id: "I.9",
  book: "Book I",
  number: 9,
  title: "Bisect Angle",
  subtitle: "Build the Elements",
  playerGoal: "Cut the given rectilinear angle BAC in half.",
  originalStatement: "To cut a given rectilinear angle in half.",
  instruction:
    "Choose D on AB, cut AE on AC equal to AD, join DE, build equilateral DEF, then join A to F.",
  initialObjects: [
    { id: "A", type: "point", x: 410, y: 430, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 170, y: 430, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 640, y: 220, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", given: true, ray: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "black", given: true, ray: true, source: "given" },
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
  ],
  validationGoal: {
    id: "validateAngleBisectionByEuclid",
    description: "Cut equal points on the angle sides, construct equilateral DEF, join AF, and prove the two angles equal with SSS.",
    hiddenConstraints: ["noAngleBisectorShortcut", "usesSSS"],
  },
  pointLabelSequence: ["D", "E", "F", "G", "H", "K", "L", "M", "N"],
  nextPropositionId: "I.10",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "copy-length",
      highlight: ["segmentAD", "segmentAE", "pointD", "pointE"],
      highlightStyles: [
        { target: "segmentAD", color: "red" },
        { target: "segmentAE", color: "red" },
      ],
      text: "AE = AD by the Copy Length construction.",
    },
    {
      id: "equilateral-sides",
      highlight: ["segmentDE", "segmentDF", "segmentEF", "pointF"],
      highlightStyles: [
        { target: "segmentDF", color: "blue" },
        { target: "segmentEF", color: "blue" },
        { target: "segmentDE", color: "gold" },
      ],
      text: "DF = EF because DEF is equilateral.",
    },
    {
      id: "common-side",
      highlight: ["segmentAF", "pointA", "pointF"],
      highlightStyles: [{ target: "segmentAF", color: "gold" }],
      text: "AF = AF because it is common to both triangles.",
    },
    {
      id: "three-sides",
      highlight: ["segmentAD", "segmentAE", "segmentDF", "segmentEF", "segmentAF"],
      highlightStyles: [
        { target: "segmentAD", color: "red" },
        { target: "segmentAE", color: "red" },
        { target: "segmentDF", color: "blue" },
        { target: "segmentEF", color: "blue" },
        { target: "segmentAF", color: "gold" },
      ],
      text: "Therefore triangles DAF and EAF have three corresponding sides equal.",
    },
    {
      id: "sss-angles",
      highlight: ["segmentAD", "segmentAE", "segmentDF", "segmentEF", "segmentAF"],
      highlightStyles: [
        { target: "segmentAD", color: "red" },
        { target: "segmentAE", color: "red" },
        { target: "segmentDF", color: "blue" },
        { target: "segmentEF", color: "blue" },
        { target: "segmentAF", color: "gold" },
      ],
      angleHighlights: [
        { points: ["D", "A", "F"], color: "green", amplifyVertex: true },
        { points: ["E", "A", "F"], color: "green", amplifyVertex: true, radius: 34 },
      ],
      text: "By SSS, angle DAF equals angle EAF.",
    },
    {
      id: "d-on-ray",
      highlight: ["segmentAB", "segmentAD", "segmentAF", "pointD"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAD", color: "red" },
        { target: "segmentAF", color: "gold" },
      ],
      angleHighlights: [
        { points: ["D", "A", "F"], color: "green", amplifyVertex: true },
        { points: ["B", "A", "F"], color: "gold", amplifyVertex: true, radius: 54 },
      ],
      text: "Since D lies on ray AB, angle DAF equals angle BAF.",
    },
    {
      id: "e-on-ray",
      highlight: ["segmentAC", "segmentAE", "segmentAF", "pointE"],
      highlightStyles: [
        { target: "segmentAC", color: "blue" },
        { target: "segmentAE", color: "blue" },
        { target: "segmentAF", color: "gold" },
      ],
      angleHighlights: [
        { points: ["E", "A", "F"], color: "green", amplifyVertex: true },
        { points: ["F", "A", "C"], color: "gold", amplifyVertex: true, radius: 54 },
      ],
      text: "Since E lies on ray AC, angle EAF equals angle FAC.",
    },
    {
      id: "equal-halves",
      highlight: ["segmentAB", "segmentAC", "segmentAF", "pointA"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentAF", color: "gold" },
      ],
      angleHighlights: [
        { points: ["B", "A", "F"], color: "green", amplifyVertex: true },
        { points: ["F", "A", "C"], color: "green", amplifyVertex: true, radius: 54 },
      ],
      text: "Therefore angle BAF equals angle FAC.",
    },
    {
      id: "bisects-angle",
      highlight: ["segmentAF", "segmentAB", "segmentAC", "pointA"],
      highlightStyles: [
        { target: "segmentAF", color: "gold" },
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "blue" },
      ],
      angleHighlights: [
        { points: ["B", "A", "F"], color: "green", amplifyVertex: true },
        { points: ["F", "A", "C"], color: "green", amplifyVertex: true, radius: 54 },
        { points: ["B", "A", "C"], color: "gold", radius: 72 },
      ],
      text: "Thus AF bisects angle BAC.",
    },
  ],
};
