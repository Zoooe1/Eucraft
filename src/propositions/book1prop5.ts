import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop5: Proposition = {
  id: "I.5",
  book: "Book I",
  number: 5,
  title: "Isosceles Base Angles",
  subtitle: "Build the Elements",
  playerGoal: "Produce the equal sides of an isosceles triangle and reveal why the base angles match.",
  originalStatement:
    "For isosceles triangles, the angles at the base are equal to one another, and if the equal sides are produced then the angles under the base will be equal to one another.",
  instruction: "Use Extend Line on AB and AC, producing each equal side beyond the base.",
  initialObjects: [
    { id: "A", type: "point", x: 430, y: 140, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 260, y: 420, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 600, y: 420, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "red", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "blue", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "black", given: true, source: "given" },
  ],
  allowedTools: ["point", "straightedge", "extend"],
  pointLabelSequence: ["D", "E", "F", "G", "H", "K", "L"],
  nextPropositionId: "I.6",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-isosceles",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      text: "Let ABC be isosceles, with AB = AC.",
    },
    {
      id: "produce-sides",
      highlight: ["extensionAB", "extensionAC", "segmentAB", "segmentAC"],
      text: "Produce AB and AC beyond B and C. [Post. 2]",
    },
    {
      id: "auxiliary-cut",
      highlight: ["extensionAB", "extensionAC"],
      text: "Take a random point on one extension, and cut off an equal part on the other. [Prop. I.3]",
    },
    {
      id: "first-sas",
      highlight: ["segmentAB", "segmentAC"],
      text: "Using the equal sides and the common angle at A, I.4 matches the larger auxiliary triangles.",
    },
    {
      id: "subtract",
      highlight: ["segmentAB", "segmentAC", "segmentBC"],
      text: "Subtract equal angles from equal angles; the remainders at B and C are equal. [C.N. 3]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointB", "pointC"],
      text: "Thus the base angles of an isosceles triangle are equal, and so are the angles under the base.",
    },
  ],
};
