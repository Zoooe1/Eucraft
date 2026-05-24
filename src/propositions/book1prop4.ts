import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop4: Proposition = {
  id: "I.4",
  book: "Book I",
  number: 4,
  title: "SAS Triangle Match",
  subtitle: "Build the Elements",
  playerGoal: "Complete the two triangle bases and watch why SAS forces the triangles to match.",
  originalStatement:
    "If two triangles have two sides equal to two sides, respectively, and have the angles enclosed by the equal straight-lines equal, then they will also have the base equal to the base.",
  instruction: "Use the straightedge to join B to C and E to F. Then check the theorem diagram.",
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
  nextPropositionId: "I.5",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-sas",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF", "pointA", "pointD"],
      text: "Let ABC and DEF have AB = DE, AC = DF, and angle BAC = EDF.",
    },
    {
      id: "apply-first-side",
      highlight: ["segmentAB", "segmentDE", "pointA", "pointB", "pointD", "pointE"],
      text: "Apply A to D and AB to DE; B coincides with E because AB = DE.",
    },
    {
      id: "apply-angle",
      highlight: ["segmentAC", "segmentDF", "pointC", "pointF"],
      text: "The equal included angle carries AC onto DF; C coincides with F because AC = DF.",
    },
    {
      id: "base-coincides",
      highlight: ["segmentBC", "segmentEF", "pointB", "pointC", "pointE", "pointF"],
      text: "With B on E and C on F, the base BC coincides with EF. Otherwise two straight-lines enclose an area. [Post. 1]",
    },
    {
      id: "conclusion",
      highlight: ["segmentBC", "segmentEF", "segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      text: "Therefore BC = EF, the triangles are equal, and the remaining angles match. [C.N. 4]",
    },
  ],
};
