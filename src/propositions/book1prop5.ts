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
  instruction: "Extend AB and AC, place F beyond B, cut AG equal to AF, join FC and GB, then use SAS twice.",
  type: "theorem",
  challengeType: "construct",
  userTask:
    "Extend the equal sides, cut equal auxiliary lengths, join the crossed lines, and prove the two required congruences with SAS.",
  initialObjects: [
    { id: "A", type: "point", x: 430, y: 95, label: "A", fixed: true, createdBy: "given", color: "red" },
    { id: "B", type: "point", x: 300, y: 450, label: "B", fixed: true, createdBy: "given", color: "blue" },
    { id: "C", type: "point", x: 560, y: 450, label: "C", fixed: true, createdBy: "given", color: "blue" },
    { id: "AB", type: "segment", p1: "A", p2: "B", label: "AB", color: "red", given: true, source: "given" },
    { id: "AC", type: "segment", p1: "A", p2: "C", label: "AC", color: "red", given: true, source: "given" },
    { id: "BC", type: "segment", p1: "B", p2: "C", label: "BC", color: "black", given: true, source: "given" },
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
  pointLabelSequence: ["F", "G", "D", "E", "H", "K", "L"],
  validationGoal: {
    id: "validateIsoscelesBaseAngles",
    description: "Extend AB and AC, cut AG equal to AF, join FC and GB, and apply SAS to the two Euclidean triangle pairs.",
    hiddenConstraints: ["noSSS", "subtractEquals", "sasOnly"],
  },
  nextPropositionId: "I.6",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given-isosceles",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "red" },
      ],
      angleHighlights: [
        { points: ["A", "B", "C"], color: "gold", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "gold", amplifyVertex: true },
      ],
      text: "Let ABC be an isosceles triangle with AB equal to AC. The goal is ABC = ACB, and under the base CBD = BCE.",
    },
    {
      id: "produce-sides",
      highlight: ["extensionAB", "extensionAC", "segmentAB", "segmentAC"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "red" },
        { target: "extensionAB", color: "rose" },
        { target: "extensionAC", color: "rose" },
      ],
      text: "Produce BD in a straight-line with AB, and CE in a straight-line with AC. [Post. 2]",
    },
    {
      id: "take-f",
      highlight: ["extensionAB", "pointF"],
      text: "Take F on the produced line AB beyond B.",
    },
    {
      id: "cut-g",
      highlight: ["segmentAF", "segmentAG", "pointG"],
      highlightStyles: [
        { target: "segmentAF", color: "blue" },
        { target: "segmentAG", color: "blue" },
      ],
      text: "Copy AF onto the produced line AC, making AG equal to AF.",
    },
    {
      id: "join-cross-lines",
      highlight: ["segmentFC", "segmentGB"],
      text: "Join F to C and G to B. [Post. 1]",
    },
    {
      id: "first-sas",
      highlight: ["segmentAF", "segmentAG", "segmentAC", "segmentAB"],
      highlightStyles: [
        { target: "segmentAF", color: "blue" },
        { target: "segmentAG", color: "blue" },
        { target: "segmentAC", color: "red" },
        { target: "segmentAB", color: "red" },
      ],
      angleHighlights: [{ points: ["F", "A", "G"], color: "gold", amplifyVertex: true }],
      text: "AF = AG and AC = AB, and they encompass the common angle FAG. Thus FC = GB, triangle AFC equals triangle AGB, and ACF = ABG and AFC = AGB. [Prop. I.4]",
    },
    {
      id: "derive-first-parts",
      highlight: ["segmentFC", "segmentGB"],
      highlightStyles: [
        { target: "segmentFC", color: "teal" },
        { target: "segmentGB", color: "teal" },
      ],
      angleHighlights: [
        { points: ["A", "C", "F"], color: "rose", amplifyVertex: true },
        { points: ["A", "B", "G"], color: "rose", amplifyVertex: true },
        { points: ["A", "F", "C"], color: "violet", amplifyVertex: true, radius: 34 },
        { points: ["A", "G", "B"], color: "violet", amplifyVertex: true, radius: 34 },
      ],
      text: "The first SAS result gives FC = GB, angle ACF = ABG, and angle AFC = AGB.",
    },
    {
      id: "subtract-segments",
      highlight: ["segmentAF", "segmentAG", "segmentAB", "segmentAC", "segmentBF", "segmentCG"],
      highlightStyles: [
        { target: "segmentAF", color: "blue" },
        { target: "segmentAG", color: "blue" },
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "red" },
        { target: "segmentBF", color: "green" },
        { target: "segmentCG", color: "green" },
      ],
      text: "Since the whole AF equals the whole AG, and AB equals AC within them, the remainders BF and CG are equal. [C.N. 3]",
    },
    {
      id: "second-sas",
      highlight: ["segmentBF", "segmentCG", "segmentFC", "segmentGB", "segmentBC"],
      highlightStyles: [
        { target: "segmentBF", color: "green" },
        { target: "segmentCG", color: "green" },
        { target: "segmentFC", color: "teal" },
        { target: "segmentGB", color: "teal" },
        { target: "segmentBC", color: "gold" },
      ],
      angleHighlights: [
        { points: ["B", "F", "C"], color: "violet", amplifyVertex: true },
        { points: ["C", "G", "B"], color: "violet", amplifyVertex: true },
      ],
      text: "BF = CG, FC = GB, and angle BFC = CGB, with BC as the common base. Thus triangle BFC equals triangle CGB. [Prop. I.4]",
    },
    {
      id: "base-angles",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "segmentFC", "segmentGB"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "red" },
        { target: "segmentFC", color: "teal" },
        { target: "segmentGB", color: "teal" },
      ],
      angleHighlights: [
        { points: ["F", "B", "C"], color: "gold", amplifyVertex: true },
        { points: ["G", "C", "B"], color: "gold", amplifyVertex: true },
        { points: ["C", "B", "G"], color: "rose", radius: 34 },
        { points: ["B", "C", "F"], color: "rose", radius: 34 },
        { points: ["A", "B", "C"], color: "green", amplifyVertex: true, radius: 50 },
        { points: ["A", "C", "B"], color: "green", amplifyVertex: true, radius: 50 },
      ],
      text: "From the second SAS result, FBC = GCB and BCF = CBG. Since whole ABG = ACF, subtract the equal parts CBG and BCF to get ABC = ACB. [C.N. 3]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointB", "pointC"],
      highlightStyles: [
        { target: "segmentAB", color: "red" },
        { target: "segmentAC", color: "red" },
      ],
      angleHighlights: [
        { points: ["A", "B", "C"], color: "green", amplifyVertex: true },
        { points: ["A", "C", "B"], color: "green", amplifyVertex: true },
        { points: ["F", "B", "C"], color: "gold", radius: 34 },
        { points: ["G", "C", "B"], color: "gold", radius: 34 },
      ],
      text: "Therefore the angles at the base are equal, and the angles under the base are equal. This is what was required to show.",
    },
  ],
};
