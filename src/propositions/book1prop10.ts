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
    "Build an equilateral triangle on AB, bisect its apex angle, then mark where the bisector meets AB.",
  initialObjects: [
    { id: "A", type: "point", x: 240, y: 360, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 640, y: 360, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", given: true, source: "given" },
  ],
  allowedTools: ["point", "straightedge", "extend", "compass", "compass-transfer", "intersection"],
  pointLabelSequence: ["C", "D", "E", "F", "G", "H", "K", "L", "M"],
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-line",
      highlight: ["segmentAB", "pointA", "pointB"],
      text: "Let AB be the given finite straight-line.",
    },
    {
      id: "equilateral",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointC"],
      text: "Construct equilateral triangle ABC on AB. [Prop. I.1]",
    },
    {
      id: "bisect-angle",
      highlight: ["segmentCD", "pointC", "pointD"],
      text: "Cut angle ACB in half by CD. [Prop. I.9]",
    },
    {
      id: "equal-sides",
      highlight: ["segmentAC", "segmentBC", "segmentCD"],
      text: "AC = CB, CD is common, and angle ACD = BCD.",
    },
    {
      id: "sas",
      highlight: ["segmentAC", "segmentBC", "segmentCD"],
      text: "By I.4, triangles ACD and BCD match; therefore AD = DB.",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentCD", "pointD"],
      text: "Thus AB has been cut in half at D.",
    },
  ],
};
