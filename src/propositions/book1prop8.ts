import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop8: Proposition = {
  id: "I.8",
  book: "Book I",
  number: 8,
  title: "SSS Triangle Match",
  subtitle: "Build the Elements",
  playerGoal: "Complete the two triangle bases and reveal why three matching sides force the included angles to match.",
  originalStatement:
    "If two triangles have two sides equal to two sides, respectively, and also have the base equal to the base, then they will also have equal the angles encompassed by the equal straight-lines.",
  instruction: "Use the straightedge to join B to C and E to F. Then check the SSS diagram.",
  initialObjects: [
    { id: "A", type: "point", x: 240, y: 250, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 150, y: 430, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 390, y: 430, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "D", type: "point", x: 560, y: 250, label: "D", fixed: true, createdBy: "given", color: "red" },
    { id: "E", type: "point", x: 470, y: 430, label: "E", fixed: true, createdBy: "given", color: "blue" },
    { id: "F", type: "point", x: 710, y: 430, label: "F", fixed: true, createdBy: "given", color: "gold" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "red", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "blue", given: true, source: "given" },
    { id: "DE", type: "segment", p1: "D", p2: "E", label: "DE", color: "red", given: true, source: "given" },
    { id: "DF", type: "segment", p1: "D", p2: "F", label: "DF", color: "blue", given: true, source: "given" },
  ],
  allowedTools: ["point", "straightedge"],
  pointLabelSequence: ["G", "H", "K", "L", "M", "N"],
  nextPropositionId: "I.9",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-sss",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "segmentDE", "segmentDF", "segmentEF"],
      text: "Let ABC and DEF have AB = DE, AC = DF, and base BC = EF.",
    },
    {
      id: "apply-base",
      highlight: ["segmentBC", "segmentEF", "pointB", "pointC", "pointE", "pointF"],
      text: "Apply base BC to EF; B coincides with E and C with F.",
    },
    {
      id: "uniqueness",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      text: "If A did not fall on D, there would be another same-side point with the same two distances.",
    },
    {
      id: "prop-seven",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      text: "Proposition I.7 forbids that duplicate point. So the sides coincide.",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF", "pointA", "pointD"],
      text: "Therefore angle BAC coincides with angle EDF and is equal to it. [C.N. 4]",
    },
  ],
};
