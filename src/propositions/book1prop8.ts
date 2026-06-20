import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop8: Proposition = {
  id: "I.8",
  book: "Book I",
  number: 8,
  title: "SSS Triangle Match",
  subtitle: "Build the Elements",
  playerGoal: "Construct a second triangle with the same three side lengths, then overlap it with the original.",
  originalStatement:
    "If two triangles have two sides equal to two sides, respectively, and also have the base equal to the base, then they will also have equal the angles encompassed by the equal straight-lines.",
  instruction:
    "Use length-copying tools to make DEF match the three sides of ABC, then move and rotate DEF until it overlaps ABC.",
  type: "theorem",
  challengeType: "arrange",
  userTask:
    "Build triangle DEF from the three side lengths of ABC. After the side lengths match, use rigid motion to overlap the triangles.",
  initialObjects: [
    { id: "A", type: "point", x: 260, y: 160, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 120, y: 465, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 500, y: 410, label: "C", fixed: true, createdBy: "given", color: "gold" },
    { id: "D", type: "point", x: 520, y: 450, label: "D", createdBy: "given", color: "red" },
    { id: "E", type: "point", x: 855.5, y: 450, label: "E", createdBy: "given", color: "blue" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "red", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "blue", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "black", given: true, source: "given" },
    { id: "DE", type: "segment", p1: "D", p2: "E", label: "DE", color: "red", given: true, source: "given" },
  ],
  allowedTools: [
    "point",
    "arrange-triangle",
    "straightedge",
    "extend",
    "compass",
    "compass-transfer",
    "intersection",
    "theorem-equilateral",
    "theorem-sas",
  ],
  pointLabelSequence: ["F", "G", "H", "K", "L", "M", "N"],
  validationGoal: {
    id: "validateSSSOverlapChallenge",
    description: "Confirm DEF has the three corresponding side lengths of ABC and overlaps ABC by rigid motion.",
    hiddenConstraints: ["threeSideLengths", "rigidMotionOnly", "noSSSBeforeCompletion"],
  },
  nextPropositionId: "I.9",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-sss",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "segmentDE", "segmentDF", "segmentEF"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
        { target: "segmentBC", color: "teal" },
        { target: "segmentEF", color: "teal" },
      ],
      text: "Let ABC and DEF have AB = DE, AC = DF, and base BC = EF. I say that angle BAC equals angle EDF.",
    },
    {
      id: "apply-base",
      highlight: ["segmentBC", "segmentEF", "pointB", "pointC", "pointE", "pointF"],
      highlightStyles: [
        { target: "segmentBC", color: "teal" },
        { target: "segmentEF", color: "teal" },
      ],
      text: "Apply triangle ABC to triangle DEF by placing B on E and BC on EF; C also coincides with F because BC = EF.",
    },
    {
      id: "uniqueness",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
      ],
      text: "With BC on EF, the sides BA and CA must coincide with ED and DF. If not, they would miss like a second same-side apex.",
    },
    {
      id: "prop-seven",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentDE", color: "red" },
        { target: "segmentAC", color: "blue" },
        { target: "segmentDF", color: "blue" },
      ],
      text: "Such a second apex with the same two distances and same base cannot be constructed. [Prop. I.7]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentAC", "segmentDE", "segmentDF", "pointA", "pointD"],
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
      text: "Therefore BA and AC coincide with ED and DF, and angle BAC coincides with angle EDF. Thus the included angles are equal. [C.N. 4]",
    },
  ],
};
