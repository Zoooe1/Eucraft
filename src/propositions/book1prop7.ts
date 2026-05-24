import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop7: Proposition = {
  id: "I.7",
  book: "Book I",
  number: 7,
  title: "Unique Point from Two Distances",
  subtitle: "Build the Elements",
  playerGoal: "Join the two supposed apex points and watch Euclid rule out the duplicate configuration.",
  originalStatement:
    "On the same straight-line, two other straight-lines equal, respectively, to two given straight-lines cannot be constructed meeting at a different point on the same side, but having the same ends.",
  instruction: "Use the straightedge to join C and D. The replay tests this impossible same-side assumption.",
  initialObjects: [
    { id: "A", type: "point", x: 260, y: 430, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 620, y: 430, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 420, y: 190, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "D", type: "point", x: 500, y: 250, label: "D", fixed: true, createdBy: "given", color: "gold" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "red", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "blue", given: true, source: "given" },
    { id: "AD", type: "segment", p1: "A", p2: "D", label: "AD", color: "red", given: true, source: "given" },
    { id: "BD", type: "segment", p1: "B", p2: "D", label: "BD", color: "blue", given: true, source: "given" },
  ],
  allowedTools: ["point", "straightedge"],
  pointLabelSequence: ["E", "F", "G", "H", "K", "L"],
  nextPropositionId: "I.8",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "assumption",
      highlight: ["segmentAC", "segmentAD", "segmentBC", "segmentBD", "pointC", "pointD"],
      text: "Assume C and D are two different same-side points with AC = AD and BC = BD.",
    },
    {
      id: "join",
      highlight: ["segmentCD", "pointC", "pointD"],
      text: "Join CD. [Post. 1]",
    },
    {
      id: "first-isosceles",
      highlight: ["segmentAC", "segmentAD", "segmentCD"],
      text: "Since AC = AD, I.5 gives equal angles in triangle ACD.",
    },
    {
      id: "greater-angle",
      highlight: ["segmentBC", "segmentBD", "segmentCD"],
      text: "The angle at D is then greater than the angle at C.",
    },
    {
      id: "second-isosceles",
      highlight: ["segmentBC", "segmentBD", "segmentCD"],
      text: "But BC = BD also makes those same angles equal by I.5.",
    },
    {
      id: "conclusion",
      highlight: ["segmentAC", "segmentAD", "segmentBC", "segmentBD"],
      text: "The same angle cannot be both greater and equal. So the second same-side point cannot exist.",
    },
  ],
};
