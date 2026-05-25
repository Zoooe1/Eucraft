import type { EuclidProposition, GeometryObject, ReplayStep } from "../geometry/types";
import { book1ExtendedSpecs } from "./book1ExtendedData";

const emptyObjects: GeometryObject[] = [];

function infrastructureReplay(...texts: string[]): ReplayStep[] {
  return texts.map((text, index) => ({
    id: `infrastructure-${index + 1}`,
    highlight: [],
    text,
  }));
}

export const euclidPropositions: EuclidProposition[] = [
  {
    id: "I.1",
    book: 1,
    number: 1,
    title: "Equilateral Triangle",
    originalStatement: "To construct an equilateral triangle on a given finite straight-line.",
    playerGoal: "Build a triangle on AB where all three sides are equal.",
    type: "construction",
    dependencies: [],
    unlocks: ["unlock-I.1-equilateral", "token-equilateral-triangle"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "isEquilateralTriangle",
      description: "Confirm that AB, AC, and BC are equal and non-collinear.",
      hiddenConstraints: ["hasThreeEqualSides", "circleRadiusEquality"],
    },
    replaySteps: infrastructureReplay(
      "Construct the two circles on AB and choose their intersection C.",
      "Radius equality and Common Notion 1 prove all three sides equal.",
      "Build Equilateral Triangle becomes an earned theorem-action for later propositions.",
    ),
  },
  {
    id: "I.2",
    book: 1,
    number: 2,
    title: "Transfer Length to Point",
    originalStatement: "To place a straight-line equal to a given straight-line at a given point.",
    playerGoal: "Transfer a given length so it starts from a chosen point.",
    type: "construction",
    dependencies: ["I.1"],
    unlocks: ["unlock-I.2-transfer-length", "unlock-I.2-set-compass-width", "token-transferred-length"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "verifyTransferredSegment",
      description: "Confirm that the segment placed at A equals the given segment BC.",
      hiddenConstraints: ["equalByRemainder"],
    },
    replaySteps: infrastructureReplay(
      "Use I.1, extensions, and circles to place AL from the point A.",
      "Equal radii and equal remainders prove AL equals BC.",
      "Transfer Length to Point becomes an earned theorem-action, not a primitive copy tool.",
    ),
  },
  {
    id: "I.3",
    book: 1,
    number: 3,
    title: "Cut Off Equal Segment",
    originalStatement: "For two given unequal straight-lines, to cut off from the greater a straight-line equal to the lesser.",
    playerGoal: "Cut a piece from the longer segment equal to the shorter segment.",
    type: "construction",
    dependencies: ["I.2"],
    unlocks: ["unlock-I.3-cut-off", "token-cut-off-segment"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "cutSegmentEqualsTarget",
      description: "Confirm that E lies on AB and AE equals the lesser given segment.",
      hiddenConstraints: ["isPointBetween", "compareSegmentLengths"],
    },
    replaySteps: infrastructureReplay(
      "Use I.2 to set the compass width to the lesser line CD.",
      "A circle centered at A with that transferred width cuts the greater line at the required distance.",
      "Cut Off Equal Segment becomes available for later constructions.",
    ),
  },
  {
    id: "I.4",
    book: 1,
    number: 4,
    title: "SAS Triangle Match",
    originalStatement:
      "If two triangles have two sides equal to two sides respectively, and the included angles equal, then their bases and remaining corresponding angles are equal.",
    playerGoal: "Recognize triangle equality from two sides and the included angle.",
    type: "theorem",
    dependencies: ["I.3"],
    unlocks: ["unlock-I.4-sas"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "validateSASCongruence",
      description: "Infer corresponding parts from two sides and the included angle.",
    },
    replaySteps: infrastructureReplay(
      "Match two sides and the included angle in two triangles.",
      "Coincidence proves the bases, triangles, and remaining corresponding angles equal.",
      "SAS Triangle Match enters the Reasoning Library.",
    ),
  },
  {
    id: "I.5",
    book: 1,
    number: 5,
    title: "Isosceles Base Angles",
    originalStatement:
      "In isosceles triangles, the angles at the base are equal, and if the equal sides are extended, the angles under the base are also equal.",
    playerGoal: "Use equal sides to infer equal base angles.",
    type: "theorem",
    dependencies: ["I.3", "I.4"],
    unlocks: ["unlock-I.5-isosceles-base-angles"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "inferBaseAnglesEqual",
      description: "Infer equal base angles from equal sides.",
    },
    replaySteps: infrastructureReplay(
      "Extend the equal sides and cut equal auxiliary pieces.",
      "Use SAS and subtraction of equal angles to prove the base angles equal.",
      "Isosceles Base Angles becomes a reasoning rule, not a drawing tool.",
    ),
  },
  {
    id: "I.6",
    book: 1,
    number: 6,
    title: "Equal Angles, Equal Sides",
    originalStatement: "If a triangle has two equal angles, then the sides subtending those angles are equal.",
    playerGoal: "Use equal angles to infer equal opposite sides.",
    type: "theorem",
    dependencies: ["I.3", "I.4", "I.5"],
    unlocks: ["unlock-I.6-converse-isosceles"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "inferEqualSidesFromEqualAngles",
      description: "Infer equal sides from equal angles by contradiction.",
      hiddenConstraints: ["contradictionWholeGreaterThanPart"],
    },
    replaySteps: infrastructureReplay(
      "Assume the sides opposite equal angles are unequal.",
      "Cut off an equal part and use SAS to force an impossible equality of whole and part.",
      "Equal Angles, Equal Sides becomes a reasoning rule.",
    ),
  },
  {
    id: "I.7",
    book: 1,
    number: 7,
    title: "Unique Point from Two Distances",
    originalStatement:
      "On the same straight-line, two other straight-lines equal respectively to two given straight-lines cannot meet at a different point on the same side.",
    playerGoal: "Understand that two fixed distances from A and B determine only one point on the same side of AB.",
    type: "theorem",
    dependencies: ["I.5"],
    unlocks: ["unlock-I.7-two-distance-uniqueness"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "assertUniquePointFromTwoDistances",
      description: "Prevent duplicate apex points from the same two distances on the same side.",
      hiddenConstraints: ["detectSameSideOfLine", "preventDuplicateTriangleApex"],
    },
    replaySteps: infrastructureReplay(
      "Assume two different same-side points share the same two distances from the base endpoints.",
      "Use I.5 to derive an impossible angle relation.",
      "Unique Point from Two Distances becomes a hidden engine constraint.",
    ),
  },
  {
    id: "I.8",
    book: 1,
    number: 8,
    title: "SSS Triangle Match",
    originalStatement:
      "If two triangles have two sides equal to two sides respectively, and the base equal to the base, then the included angles are equal.",
    playerGoal: "Recognize triangle equality from three matching sides.",
    type: "theorem",
    dependencies: ["I.7"],
    unlocks: ["unlock-I.8-sss"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "validateSSSCongruence",
      description: "Infer included angle equality from three matching sides.",
    },
    replaySteps: infrastructureReplay(
      "Match the base and the two remaining sides of two triangles.",
      "I.7 forbids a second apex with the same endpoint distances on the same side.",
      "SSS Triangle Match enters the Reasoning Library.",
    ),
  },
  {
    id: "I.9",
    book: 1,
    number: 9,
    title: "Bisect Angle",
    originalStatement: "To cut a given rectilinear angle in half.",
    playerGoal: "Bisect an angle.",
    type: "construction",
    dependencies: ["I.1", "I.3", "I.8"],
    unlocks: ["unlock-I.9-angle-bisector"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "validateAngleBisector",
      description: "Confirm that the constructed ray cuts the angle into two equal angles.",
      hiddenConstraints: ["pointInsideAngle", "equalAnglesWithinTolerance"],
    },
    replaySteps: infrastructureReplay(
      "Cut equal points on the two sides of the angle with I.3.",
      "Build an equilateral triangle with I.1 and use SSS from I.8.",
      "Bisect Angle becomes an earned theorem-action.",
    ),
  },
  {
    id: "I.10",
    book: 1,
    number: 10,
    title: "Bisect Segment / Find Midpoint",
    originalStatement: "To cut a given finite straight-line in half.",
    playerGoal: "Find the midpoint of a segment.",
    type: "construction",
    dependencies: ["I.1", "I.4", "I.9"],
    unlocks: ["unlock-I.10-segment-bisector"],
    initialObjects: emptyObjects,
    validationGoal: {
      id: "validateMidpoint",
      description: "Confirm that D lies on AB and AD equals DB.",
      hiddenConstraints: ["splitSegmentIntoEqualHalves"],
    },
    replaySteps: infrastructureReplay(
      "Build an equilateral triangle on the segment and bisect its apex angle.",
      "Use SAS from I.4 to prove the two halves of the base equal.",
      "Bisect Segment / Find Midpoint becomes an earned theorem-action.",
    ),
  },
  ...book1ExtendedSpecs.map((spec): EuclidProposition => ({
    id: `I.${spec.number}`,
    book: 1,
    number: spec.number,
    title: spec.title,
    originalStatement: spec.originalStatement,
    playerGoal: spec.playerGoal,
    type: spec.type,
    dependencies: spec.dependencies,
    unlocks: spec.unlocks,
    initialObjects: emptyObjects,
    constructionGuide: spec.constructionGuide,
    validationGoal: spec.validationGoal,
    replaySteps: spec.replaySteps,
  })),
];

export function getEuclidProposition(id: string): EuclidProposition | undefined {
  return euclidPropositions.find((proposition) => proposition.id === id);
}
