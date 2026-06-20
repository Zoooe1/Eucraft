import type { Proposition } from "../geometry/types";
import { book1Prop1 } from "./book1prop1";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop2: Proposition = {
  id: "I.2",
  book: "Book I",
  number: 2,
  title: "Place an Equal Straight-Line",
  subtitle: "Build the Elements",
  playerGoal: "At point A, place a straight-line equal to the given straight-line BC.",
  originalStatement: "To place a straight-line equal to a given straight-line at a given point (as an extremity).",
  instruction: "Use the result of Proposition I.1, the compass, and the straightedge to place a copy of BC at A.",
  initialObjects: [
    {
      id: "A",
      type: "point",
      x: 250,
      y: 330,
      label: "A",
      fixed: true,
      createdBy: "given",
      color: "red",
    },
    {
      id: "B",
      type: "point",
      x: 500,
      y: 330,
      label: "B",
      fixed: true,
      createdBy: "given",
      color: "blue",
    },
    {
      id: "C",
      type: "point",
      x: 660,
      y: 330,
      label: "C",
      fixed: true,
      createdBy: "given",
      color: "gold",
    },
    {
      id: "BC",
      type: "segment",
      p1: "B",
      p2: "C",
      label: "BC",
      color: "black",
      given: true,
      source: "given",
    },
  ],
  allowedTools: ["point", "straightedge", "compass", "intersection"],
  pointLabelSequence: ["D", "G", "L", "E", "F", "H", "K", "M", "N", "O", "P", "Q", "R", "S", "T"],
  nextPropositionId: "I.3",
  lawSections: book1Prop1.lawSections,
  replaySteps: [
    {
      id: "given",
      highlight: ["pointA", "segmentBC", "pointB", "pointC"],
      text: "Let A be the given point, and BC the given straight-line.",
    },
    {
      id: "join-and-triangle",
      highlight: ["segmentAB", "pointA", "pointB", "pointD", "segmentAD", "segmentBD"],
      text: "Join AB, and construct equilateral triangle DAB on AB. [Post. 1, Prop. I.1]",
    },
    {
      id: "produce-and-circle-b",
      highlight: ["segmentAD", "segmentBD", "circleB", "segmentBC", "pointG"],
      text: "Produce DA and DB; draw circle CGH with center B and radius BC. [Post. 2, 3]",
    },
    {
      id: "circle-d",
      highlight: ["circleD", "pointD", "pointG", "pointL"],
      text: "Draw circle GKL with center D and radius DG. [Post. 3]",
    },
    {
      id: "radius-b",
      highlight: ["circleB", "segmentBC", "segmentBG", "pointB", "pointC", "pointG"],
      text: "Since B is center of circle CGH, BC = BG. [Def. 1.15]",
    },
    {
      id: "subtract",
      highlight: ["circleD", "segmentDL", "segmentDG", "segmentAD", "segmentBD", "segmentAL", "segmentBG"],
      text: "Since D is center of circle GKL, DL = DG; and DA = DB.",
    },
    {
      id: "remainders",
      highlight: ["segmentAL", "segmentBG", "segmentAD", "segmentBD"],
      text: "Subtract equals DA and DB; the remainders AL and BG are equal. [C.N. 3]",
    },
    {
      id: "conclusion",
      highlight: ["segmentAL", "segmentBC", "pointA", "pointL"],
      text: "AL and BC each equal BG; therefore AL = BC. [C.N. 1]",
    },
  ],
};
