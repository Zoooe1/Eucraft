import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop7: Proposition = {
  id: "I.7",
  book: "Book I",
  number: 7,
  title: "Unique Point from Two Distances",
  subtitle: "Build the Elements",
  playerGoal: "Build the hypothetical duplicate-vertex structure and watch Euclid rule it out.",
  originalStatement:
    "On the same straight-line, two other straight-lines equal, respectively, to two given straight-lines cannot be constructed meeting at a different point on the same side, but having the same ends.",
  instruction: "Place C and D on the same side of AB, join both to A and B, then join CD.",
  type: "theorem",
  challengeType: "derive",
  userTask:
    "Freely build the impossible same-side duplicate, then name the contradiction.",
  initialObjects: [
    { id: "A", type: "point", x: 260, y: 430, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 620, y: 430, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "AB-line", type: "segment", p1: "A", p2: "B", label: "AB", color: "black", source: "given", createdBy: "given" },
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
      id: "prop7-no-such-d",
      actionType: "compare-objects",
      description: "State that no second same-side point D can have AC = AD and BC = BD.",
    },
  ],
  validationGoal: {
    id: "validateDuplicateVertexContradiction",
    description: "Build C and D on the same side of AB, connect all required segments, and state that the duplicate point cannot exist.",
    minimumUserActions: ["prop7-no-such-d"],
    hiddenConstraints: ["sameSideOfAB", "hypotheticalDuplicate", "notMetricEquality"],
  },
  pointLabelSequence: ["C", "D", "E", "F", "G", "H", "K", "L"],
  nextPropositionId: "I.8",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "assumption",
      highlight: ["segmentAC", "segmentAD", "segmentBC", "segmentBD", "pointC", "pointD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentAD", color: "red" },
        { target: "segmentBC", color: "blue" },
        { target: "segmentBD", color: "blue" },
      ],
      text: "If possible, let C and D be different points on the same side of AB, with AC = AD and BC = BD.",
    },
    {
      id: "join",
      highlight: ["segmentCD", "pointC", "pointD"],
      text: "Join CD. [Post. 1]",
    },
    {
      id: "first-isosceles",
      highlight: ["segmentAC", "segmentAD", "segmentCD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentAD", color: "red" },
        { target: "segmentCD", color: "gold" },
      ],
      angleHighlights: [
        { points: ["A", "C", "D"], color: "gold", amplifyVertex: true },
        { points: ["C", "D", "A"], color: "gold", amplifyVertex: true },
      ],
      text: "Since AC = AD, angle ACD is equal to angle ADC. [Prop. I.5]",
    },
    {
      id: "greater-angle",
      highlight: ["segmentBC", "segmentBD", "segmentCD"],
      highlightStyles: [
        { target: "segmentBC", color: "blue" },
        { target: "segmentBD", color: "blue" },
        { target: "segmentCD", color: "gold" },
      ],
      angleHighlights: [
        { points: ["C", "D", "B"], color: "rose", amplifyVertex: true, radius: 52 },
        { points: ["D", "C", "B"], color: "violet", amplifyVertex: true, radius: 34 },
      ],
      text: "But angle ADC is a whole angle, so it is greater than the part angle DCB. Hence CDB is much greater than DCB. [C.N. 5]",
    },
    {
      id: "second-isosceles",
      highlight: ["segmentBC", "segmentBD", "segmentCD"],
      highlightStyles: [
        { target: "segmentBC", color: "blue" },
        { target: "segmentBD", color: "blue" },
        { target: "segmentCD", color: "gold" },
      ],
      angleHighlights: [
        { points: ["B", "C", "D"], color: "green", amplifyVertex: true },
        { points: ["C", "D", "B"], color: "green", amplifyVertex: true },
      ],
      text: "Again, since BC = BD, angle BCD is equal to angle CDB. [Prop. I.5]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAC", "segmentAD", "segmentBC", "segmentBD"],
      highlightStyles: [
        { target: "segmentAC", color: "red" },
        { target: "segmentAD", color: "red" },
        { target: "segmentBC", color: "blue" },
        { target: "segmentBD", color: "blue" },
      ],
      text: "The same angle was shown both much greater than and equal to the other. That is impossible, so the second same-side point cannot exist.",
    },
  ],
};
