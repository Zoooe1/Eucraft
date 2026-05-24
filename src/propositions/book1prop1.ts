import type { Proposition } from "../geometry/types";

// Proposition text follows the user-supplied Richard Fitzpatrick translation PDF.
export const book1Prop1: Proposition = {
  id: "I.1",
  book: "Book I",
  number: 1,
  title: "Equilateral Triangle",
  subtitle: "Build the Elements",
  playerGoal: "Build a triangle on AB where all three sides are equal.",
  originalStatement: "To construct an equilateral triangle on a given finite straight-line.",
  instruction: "Use Euclid's tools to construct the figure, then reveal why it must be true.",
  initialObjects: [
    {
      id: "A",
      type: "point",
      x: 220,
      y: 320,
      label: "A",
      fixed: true,
      color: "red",
    },
    {
      id: "B",
      type: "point",
      x: 520,
      y: 320,
      label: "B",
      fixed: true,
      color: "blue",
    },
    {
      id: "AB",
      type: "segment",
      p1: "A",
      p2: "B",
      label: "AB",
      color: "black",
      given: true,
      source: "given",
    },
  ],
  allowedTools: ["select", "straightedge", "extend", "compass", "intersection"],
  pointLabelSequence: ["C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  nextPropositionId: "I.2",
  lawSections: [
    {
      title: "POSTULATES.",
      items: [
        "A straight line can be drawn connecting any two points.",
        "Any finite straight line can be extended indefinitely in a straight line.",
        "A circle can be drawn with any given center and radius.",
        "All right angles are equal to one another.",
        "If a straight line intersects two other straight lines such that the interior angles on the same side add up to less than two right angles, the two lines will eventually intersect on that side if extended indefinitely.",
      ],
    },
    {
      title: "AXIOMS",
      items: [
        "Magnitudes which are equal to the same are equal to each other.",
        "If equals be added to equals the sums will be equal.",
        "If equals be subtracted from equals the remainder will be equal.",
        "Things which coincide with one another equal one another.",
        "The whole is greater than the part.",
      ],
    },
  ],
  replaySteps: [
    {
      id: "given-line",
      highlight: ["segmentAB", "pointA", "pointB"],
      text: "Let AB be the given finite straight-line.",
    },
    {
      id: "circle-a",
      highlight: ["circleA", "segmentAB", "pointA", "pointB"],
      text: "Draw circle BCD with center A and radius AB. [Post. 3]",
    },
    {
      id: "circle-b",
      highlight: ["circleB", "segmentAB", "pointA", "pointB"],
      text: "Draw circle ACE with center B and radius BA. [Post. 3]",
    },
    {
      id: "join-c",
      highlight: ["circleA", "circleB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      text: "Let C be where the circles cut. Join CA and CB. [Post. 1]",
    },
    {
      id: "radius-a",
      highlight: ["circleA", "segmentAC", "segmentAB", "pointA", "pointB", "pointC"],
      text: "A is center of circle CDB; therefore AC = AB. [Def. 1.15]",
    },
    {
      id: "radius-b",
      highlight: ["circleB", "segmentBC", "segmentAB", "pointA", "pointB", "pointC"],
      text: "B is center of circle CAE; therefore BC = BA. [Def. 1.15]",
    },
    {
      id: "equality-transfer",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      text: "CA and CB are each equal to AB; equals to the same are equal. [C.N. 1]",
    },
    {
      id: "euclidean-reveal",
      highlight: ["triangleABC", "segmentAB", "segmentAC", "segmentBC"],
      text: "Thus CA = AB = BC. Triangle ABC is equilateral on AB.",
    },
  ],
};
