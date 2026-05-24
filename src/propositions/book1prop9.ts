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
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "black", given: true, source: "given" },
  ],
  allowedTools: ["point", "straightedge", "extend", "compass", "compass-transfer", "intersection"],
  pointLabelSequence: ["D", "E", "F", "G", "H", "K", "L", "M", "N"],
  nextPropositionId: "I.10",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-angle",
      highlight: ["segmentAB", "segmentAC", "pointA", "pointB", "pointC"],
      text: "Let BAC be the given rectilinear angle.",
    },
    {
      id: "take-d",
      highlight: ["segmentAB", "pointD"],
      text: "Take D at random on AB.",
    },
    {
      id: "cut-e",
      highlight: ["segmentAD", "segmentAE", "pointD", "pointE"],
      text: "Cut AE from AC equal to AD. [Prop. I.3]",
    },
    {
      id: "equilateral",
      highlight: ["segmentDE", "segmentDF", "segmentEF", "pointF"],
      text: "Join DE and construct equilateral triangle DEF on DE. [Post. 1, Prop. I.1]",
    },
    {
      id: "join-af",
      highlight: ["segmentAF", "pointA", "pointF"],
      text: "Join AF. [Post. 1]",
    },
    {
      id: "sss",
      highlight: ["segmentAD", "segmentAE", "segmentDF", "segmentEF", "segmentAF"],
      text: "AD = AE, DF = EF, and AF is common; I.8 gives angle DAF = EAF.",
    },
    {
      id: "conclusion",
      highlight: ["segmentAF", "segmentAB", "segmentAC", "pointA"],
      text: "Therefore AF cuts the given angle BAC in half.",
    },
  ],
};
