import type { Proposition } from "../geometry/types";

export const book1Prop1: Proposition = {
  id: "I.1",
  book: "Book I",
  number: 1,
  title: "Equilateral Triangle",
  subtitle: "Build the Elements",
  playerGoal: "Build a triangle on AB where all three sides are equal.",
  originalStatement: "On a given finite straight line to construct an equilateral triangle.",
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
    },
  ],
  allowedTools: ["select", "straightedge", "compass", "intersection"],
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
      text: "We begin with the given finite straight line AB.",
    },
    {
      id: "circle-a",
      highlight: ["circleA", "segmentAB", "pointA", "pointB"],
      text: "You drew a circle with center A through B.",
    },
    {
      id: "radius-a",
      highlight: ["circleA", "segmentAC", "segmentAB", "pointA", "pointB", "pointC"],
      text: "Because C lies on this circle, AC is equal to AB.",
    },
    {
      id: "circle-b",
      highlight: ["circleB", "segmentAB", "pointA", "pointB"],
      text: "You drew a second circle with center B through A.",
    },
    {
      id: "radius-b",
      highlight: ["circleB", "segmentBC", "segmentAB", "pointA", "pointB", "pointC"],
      text: "Because C lies on this circle, BC is equal to AB.",
    },
    {
      id: "equality-transfer",
      highlight: ["segmentAB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      text: "AC and BC are both equal to AB, so all three sides are equal.",
    },
    {
      id: "equilateral",
      highlight: ["triangleABC", "segmentAB", "segmentAC", "segmentBC", "pointA", "pointB", "pointC"],
      text: "Therefore, triangle ABC is equilateral.",
    },
    {
      id: "euclidean-reveal",
      highlight: ["triangleABC", "segmentAB", "segmentAC", "segmentBC"],
      text: "Therefore, on the given finite straight line AB, an equilateral triangle has been constructed.",
    },
  ],
};
